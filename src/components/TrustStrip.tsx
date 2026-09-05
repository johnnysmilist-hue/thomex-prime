export default function TrustStrip() {
  const items = [
    {
      title: "Secure Checkout",
      subtitle: "M-Pesa & encrypted data",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      title: "Authentic Products",
      subtitle: "Genuine, curated tech",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      ),
    },
    {
      title: "Nationwide & Beyond",
      subtitle: "Delivery across Kenya + international",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <path d="M16 8h4l3 3v5h-7V8Z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      title: "Easy Returns",
      subtitle: "7-day window on eligible items",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="text-brand shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-black dark:text-white truncate">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
