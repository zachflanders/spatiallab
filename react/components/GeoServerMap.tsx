import React, { use, useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { VectorTile } from 'ol/layer';
import MVT from 'ol/format/MVT';
import XYZ from 'ol/source/XYZ';
import 'ol/ol.css';

export interface MapProps {
  layer: number;
  extent?: [number, number, number, number];
}

const GeoServerMap: React.FC<MapProps> = ({ layer, extent }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorTileLayerRef = useRef<VectorTileLayer | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      const vectorTileLayer = new VectorTileLayer({
        source: new VectorTileSource({
          format: new MVT(),
          url: `http://localhost/geoserver/gwc/service/tms/1.0.0/spatiallab%3Alayer_${layer}_features@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf`,
        }),
      });
      const map = new Map({
        target: mapRef.current,
        view: new View({
          center: undefined,
          zoom: undefined,
        }),
        layers: [
          // Base layer (optional, can use OSM or other base layers)
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            }),
          }),
          vectorTileLayer,
        ],
      });

      mapInstance.current = map;
      vectorTileLayerRef.current = vectorTileLayer;

      return () => {
        map.setTarget(null); // Clean up the map instance
      };
    }
  }, [layer]);

  useEffect(() => {
    if (mapInstance.current && extent && extent.length === 4) {
      console.log(`extent: ${extent}`);
      console.log(mapInstance.current.getSize());
      mapInstance.current
        .getView()
        .fit(extent, { size: mapInstance.current.getSize() });
      if (vectorTileLayerRef.current) {
        const source = vectorTileLayerRef.current.getSource();
        if (source) {
          source.refresh();
        }
      }
    }
  }, [extent]);

  return (
    <div style={{ height: 300 }}>
      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  );
};

export default GeoServerMap;
