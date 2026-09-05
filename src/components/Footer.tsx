export default function Footer() {
  return (
    <footer className="bg-brand-dark dark:bg-black text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-xs sm:text-sm">
        <div className="col-span-2 sm:col-span-1">
          <img src="/logo-dark.png" alt="Thomex" className="h-6 sm:h-8 w-auto mb-3" />
          <p className="text-gray-300">Your one-stop shop for the latest tech gadgets. Quality products, best prices, fast delivery.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2 sm:mb-3">Shop</h4>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-300">
            <li><a href="/shop">All Products</a></li>
            <li><a href="/shop">New Arrivals</a></li>
            <li><a href="/shop">Best Sellers</a></li>
            <li><a href="/shop">Deals & Offers</a></li>
          </ul>
        </div>
         <div>
          <h4 className="font-semibold mb-2 sm:mb-3">Customer Care</h4>
          <ul className="space-y-1.5 sm:space-y-2 text-gray-300">
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/track-order">Track Your Order</a></li>
            <li><a href="/shipping">Shipping & Delivery</a></li>
            <li><a href="/returns">Returns & Refunds</a></li>
            <li><a href="/faq">FAQs</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/sell" className="font-semibold text-white">Sell on Thomex</a></li>
          </ul>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <h4 className="font-semibold mb-2 sm:mb-3">Stay Updated</h4>
          <p className="text-gray-300 mb-3">Get special offers and the latest tech deals.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 min-w-0 px-3 py-2 rounded-l-md text-black text-xs sm:text-sm focus:outline-none"
            />
            <button className="bg-brand px-3 sm:px-4 rounded-r-md text-xs sm:text-sm font-semibold shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-[10px] sm:text-xs text-gray-400 py-4 px-4">
        © 2026 Thomex. All Rights Reserved.
      </div>
    </footer>
  );
}
