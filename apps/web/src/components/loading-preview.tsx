"use client";

const LoadingPreview = () => {
  return (
    <p className="text-base px-6 py-3 border border-black hover:bg-neutral-100 transition duration-300 flex items-center justify-center">
      Loading preview...
      <span className="dot-animation ml-2"></span>
      <style jsx>{`
        .dot-animation {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: black;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
          }
        }
      `}</style>
    </p>
  );
};

export default LoadingPreview;
