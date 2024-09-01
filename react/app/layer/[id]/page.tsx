'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FeatureData } from '@/components/LayerTable';
import LayerTable from '@/components/LayerTable';
import GeoServerMap from '@/components/GeoServerMap';

export default function Page({ params }: { params: { id: number } }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<FeatureData[]>([]);
  const [extent, setExtent] = useState<[]>([]);

  useEffect(() => {
    // Fetch the data from the backend
    axios.get(`/api/gis/layer/${params.id}/`).then((response) => {
      const responseData = response.data;

      // Assuming the response is structured as explained in the previous messages
      setHeaders(['Feature ID', ...responseData.headers]);
      setData(responseData.data);
      setExtent(responseData.extent);
    });
  }, []);
  return (
    <div>
      <div className="m-8" style={{ minHeight: 100 }}>
        <GeoServerMap layer={params.id} extent={extent} />
      </div>
      <div className="m-8">
        <LayerTable headers={headers} data={data} />
      </div>
    </div>
  );
}
