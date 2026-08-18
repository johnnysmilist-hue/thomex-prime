export default function ProductGallery({ imageUrl, overrideUrl }: { imageUrl?: string; overrideUrl?: string }) {
  const displayUrl = overrideUrl || imageUrl;

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg h-80 flex items-center justify-center text-gray-400 text-sm mb-4 overflow-hidden">
        {displayUrl ? (
          <img src={displayUrl} alt="Product" className="w-full h-full object-contain" />
        ) : (
          "No image yet"
        )}
      </div>
    </div>
  );
}
