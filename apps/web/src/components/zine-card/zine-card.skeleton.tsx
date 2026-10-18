import React from "react";

const ZineCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between bg-white rounded-lg overflow-hidden shadow-sm h-full animate-pulse">
      <div className="flex flex-col items-center p-4 flex-grow">
        <div className="relative w-1/2 h-56 bg-gray-200 rounded-md"></div>{" "}
        {/* Image */}
        <div className="flex flex-col mt-3 text-center w-full">
          {" "}
          {/* Added width for better skeleton effect */}
          <div className="h-6 bg-gray-200 rounded-md mb-2 w-3/4 mx-auto"></div>{" "}
          {/* Title */}
          <div className="h-4 bg-gray-200 rounded-md w-1/2 mx-auto"></div>{" "}
          {/* Author */}
          <div className="h-4 bg-gray-200 rounded-md mt-2 w-full"></div>{" "}
          {/* Description */}
          <div className="h-4 bg-gray-200 rounded-md mt-2 w-full"></div>{" "}
          {/* Description (second line) - optional */}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-2 p-4">
        <div className="flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-gray-200 rounded-md w-24 mx-auto"></div>{" "}
        {/* Button */}
      </div>
    </div>
  );
};

export default ZineCardSkeleton;
