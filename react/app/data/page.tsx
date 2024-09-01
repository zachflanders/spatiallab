'use client';
import React, { useState } from 'react';

const layers = [
  { id: 1, name: 'Layer 1', info: 'Information about Layer 1' },
  { id: 2, name: 'Layer 2', info: 'Information about Layer 2' },
  { id: 3, name: 'Layer 3', info: 'Information about Layer 3' },
  // Add more layers as needed
];

const Page: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState(layers[0]);

  return (
    <div className="flex flex-col h-screen" style={{ marginTop: -72 }}>
      {/* Content */}
      <div className="flex flex-1 overflow-hidden" style={{ paddingTop: 72 }}>
        {/* Left Pane */}
        <div className="w-1/4 bg-gray-200 p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Layers</h2>
          <ul>
            {layers.map((layer) => (
              <li
                key={layer.id}
                className={`p-2 cursor-pointer ${selectedLayer.id === layer.id ? 'bg-blue-300' : 'bg-white'}`}
                onClick={() => setSelectedLayer(layer)}
              >
                {layer.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Pane */}
        <div className="flex-1 bg-white p-4 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Layer Information</h2>
          <p>{selectedLayer.info}</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
