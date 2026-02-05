import React from 'react';

export const StepIndicator: React.FC<{
  current: number;
  total: number;
  isValid: boolean;
}> = ({ current, total, isValid }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full ${
              i < current
                ? 'bg-green-500'
                : i === current
                  ? isValid
                    ? 'bg-blue-500'
                    : 'bg-red-500'
                  : 'bg-gray-300'
            }`}
          />
          {i < total - 1 && (
            <div className={`w-4 h-0.5 ${i < current ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
};
