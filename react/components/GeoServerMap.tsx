import React, { use, useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { VectorTile } from 'ol/layer';
import MVT from 'ol/format/MVT';
import XYZ from 'ol/source/XYZ';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import 'ol/ol.css';
import { set } from 'ol/transform';

export interface MapProps {
  layer: number;
  extent?: [number, number, number, number] | [];
  selectedFeatures: number[];
  setSelectedFeatures: React.Dispatch<React.SetStateAction<number[]>>;
}

const GeoServerMap: React.FC<MapProps> = ({
  layer,
  extent,
  selectedFeatures,
  setSelectedFeatures,
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorTileLayerRef = useRef<VectorTileLayer | null>(null);

  const mapStyle = new Style({
    stroke: new Stroke({
      color: 'rgba(37, 99, 235, 0.6)',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(37, 99, 235,0.1)',
    }),
  });

  const selectedStyle = new Style({
    stroke: new Stroke({
      color: 'rgba(234, 179, 8, 0.6)',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(254, 240, 138,0.4)',
    }),
  });

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_TILESERV_URL}/`,
    );
    if (mapRef.current) {
      const vectorTileLayer = new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVT(),
          url: `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_TILESERV_URL}/public.layer_${layer}_features/{z}/{x}/{y}.pbf`,
        }),
      });

      const osmLayer = new TileLayer({
        source: new XYZ({
          url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          crossOrigin: 'anonymous',
        }),
      });

      const map = new Map({
        target: mapRef.current,
        view: new View({
          center: undefined, // Center of the map, adjust as needed
          zoom: undefined, // Initial zoom level
        }),
        layers: [
          // Base layer (optional, can use OSM or other base layers)
          osmLayer,
          vectorTileLayer,
        ],
      });

      mapInstance.current = map;
      vectorTileLayerRef.current = vectorTileLayer;

      map.on('click', (event) => {
        const clickedFeatures: number[] = [];
        map.forEachFeatureAtPixel(event.pixel, (feature) => {
          clickedFeatures.push(feature.getProperties().id); // Collect the feature IDs
        });

        // After the loop, update the state with the selected features
        setSelectedFeatures(clickedFeatures);
      });

      return () => {
        map.setTarget(''); // Clean up the map instance
      };
    }
  }, [layer]);

  useEffect(() => {
    if (mapInstance.current && extent) {
      mapInstance.current
        .getView()
        .fit(extent, { size: mapInstance.current.getSize() });

      // Refresh the vector tile layer source
      if (vectorTileLayerRef.current) {
        const source = vectorTileLayerRef.current.getSource();
        if (source) {
          source.refresh();
        }
      }
    }
  }, [extent]);

  useEffect(() => {
    if (vectorTileLayerRef.current) {
      const selectionLayer = vectorTileLayerRef.current;

      selectionLayer.setStyle(function (feature) {
        if (selectedFeatures.includes(feature.getProperties().id)) {
          return selectedStyle;
        }
        return mapStyle;
      });
    }
  }, [selectedFeatures]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full bg-gray-200"></div>
    </div>
  );
};

export default GeoServerMap;
