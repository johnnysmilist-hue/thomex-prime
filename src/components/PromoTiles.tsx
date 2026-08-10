const tiles = [
  { title: "Gaming Zone", subtitle: "Level Up Your Game", cta: "Shop Now", dark: true },
  { title: "Smart Home", subtitle: "Make Life Smarter", cta: "Shop Now", dark: false },
  { title: "New Arrivals", subtitle: "Just Landed!", cta: "Discover Now", dark: true },
];

export default function PromoTiles() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiles.map((tile) => {
        const boxClass = tile.dark
          ? "rounded-lg p-6 h-40 flex flex-col justify-between bg-brand-dark text-white"
          : "rounded-lg p-6 h-40 flex flex-col justify-between bg-brand-light/20 text-brand-dark";

        return (
          <div key={tile.title} className={boxClass}>
            <div>
              <h3 className="text-lg font-bold">{tile.title}</h3>
              <p className="text-sm opacity-80">{tile.subtitle}</p>
            </div>
            <a href="/shop" className="inline-block w-fit px-4 py-2 rounded-md text-sm font-semibold bg-brand text-white">
              {tile.cta}
            </a>
          </div>
        );
      })}
    </section>
  );
}
