'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GeoServerMap from '@/components/GeoServerMap';
import LayerTable from '@/components/LayerTable';

const Page: React.FC = () => {
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(layers[0]);
  const [selectedLayerData, setSelectedLayerData] = useState({});
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [extent, setExtent] = useState([]);

  useEffect(() => {
    // Fetch the data from the backend
    axios.get('/api/gis/layers/').then((response) => {
      const responseData = response.data;
      setLayers(responseData.layers);
    });
  }, []);

  const handleSelection = (layer) => {
    setSelectedLayer(layer);
    setHeaders([]);
    setData([]);
    setExtent([]);
    axios.get(`/api/gis/layer/${layer.id}/`).then((response) => {
      const responseData = response.data;
      setHeaders(['Feature ID', ...responseData.headers]);
      setData(responseData.data);
      setExtent(responseData.extent);
    });
  };

  return (
    <div className="flex flex-col h-screen" style={{ marginTop: -72 }}>
      {/* Content */}
      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 72 }}>
        {/* Left Pane */}
        <div className="w-1/4 p-2 bg-white overflow-auto border-r">
          <ul>
            {layers.map((layer) => (
              <li
                key={layer.id}
                className={`p-2 cursor-pointer rounded-lg hover:bg-gray-800 hover:bg-opacity-5 ${selectedLayer && selectedLayer.id === layer.id ? 'bg-gray-800 bg-opacity-10' : 'bg-white'}`}
                onClick={() => handleSelection(layer)}
              >
                {layer.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Pane */}
        <div className="flex-1 bg-white overflow-auto">
          {selectedLayer && (
            <div>
              <GeoServerMap layer={selectedLayer.id} extent={extent} />
              <h1 className="p-2 font-bold">{selectedLayer.name}</h1>
              <LayerTable headers={headers} data={data} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
