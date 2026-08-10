export default function DealOfTheDay() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-5">
      <h3 className="font-bold mb-3 text-black dark:text-white">Deal of the Day</h3>
      <div className="flex gap-2 mb-4">
        <div className="bg-brand-dark text-white text-center rounded px-2 py-1 flex-1">
          <div className="text-lg font-bold">12</div>
          <div className="text-[10px] text-gray-300">HRS</div>
        </div>
        <div className="bg-brand-dark text-white text-center rounded px-2 py-1 flex-1">
          <div className="text-lg font-bold">45</div>
          <div className="text-[10px] text-gray-300">MINS</div>
        </div>
        <div className="bg-brand-dark text-white text-center rounded px-2 py-1 flex-1">
          <div className="text-lg font-bold">33</div>
          <div className="text-[10px] text-gray-300">SECS</div>
        </div>
      </div>
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded mb-3 flex items-center justify-center text-gray-400 text-xs">
        Image
      </div>
      <h4 className="text-sm font-medium mb-1 text-black dark:text-white">Apple MacBook Air M2</h4>
      <p className="text-xs text-gray-400 mb-2">13-inch, 8GB RAM, 256GB SSD</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-brand font-bold">$899.00</span>
        <span className="text-gray-400 text-xs line-through">$1,199.00</span>
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">24% OFF</span>
      </div>
      <button className="w-full bg-black dark:bg-brand text-white text-sm py-2 rounded-full hover:bg-brand transition-colors">
        Add to Cart
      </button>
    </div>
  );
}
