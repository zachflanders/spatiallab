import React from 'react';

export interface FeatureData {
  id: number;
  [key: string]: string | number | null;
}

export interface TableProps {
  headers: string[];
  data: FeatureData[];
}

const LayerTable: React.FC<TableProps> = ({ headers, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
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
                <td key={header} className="px-4 py-2 border-b border-gray-300">
                  {row[header] !== null ? row[header] : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LayerTable;
