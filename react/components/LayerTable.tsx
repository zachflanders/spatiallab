import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { Layer } from '../app/data/types';
import api from '../app/api';
import { set } from 'ol/transform';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface FeatureData {
  id: number;
  [key: string]: string | number | null;
}

export interface TableProps {
  layer: Layer;
}

const LayerTable: React.FC<TableProps> = ({ layer }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<FeatureData[]>([]);
  const [extent, setExtent] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageSizeInput, setPageSizeInput] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number | string>('?');
  const [totalFeatures, setTotalFeatures] = useState<number>(0);

  const fetchData = (page: number, pageSize: number) => {
    api
      .get(`/gis/layer/${layer.id}/`, {
        params: { page: page, page_size: pageSize },
      })
      .then((response) => {
        console.log(response.data);
        const responseData = response.data;
        setHeaders(['Feature ID', ...responseData.headers]);
        setData(responseData.data);
        setExtent(responseData.extent);
        setCurrentPage(responseData.page);
        setTotalPages(responseData.total_pages);
        setTotalFeatures(responseData.total_features);
        setIsLoading(false);
      });
  };

  const debouncedFetchData = useCallback(debounce(fetchData, 300), [layer.id]);

  useEffect(() => {
    console.log('Fetching data...');
    setIsLoading(true);
    debouncedFetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  useEffect(() => {
    console.log('Layer changed...');
    if (currentPage !== 1) {
      setTotalPages('?');
      setCurrentPage(1);
    } else {
      setIsLoading(true);
      setTotalPages('?');
      debouncedFetchData(currentPage, pageSize);
    }
  }, [layer]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-auto flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            Loading...
          </div>
        ) : (
          <>
            <table className="min-w-full bg-white border-t">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 border-b border-gray-300 text-left text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    {headers.map((header) => (
                      <td
                        key={header}
                        className="px-4 py-2 border-b border-gray-300"
                      >
                        {row[header] !== null ? row[header] : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="flex justify-between items-center p-2 border-t sticky bottom-0 text-sm">
        <div className="flex">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center p-2 rounded-lg disabled:text-gray-300 hover:bg-gray-800 hover:bg-opacity-5 items-center text-center mr-2"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center p-2 rounded-lg disabled:text-gray-300 hover:bg-gray-800 hover:bg-opacity-5 items-center text-center mr-2"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <div>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <span className="ml-1">
            {`(${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalFeatures)} of ${totalFeatures} features)`}
          </span>
        </div>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPageSize(pageSizeInput);
            }}
          >
            <label className="mr-2">Per page:</label>
            <input
              type="number"
              value={pageSizeInput}
              onChange={(e) => setPageSizeInput(Number(e.target.value))}
              className="w-16 p-1 border rounded text-center"
              min="1"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default LayerTable;
