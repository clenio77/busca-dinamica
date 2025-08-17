import React from 'react';

function LoadingSkeleton({ count = 5 }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="p-4 animate-pulse">
            <div className="space-y-3">
              {/* Street Address Skeleton */}
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-3">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                </div>
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
              </div>
              
              {/* CEP and Location Skeleton */}
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between space-y-2 xs:space-y-0">
                {/* CEP Badge Skeleton */}
                <div className="flex-shrink-0">
                  <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                </div>
                
                {/* Location Info Skeleton */}
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="hidden sm:block w-4 h-4 bg-gray-200 rounded ml-3"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
