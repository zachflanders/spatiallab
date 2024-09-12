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
import { Layer, ProjectLayer } from './types';
import { PlusIcon } from '@heroicons/react/20/solid';

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

export default function Page({ params }: PageProps) {
  const [map, setMap] = useState<Map | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [projectLayers, setProjectLayers] = useState<ProjectLayer[]>([]);
  const [mapLayers, setMapLayers] = useState<MapLayerProps[]>([]);

  useEffect(() => {
    api.get(`/gis/projects/${params.id}/`).then((response) => {
      const responseData = response.data;
      console.log(responseData);
      setProjectLayers(
        responseData.project_layers.map((projectLayer: ProjectLayer) => {
          const { id, ...layerWithoutId } = projectLayer.layer;
          return {
            id: projectLayer.id,
            layerId: id,
            layer: projectLayer.layer,
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
    projectLayers.forEach((projectLayer) => {
      if (
        !mapLayers.find(
          (mapLayer) => mapLayer.projectLayerId === projectLayer.id,
        )
      ) {
        console.log('Adding layer to map:', projectLayer);
        addLayerToMap(projectLayer);
      }
    });
    mapLayers.forEach((mapLayer) => {
      if (
        !projectLayers.find(
          (projectLayer) => projectLayer.id === mapLayer.projectLayerId,
        )
      ) {
        console.log('Removing layer from map:', mapLayer);
        removeLayerFromMap(mapLayer.projectLayerId);
      }
    });
    if (projectLayers.length === 0) {
      mapLayers.forEach((mapLayer) => {
        console.log('Removing layer from map:', mapLayer);
        removeLayerFromMap(mapLayer.projectLayerId);
      });
    }
  }, [projectLayers, mapLayers]);

  const openModal = () => {
    setIsModalOpen(true);

    // Fetch layers from the API
    api.get('/gis/layers/').then((response) => {
      console.log(response.data);
      setLayers(response.data.layers);
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLayer(null);
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
    console.log('Adding layer:', selectedLayer);
    if (!selectedLayer) return;
    api
      .post(`/gis/project-layers/`, {
        layer_id: selectedLayer.id,
        project: params.id,
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
        setProjectLayers([...projectLayers, newProjectLayer]);
        closeModal();
      });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Toolbar */}
      <header className="flex justify-between items-center bg-white shadow-md p-4 border-b">
        <div className="space-x-4">
          <button
            className="flex items-center space-x-2 p-2 hover:bg-gray-200 bg-gray-100 text-gray-700 rounded hover:text-gray-900 focus:outline-none"
            onClick={openModal}
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Layer</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <Sidebar
          projectLayers={projectLayers}
          setProjectLayers={setProjectLayers}
        />

        {/* Map Container */}
        <main className="flex-grow relative">
          <div id="map" className="w-full h-full"></div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
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
    </div>
  );
}
