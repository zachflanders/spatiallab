'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FeatureData } from '@/components/LayerTable';
import LayerTable from '@/components/LayerTable';
import GeoServerMap from '@/components/GeoServerMap';
import { getCookie } from '../../accounts/auth';
import api from '../../api';

export default function Page({ params }: { params: { id: number } }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<FeatureData[]>([]);
  const [extent, setExtent] = useState<[]>([]);
  const [csrfToken, setCsrftoken] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Fetch the data from the backend
    setCsrftoken(getCookie('csrftoken') || '');
    api
      .get(`/gis/layer/${params.id}/`, {
        headers: { 'X-CSRFToken': csrfToken || '' },
      })
      .then((response) => {
        const responseData = response.data;

        // Assuming the response is structured as explained in the previous messages
        setHeaders(['Feature ID', ...responseData.headers]);
        setData(responseData.data);
        setExtent(responseData.extent);
      });
  }, [params.id, setCsrftoken, setHeaders, setData, setExtent]);
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
