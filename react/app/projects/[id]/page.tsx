'use client';
import { use, useEffect, useState } from 'react';
import api from '../../api';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorTileLayer from 'ol/layer/VectorTile';
import MVT from 'ol/format/MVT';
import VectorTileSource from 'ol/source/VectorTile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import Sidebar from './Sidebar';
import { Layer, ProjectLayer, Basemap } from '../../projects/[id]/types';
import { PlusIcon, ArrowsPointingOutIcon } from '@heroicons/react/20/solid';
import StyleControl, { StyleOptions } from '../../projects/[id]/StyleControl';
import { applyStyleToLayer } from '../../utils/styleUtils';
import { set } from 'ol/transform';

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

function generateUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export default function Page({ params }: PageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeModal, setActiveModal] = useState<'add' | 'style' | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<Layer | Basemap | null>(
    null,
  );
  const [selectedStylingLayer, setSelectedStylingLayer] = useState<
    VectorTileLayer | TileLayer | null
  >(null);

  const [layerStyle, setLayerStyle] = useState<StyleOptions | null>(null);
  const [fooLayers, setFooLayers] = useState<(TileLayer | VectorTileLayer)[]>(
    [],
  );

  useEffect(() => {
    const newMap = new Map({
      target: 'map',
      layers: [],
      view: new View({
        center: undefined,
        zoom: undefined,
      }),
    });

    setMap(newMap);
    api.get(`/gis/projects/${params.id}/`).then((response) => {
      setProject({
        name: response.data.name,
        id: response.data.id,
        extent: response.data.extent ?? null,
      });
      const intialLayers = response.data.project_layers.map(
        (projectLayer: ProjectLayer) => {
          if (!projectLayer.basemap) {
            const layer = new VectorTileLayer({
              source: new VectorTileSource({
                format: new MVT(),
                url: `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_TILESERV_URL}/public.layer_${projectLayer.layer.id}_features/{z}/{x}/{y}.pbf`,
              }),
            });
            const defaultStyle = {
              fillColor: 'rgba(59, 130, 246, 0.2)',
              strokeColor: 'rgba(59, 130, 246, 0.6)',
              lineWidth: 1,
            };
            layer.setProperties({
              name: projectLayer.layer.name,
              id: projectLayer.id,
              layerId: projectLayer.layer.id,
              isVisible: projectLayer.visible,
              style: projectLayer.style ? projectLayer.style : defaultStyle,
            });
            if (projectLayer.style) {
              const { fillColor, strokeColor, lineWidth } = projectLayer.style;
              applyStyleToLayer(layer, { fillColor, strokeColor, lineWidth });
            } else {
              applyStyleToLayer(layer, defaultStyle);
            }
            layer.setVisible(projectLayer.visible);
            return layer;
          } else if (projectLayer.basemap === 'osm') {
            const source = new OSM();
            const layer = new TileLayer({
              source: source,
            });
            layer.setProperties({
              name: 'Open Street Map',
              id: projectLayer.id,
              isVisible: projectLayer.visible,
            });
            return layer;
          }
        },
      );
      setFooLayers(intialLayers);
    });

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
      });
    } else {
      if (!map) return;
      map.getView().setCenter([0, 0]);
      map.getView().setZoom(2);
    }
  }, [project?.extent]);

  useEffect(() => {
    if (map && fooLayers.length > 0) {
      map.setLayers(fooLayers);
    }
  }, [fooLayers, map]);

  const openAddLayerModal = () => {
    setActiveModal('add');
    api.get('/gis/layers/').then((response) => {
      setLayers(response.data.layers);
    });
  };

  const openStylingModal = (layer: VectorTileLayer | TileLayer) => {
    setSelectedStylingLayer(layer);
    setActiveModal('style');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedLayer(null);
    setSelectedStylingLayer(null);
  };

  const addLayer = () => {
    if (!selectedLayer) return;
    const body = {
      project: project?.id,
      ...('id' in selectedLayer && { layer_id: selectedLayer.id }),
      ...('basemap' in selectedLayer && { basemap: selectedLayer.basemap }),
    };
    api.post(`/gis/project-layers/`, body).then((response) => {
      const newProjectLayerId = response.data.id;
      const isVisible = response.data.visible;
      if ('id' in selectedLayer) {
        const { id, ...layerWithoutId } = selectedLayer;
        const newProjectLayer = {
          id: newProjectLayerId,
          layerId: id,
          layer: selectedLayer,
          ...layerWithoutId,
        };
      } else {
        const newProjectLayer = {
          id: newProjectLayerId,
          layer: selectedLayer,
          ...selectedLayer,
        };
      }
      if ('basemap' in selectedLayer) {
        const newLayer = new TileLayer({
          source: new OSM(),
        });
        newLayer.setProperties({
          name: selectedLayer.name,
          id: newProjectLayerId,
          isVisible: isVisible,
        });
        setFooLayers([...fooLayers, newLayer]);
      } else {
        const newLayer = new VectorTileLayer({
          source: new VectorTileSource({
            format: new MVT(),
            url: `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_TILESERV_URL}/public.layer_${selectedLayer.id}_features/{z}/{x}/{y}.pbf`,
          }),
        });
        newLayer.setProperties({
          name: selectedLayer.name,
          id: newProjectLayerId,
          layerId: selectedLayer.id,
          isVisible: isVisible,
        });

        setFooLayers([...fooLayers, newLayer]);
      }
    });
    closeModal();
  };

  const updateLayerStyle = (style: StyleOptions) => {
    setLayerStyle(style);
  };

  const applyLayerStyle = () => {
    if (!selectedStylingLayer) return;
    if (!map) return;
    if (!layerStyle) return;

    const mapLayer = fooLayers.find(
      (layer) =>
        layer.getProperties().id === selectedStylingLayer.getProperties().id,
    );

    if (mapLayer) {
      applyStyleToLayer(mapLayer, layerStyle);
      mapLayer.setProperties({
        ...mapLayer.getProperties(),
        style: layerStyle,
      });
      console.log(mapLayer.getProperties());
      setFooLayers(
        fooLayers.map((layer) => {
          if (
            layer.getProperties().id === selectedStylingLayer.getProperties().id
          ) {
            return mapLayer;
          }
          return layer;
        }),
      );
      map.render();
    }
    api.put(`/gis/project-layers/${selectedStylingLayer.getProperties().id}/`, {
      layer_id: selectedStylingLayer.getProperties().layerId,
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
      <header className="flex justify-between items-center bg-white p-4 border-b">
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
          project={project}
          projectLayers={fooLayers}
          setProjectLayers={setFooLayers}
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="w-full md:w-1/2 sm:w-5/6 mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-bold mb-4">Select a Layer to Add</h2>
            <h3 className="text-lg font-bold mb-2">Your Layers</h3>
            <ul className="h-80 overflow-auto">
              {layers.map((layer) => (
                <li key={layer.id} className="mb-2">
                  <button
                    className={`w-full text-left p-2 rounded ${
                      (selectedLayer &&
                        'id' in selectedLayer &&
                        selectedLayer.id) === layer.id
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
            <h3 className="text-lg font-bold mb-2">Basemaps</h3>
            <ul>
              <li>
                <button
                  className={`w-full text-left p-2 rounded ${
                    selectedLayer && selectedLayer.name === 'Open Street Map'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}
                  onClick={() =>
                    setSelectedLayer({
                      name: 'Open Street Map',
                      basemap: 'osm',
                      visible: true,
                    })
                  }
                >
                  OpenStreetMap
                </button>
              </li>
            </ul>

            <div className="flex justify-start space-x-4 mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex justify-center items-center">
          <div className="w-full md:w-1/2 sm:w-5/6 mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white">
            <h2 className="text-xl font-bold mb-4">Style Layer</h2>
            {selectedStylingLayer && (
              <div>
                <span>{selectedStylingLayer.getProperties().name}</span>
                {selectedStylingLayer instanceof VectorTileLayer && (
                  <StyleControl
                    selectedStylingLayer={selectedStylingLayer}
                    onUpdateStyle={updateLayerStyle}
                  />
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
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
