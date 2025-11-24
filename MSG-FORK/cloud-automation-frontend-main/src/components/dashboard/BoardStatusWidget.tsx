import React from 'react';
import { BoardColumn } from '@/types/dashboard';
import { Users, AlertCircle } from 'lucide-react';

interface BoardStatusWidgetProps {
  columns: BoardColumn[];
}

const BoardStatusWidget: React.FC<BoardStatusWidgetProps> = ({ columns }) => {
  const totalActive = columns
    .filter(col => col.name !== 'Done (This Week)')
    .reduce((sum, col) => sum + col.count, 0);

  const getColumnColor = (color?: string) => {
    return color || '#6B7280';
  };

  const isOverWipLimit = (column: BoardColumn) => {
    return column.wipLimit && column.count > column.wipLimit;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Board Status
        </h3>
        <div className="text-sm text-gray-500">
          {totalActive} active stories
        </div>
      </div>

      <div className="space-y-4">
        {columns.map((column, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColumnColor(column.color) }}
              />
              <div>
                <span className="font-medium text-gray-900">{column.name}</span>
                {column.wipLimit && (
                  <div className="flex items-center mt-1">
                    <span className={`text-xs ${isOverWipLimit(column) ? 'text-red-600' : 'text-gray-500'}`}>
                      WIP Limit: {column.wipLimit}
                    </span>
                    {isOverWipLimit(column) && (
                      <AlertCircle className="w-3 h-3 ml-1 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${isOverWipLimit(column) ? 'text-red-600' : 'text-gray-900'}`}>
                {column.count}
              </span>
              {column.wipLimit && (
                <span className="text-sm text-gray-400">
                  / {column.wipLimit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Total Active Stories</span>
          <span className="text-xl font-bold text-blue-600">{totalActive}</span>
        </div>
      </div>
    </div>
  );
};

export default BoardStatusWidget;
