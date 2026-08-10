"use client";

export default function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div
      className={
        show
          ? "fixed top-24 right-6 z-[100] transition-all duration-300 opacity-100 translate-x-0"
          : "fixed top-24 right-6 z-[100] transition-all duration-300 opacity-0 translate-x-8 pointer-events-none"
      }
    >
      <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg px-4 py-3 max-w-xs">
        <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-black dark:text-white">Added to cart</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
