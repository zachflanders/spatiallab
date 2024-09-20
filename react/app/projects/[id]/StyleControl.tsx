import React, { useState, useEffect } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { ProjectLayer } from './types';
import { AnyARecord } from 'dns';
import VectorTileLayer from 'ol/layer/VectorTile';
import TileLayer from 'ol/layer/Tile';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import { set } from 'ol/transform';

export interface StyleOptions {
  fillColor: any;
  strokeColor: any;
  lineWidth: number;
}

interface StyleControlProps {
  selectedStylingLayer: VectorTileLayer;
  onUpdateStyle: (styleOptions: StyleOptions) => void;
}

const StyleControl: React.FC<StyleControlProps> = ({
  selectedStylingLayer,
  onUpdateStyle,
}) => {
  const [fillColor, setFillColor] = useState<any>('rgba(255,0,0,0.6)');
  const [strokeColor, setStrokeColor] = useState<any>('rgba(0,0,0,1)');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [activePicker, setActivePicker] = useState<'fill' | 'stroke' | null>(
    null,
  );

  useEffect(() => {
    if (!selectedStylingLayer) return;
    let stylelike = selectedStylingLayer.getStyle();
    console.log(stylelike);
    console.log(typeof stylelike);
    console.log(stylelike instanceof Style);
    if (stylelike instanceof Style) {
      // If it's a single Style object
      setStyleProperties(stylelike);
    }

    function setStyleProperties(style: Style) {
      console.log(style);
      if (style.getFill()) {
        const fillColor = style.getFill();
        if (fillColor) {
          const color = fillColor.getColor();
          setFillColor(color);
        }
      }

      if (style.getStroke()) {
        const stroke = style.getStroke();
        if (stroke) {
          const color = stroke.getColor();
          setStrokeColor(color);
          const width = stroke.getWidth();
          if (width) {
            setLineWidth(width);
          }
        }
      }
    }
  }, [selectedStylingLayer]);

  const handleStyleChange = () => {
    onUpdateStyle({
      fillColor: `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, ${fillColor.a})`,
      strokeColor: `rgba(${strokeColor.r}, ${strokeColor.g}, ${strokeColor.b}, ${strokeColor.a})`,
      lineWidth,
    });
  };

  const handleFillColorChange = (color: ColorResult) => {
    console.log(color);
    setFillColor(color.rgb);
  };

  const handleStrokeColorChange = (color: ColorResult) => {
    setStrokeColor(color.rgb);
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
  }, [fillColor, strokeColor, lineWidth]);

  return (
    <div className="style-control">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            className="flex items-center space-x-2 p-2 hover:bg-gray-200 bg-gray-100 text-gray-700 rounded hover:text-gray-900 focus:outline-none"
            onClick={openFillPicker}
          >
            Fill Color
          </button>
          {activePicker === 'fill' && (
            <div className="absolute z-50">
              <SketchPicker
                color={fillColor}
                onChangeComplete={handleFillColorChange}
              />
            </div>
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
    </div>
  );
};

export default StyleControl;
