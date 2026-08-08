export default function Hero() {
  return (
    <section className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          <p className="text-brand-light font-semibold mb-2">
            BUILD THE FUTURE
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Next Gen Tech
            <br />
            For Every Lifestyle
          </h1>
          <p className="text-gray-300 mb-6">
            Latest gadgets. Unbeatable prices. Upgrade your world today!
          </p>
          
            href="/shop"
            className="inline-block bg-brand hover:bg-brand-light transition-colors text-white px-6 py-3 rounded-md font-semibold"
          >
            Shop Now
          </a>
        </div>

        <div className="flex-1 w-full">
          <div className="bg-white/10 rounded-lg h-64 md:h-80 flex items-center justify-center text-gray-400 text-sm">
            Hero image goes here
          </div>
        </div>
      </div>
    </section>
  );
}
