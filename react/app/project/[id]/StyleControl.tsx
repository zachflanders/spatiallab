import React, { useState, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';

export interface StyleOptions {
  fillColor: string;
  strokeColor: string;
  lineWidth: number;
  fillOpacity: number;
  strokeOpacity: number;
}

interface StyleControlProps {
  onUpdateStyle: (styleOptions: StyleOptions) => void;
}

const StyleControl: React.FC<StyleControlProps> = ({ onUpdateStyle }) => {
  const [fillColor, setFillColor] = useState<string>('#ff0000');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [fillOpacity, setFillOpacity] = useState<number>(0.5);
  const [strokeOpacity, setStrokeOpacity] = useState<number>(1);
  const [activePicker, setActivePicker] = useState<'fill' | 'stroke' | null>(
    null,
  );

  const handleStyleChange = () => {
    onUpdateStyle({
      fillColor,
      strokeColor,
      lineWidth,
      fillOpacity,
      strokeOpacity,
    });
  };

  const handleFillColorChange = (color: ColorResult) => {
    setFillColor(color.hex);
  };

  const handleStrokeColorChange = (color: ColorResult) => {
    setStrokeColor(color.hex);
  };

  const openFillPicker = () => {
    activePicker === 'fill' ? setActivePicker(null) : setActivePicker('fill');
  };

  const openStrokePicker = () => {
    activePicker === 'stroke'
      ? setActivePicker(null)
      : setActivePicker('stroke');
  };
  useEffect(() => {
    handleStyleChange();
  }, [fillColor, strokeColor, lineWidth, fillOpacity, strokeOpacity]);

  return (
    <div className="style-control">
      <div className="flex items-center space-x-2">
        <div>
          <button
            className="flex items-center space-x-2 p-2 hover:bg-gray-200 bg-gray-100 text-gray-700 rounded hover:text-gray-900 focus:outline-none"
            onClick={openFillPicker}
          >
            Fill Color
          </button>
          {activePicker === 'fill' && (
            <SketchPicker
              color={fillColor}
              onChangeComplete={handleFillColorChange}
            />
          )}
        </div>

        <div>
          <button
            className="flex items-center space-x-2 p-2 hover:bg-gray-200 bg-gray-100 text-gray-700 rounded hover:text-gray-900 focus:outline-none"
            onClick={openStrokePicker}
          >
            Stroke Color
          </button>
          {activePicker === 'stroke' && (
            <SketchPicker
              color={strokeColor}
              onChangeComplete={handleStrokeColorChange}
            />
          )}
        </div>
      </div>

      <div>
        <h4>Line Width</h4>
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => {
            setLineWidth(Number(e.target.value));
          }}
        />
      </div>

      <div>
        <h4>Fill Opacity</h4>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={fillOpacity}
          onChange={(e) => {
            setFillOpacity(Number(e.target.value));
          }}
        />
      </div>

      <div>
        <h4>Stroke Opacity</h4>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={strokeOpacity}
          onChange={(e) => {
            setStrokeOpacity(Number(e.target.value));
          }}
        />
      </div>
    </div>
  );
};

export default StyleControl;
