'use client';
import { useEffect, useState } from 'react';
import api from '../../api';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import MVT from 'ol/format/MVT';
import VectorTileSource from 'ol/source/VectorTile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import Sidebar from './Sidebar';
import { Layer, ProjectLayer } from './types';
import { PlusIcon, ArrowsPointingOutIcon } from '@heroicons/react/20/solid';
import { Style, Fill, Stroke } from 'ol/style';
import StyleControl, { StyleOptions } from './StyleControl';
import { applyStyleToLayer } from '../../utils/styleUtils';

interface PageProps {
  params: {
    id: number;
  };
}

interface MapLayerProps {
  projectLayerId: number;
  layerId: number;
  visible: boolean;
  extent?: number[];
  tileLayer: VectorTileLayer;
}

interface Project {
  id: number;
  name: string;
  extent?: number[];
}

export default function Page({ params }: PageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeModal, setActiveModal] = useState<'add' | 'style' | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [selectedStylingLayer, setSelectedStylingLayer] =
    useState<ProjectLayer | null>(null);
  const [projectLayers, setProjectLayers] = useState<ProjectLayer[]>([]);
  const [mapLayers, setMapLayers] = useState<MapLayerProps[]>([]);
  const [layerStyle, setLayerStyle] = useState<StyleOptions | null>(null);

  useEffect(() => {
    api.get(`/gis/projects/${params.id}/`).then((response) => {
      setProject({
        name: response.data.name,
        id: response.data.id,
        extent: response.data.extent ?? null,
      });
      setProjectLayers(
        response.data.project_layers.map((projectLayer: ProjectLayer) => {
          const { id, ...layerWithoutId } = projectLayer.layer;
          return {
            id: projectLayer.id,
            layerId: id,
            layer: projectLayer.layer,
            style: projectLayer.style,
            ...layerWithoutId,
          };
        }),
      );
    });
    // Initialize OpenLayers map
    const newMap = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    setMap(newMap);
    return () => {
      newMap.setTarget('');
    };
  }, [params.id]);

  useEffect(() => {
    if (project?.extent) {
      if (!map) return;
      map.getView().fit(project.extent, {
        size: map.getSize(),
        maxZoom: 18, // Adjust maxZoom as needed
        duration: 500,
      });
    }
  }, [project?.extent]);

  useEffect(() => {
    projectLayers.forEach((projectLayer) => {
      if (
        !mapLayers.find(
          (mapLayer) => mapLayer.projectLayerId === projectLayer.id,
        )
      ) {
        addLayerToMap(projectLayer);
      }
    });
    mapLayers.forEach((mapLayer) => {
      if (
        !projectLayers.find(
          (projectLayer) => projectLayer.id === mapLayer.projectLayerId,
        )
      ) {
        removeLayerFromMap(mapLayer.projectLayerId);
      }
    });
    if (projectLayers.length === 0) {
      mapLayers.forEach((mapLayer) => {
        removeLayerFromMap(mapLayer.projectLayerId);
      });
    }
  }, [projectLayers, mapLayers]);

  const openAddLayerModal = () => {
    setActiveModal('add');

    // Fetch layers from the API
    api.get('/gis/layers/').then((response) => {
      setLayers(response.data.layers);
    });
  };

  const openStylingModal = (layer: ProjectLayer) => {
    setSelectedStylingLayer(layer);
    setActiveModal('style');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedLayer(null);
    setSelectedStylingLayer(null);
  };

  const removeLayerFromMap = (projectLayerId: number) => {
    if (!map) return;

    const mapLayer = mapLayers.find(
      (mapLayer) => mapLayer.projectLayerId === projectLayerId,
    );
    if (mapLayer) {
      map.removeLayer(mapLayer.tileLayer);
      setMapLayers((prevLayers) =>
        prevLayers.filter(
          (prevLayer) => prevLayer.projectLayerId !== projectLayerId,
        ),
      );
    }
  };

  const addLayerToMap = (selectedLayer: ProjectLayer) => {
    if (!selectedLayer || !map) return;

    const newMapLayer: MapLayerProps = {
      projectLayerId: selectedLayer.id,
      layerId: selectedLayer.layerId,
      visible: true,
      tileLayer: new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVT(),
          url: `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_TILESERV_URL}/public.layer_${selectedLayer.layerId}_features/{z}/{x}/{y}.pbf`,
        }),
      }),
    };

    if (selectedLayer.style) {
      const style = new Style({
        fill: new Fill({
          color: selectedLayer.style.fillColor,
        }),
        stroke: new Stroke({
          color: selectedLayer.style.strokeColor,
          width: selectedLayer.style.strokeWidth,
        }),
      });
      newMapLayer.tileLayer.setStyle(style);
    }

    map.addLayer(newMapLayer.tileLayer);

    setMapLayers((prevLayers) => [...prevLayers, newMapLayer]);

    // Zoom to the selected layer's extent
    if (newMapLayer.extent) {
      map.getView().fit(newMapLayer.extent, {
        size: map.getSize(),
        maxZoom: 18, // Adjust maxZoom as needed
      });
    }
  };

  const addLayer = () => {
    if (!selectedLayer) return;
    api
      .post(`/gis/project-layers/`, {
        layer_id: selectedLayer.id,
        project: project?.id,
      })
      .then((response) => {
        const { id, ...layerWithoutId } = selectedLayer;
        const newProjectLayerId = response.data.id;
        const newProjectLayer = {
          id: newProjectLayerId,
          layerId: id,
          layer: selectedLayer,
          ...layerWithoutId,
        };
        setProjectLayers([
          ...projectLayers,
          { ...newProjectLayer, style: null },
        ]);
        closeModal();
      });
  };

  const updateLayerStyle = (style: StyleOptions) => {
    setLayerStyle(style);
  };

  const applyLayerStyle = () => {
    if (!selectedStylingLayer) return;
    if (!map) return;
    if (!layerStyle) return;

    const mapLayer = mapLayers.find(
      (layer) => layer.projectLayerId === selectedStylingLayer.id,
    );

    if (mapLayer) {
      applyStyleToLayer(mapLayer.tileLayer, layerStyle);
      map.render();
    }
    api.put(`/gis/project-layers/${selectedStylingLayer.id}/`, {
      layer_id: selectedStylingLayer.layerId,
      project: project?.id,
      style: layerStyle,
    });
    closeModal();
  };

  const updateExtent = () => {
    if (!map) return;
    const extent = map.getView().calculateExtent(map.getSize());
    api.put(`/gis/projects/${project?.id}/`, {
      name: project?.name,
      extent: extent,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Toolbar */}
      <header className="flex justify-between items-center bg-white shadow-md p-4 border-b">
        <div className="space-x-2 flex items-center">
          <button
            className="flex items-center space-x-2 p-2 hover:bg-gray-200 bg-gray-100 text-gray-700 rounded hover:text-gray-900 focus:outline-none"
            onClick={openAddLayerModal}
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Layer</span>
          </button>

          <button
            className="flex items-center space-x-2 p-2 hover:bg-gray-200 bg-gray-100 text-gray-700 rounded hover:text-gray-900 focus:outline-none"
            onClick={updateExtent}
          >
            <ArrowsPointingOutIcon className="h-4 w-4" />
            <span>Set Map Extent</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <Sidebar
          projectLayers={projectLayers}
          setProjectLayers={setProjectLayers}
          setActiveModal={setActiveModal}
          setSelectedStylingLayer={setSelectedStylingLayer}
        />

        {/* Map Container */}
        <main className="flex-grow relative">
          <div id="map" className="w-full h-full"></div>
        </main>
      </div>

      {/* Modal */}
      {activeModal === 'add' && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Select a Layer to Add</h2>
            <ul>
              {layers.map((layer) => (
                <li key={layer.id} className="mb-2">
                  <button
                    className={`w-full text-left p-2 rounded ${
                      selectedLayer?.id === layer.id
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                    onClick={() => setSelectedLayer(layer)}
                  >
                    {layer.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={addLayer}
                disabled={!selectedLayer}
              >
                Add Layer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {activeModal === 'style' && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-3/4">
            <h2 className="text-xl font-bold mb-4">Style Layer</h2>
            {selectedStylingLayer && (
              <div>
                <span>{selectedStylingLayer.name}</span>
                <StyleControl onUpdateStyle={updateLayerStyle} />
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  applyLayerStyle();
                }}
                disabled={!selectedStylingLayer}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
