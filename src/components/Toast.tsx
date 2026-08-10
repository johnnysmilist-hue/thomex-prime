"use client";

export default function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <div
      className={
        show
          ? "fixed bottom-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium px-5 py-3 rounded-full shadow-lg z-[100] transition-all duration-300 opacity-100 translate-y-0"
          : "fixed bottom-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium px-5 py-3 rounded-full shadow-lg z-[100] transition-all duration-300 opacity-0 translate-y-4 pointer-events-none"
      }
    >
      {message}
    </div>
  );
}
