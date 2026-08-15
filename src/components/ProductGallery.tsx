export default function ProductGallery({ imageUrl }: { imageUrl?: string }) {
  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg h-80 flex items-center justify-center text-gray-400 text-sm mb-4 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="Product" className="w-full h-full object-contain" />
        ) : (
          "No image yet"
        )}
      </div>
    </div>
  );
}
