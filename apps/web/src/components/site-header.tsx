import Header from "./header";

export default function SiteHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <Header />
      </div>
    </div>
  );
}
