export default function Header() {
  return (
    <header className="w-full border-b border-gray-100">
      {/* Top info bar */}
      <div className="text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <span>Hotline 24/7: +254 700 123 456</span>
          <div className="flex items-center gap-4">
            <a href="/track" className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold">
              Track Order
            </a>
            <span>USD</span>
            <span>Eng</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6 flex-wrap">
        <a href="/" className="text-2xl font-bold text-brand shrink-0">
          Thomex
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="/">Home</a>
          <a href="/shop">Shop</a>
          <a href="/deals">Deals</a>
          <a href="/contact">Contact</a>
        </nav>

        <div className="flex items-center gap-5 text-sm shrink-0">
          <a href="/account">Log In / Sign Up</a>
          <a href="/cart" className="flex items-center gap-2">
            <span className="bg-brand text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
            <span>Cart</span>
          </a>
        </div>
      </div>

      {/* Search + category bar */}
      <div className="bg-brand">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <button className="bg-white text-brand-dark text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-2 shrink-0">
            All Categories ▾
          </button>
          <div className="flex-1 min-w-[200px] flex">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full px-4 py-2 text-sm rounded-l-md focus:outline-none"
            />
            <button className="bg-brand-dark text-white px-5 rounded-r-md text-sm">Search</button>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-white text-xs font-medium">
            <span>Free Shipping Over $399</span>
            <span>Money Back Guarantee</span>
            <span>100% Secure Payment</span>
          </div>
        </div>
      </div>
    </header>
  );
}
