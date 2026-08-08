export default function Header() {
  return (
    <header className="w-full">
      {/* Top info bar */}
      <div className="bg-brand-dark text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <span>Hotline 24/7: +254 700 123 456</span>
          <div className="flex gap-4">
            <span>Free Shipping on orders over $50</span>
            <span>Track Order</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
        <a href="/" className="text-2xl font-bold text-brand shrink-0">
          Thomex
        </a>

        <div className="flex-1 max-w-2xl">
          <div className="flex">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              className="w-full border border-gray-300 rounded-l-md px-4 py-2 text-sm focus:outline-none focus:border-brand"
            />
            <button className="bg-brand text-white px-5 rounded-r-md text-sm">
              Search
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm shrink-0">
          <a href="/account">My Account</a>
          <a href="/wishlist">Wishlist</a>
          <a href="/cart">My Cart</a>
        </div>
      </div>
    </header>
  );
}
