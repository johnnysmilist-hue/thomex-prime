export default function Hero() {
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Main banner */}
      <div className="md:col-span-2 bg-gray-500 text-white rounded-lg p-8 flex flex-col justify-center min-h-[280px]">
        <h1 className="text-3xl font-bold mb-2 leading-tight">
          A4tech Bloody
          <br />
          Gaming Headphone
        </h1>
        <p className="text-gray-200 text-sm mb-5 max-w-xs">
          Feature-Packed Wireless Headset Engineered For Professional Gamers And Audiophiles
        </p>
        
          href="/shop"
          className="inline-block w-fit bg-brand hover:bg-brand-light transition-colors text-white px-5 py-2 rounded-md text-sm font-semibold"
        >
          Buy Now
        </a>
      </div>

      {/* Side tiles */}
      <div className="flex flex-col gap-4">
        <div className="bg-gray-100 rounded-lg p-5 flex-1 flex flex-col justify-center">
          <p className="text-xs text-gray-500 mb-1">Watch</p>
          <h3 className="font-bold mb-3">The Oraimo Watch 5 Smart Watch</h3>
          
            href="/shop"
            className="inline-block w-fit bg-brand text-white px-4 py-2 rounded-md text-xs font-semibold"
          >
            Buy Now
          </a>
        </div>

        <div className="bg-gray-800 text-white rounded-lg p-5 flex-1 flex flex-col justify-center">
          <p className="text-xs text-gray-400 mb-1">Camera</p>
          <h3 className="font-bold mb-3">Canon EOS R50 Mirrorless Camera</h3>
          <p className="text-sm text-gray-300">From $499</p>
        </div>
      </div>
    </div>
  );
}
