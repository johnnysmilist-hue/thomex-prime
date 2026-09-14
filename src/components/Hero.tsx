"use client";

import { useState, useEffect } from "react";
import { fetchActiveSlides, fetchBannerBySlot, Banner } from "@/lib/supabaseBanners";

export default function Hero() {
  const [slides, setSlides] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [side1, setSide1] = useState<Banner | null>(null);
  const [side2, setSide2] = useState<Banner | null>(null);
  const [bottom1, setBottom1] = useState<Banner | null>(null);
  const [bottom2, setBottom2] = useState<Banner | null>(null);

  useEffect(() => {
    fetchActiveSlides("hero_slide").then((r) => setSlides(r.data || []));
    fetchBannerBySlot("hero_side_1").then((r) => setSide1(r.data));
    fetchBannerBySlot("hero_side_2").then((r) => setSide2(r.data));
    fetchBannerBySlot("hero_bottom_1").then((r) => setBottom1(r.data));
    fetchBannerBySlot("hero_bottom_2").then((r) => setBottom2(r.data));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const active = slides[current];

  const renderSlideContent = (slide: Banner | undefined) => (
    <>
      <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight max-w-md">
        {slide?.title || "Next Gen Tech For Every Lifestyle"}
      </h1>
      <p className="text-gray-200 text-sm mb-5 max-w-xs">{slide?.subtitle}</p>
      {slide?.button_text && (
        <a href={slide.button_link || "/shop"} className="inline-block w-fit bg-brand hover:bg-brand-light transition-colors text-white px-5 py-2 rounded-md text-sm font-semibold">
          {slide.button_text}
        </a>
      )}
    </>
  );

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Mobile: swipeable carousel */}
      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory rounded-lg" style={{ scrollbarWidth: "none" }}>
        {(slides.length > 0 ? slides : [undefined]).map((slide, i) => (
          <div
            key={slide?.id || i}
            className="shrink-0 w-full snap-center bg-gray-500 dark:bg-gray-800 text-white p-8 flex flex-col justify-center min-h-[220px] bg-cover bg-center"
            style={slide?.image_url ? { backgroundImage: "url(" + slide.image_url + ")" } : {}}
          >
            {renderSlideContent(slide)}
          </div>
        ))}
      </div>

      {/* Desktop: auto-rotating with dot nav + side tiles */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        <div
          className="col-span-2 bg-gray-500 dark:bg-gray-800 text-white rounded-lg p-8 flex flex-col justify-center min-h-[280px] bg-cover bg-center relative overflow-hidden transition-all duration-500"
          style={active?.image_url ? { backgroundImage: "url(" + active.image_url + ")" } : {}}
        >
          {renderSlideContent(active)}

          {slides.length > 1 && (
            <div className="absolute bottom-4 left-8 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={"Go to slide " + (i + 1)}
                  className={i === current ? "w-6 h-1.5 rounded-full bg-white" : "w-1.5 h-1.5 rounded-full bg-white/50"}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="bg-gray-100 dark:bg-gray-900 rounded-lg p-5 flex-1 flex flex-col justify-center bg-cover bg-center"
            style={side1?.image_url ? { backgroundImage: "url(" + side1.image_url + ")" } : {}}
          >
            <h3 className="font-bold mb-3 text-black dark:text-white">{side1?.title || "Featured"}</h3>
            {side1?.button_text && (
              <a href={side1.button_link || "/shop"} className="inline-block w-fit bg-brand text-white px-4 py-2 rounded-md text-xs font-semibold">
                {side1.button_text}
              </a>
            )}
          </div>

          <div
            className="bg-gray-800 dark:bg-black text-white rounded-lg p-5 flex-1 flex flex-col justify-center bg-cover bg-center"
            style={side2?.image_url ? { backgroundImage: "url(" + side2.image_url + ")" } : {}}
          >
            <h3 className="font-bold mb-3">{side2?.title || "Featured"}</h3>
            <p className="text-sm text-gray-300">{side2?.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="bg-gray-100 dark:bg-gray-900 rounded-lg p-5 min-h-[140px] bg-cover bg-center flex flex-col justify-center"
          style={bottom1?.image_url ? { backgroundImage: "url(" + bottom1.image_url + ")" } : {}}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{bottom1?.subtitle}</p>
          <h4 className="font-bold text-black dark:text-white mb-3">{bottom1?.title}</h4>
          {bottom1?.button_text && (
            <a href={bottom1.button_link || "/shop"} className="inline-block w-fit bg-brand text-white px-4 py-2 rounded-md text-xs font-semibold">
              {bottom1.button_text}
            </a>
          )}
        </div>

        <div
          className="bg-purple-50 dark:bg-gray-900 rounded-lg p-5 min-h-[140px] bg-cover bg-center flex flex-col justify-center"
          style={bottom2?.image_url ? { backgroundImage: "url(" + bottom2.image_url + ")" } : {}}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{bottom2?.subtitle}</p>
          <h4 className="font-bold text-black dark:text-white mb-3">{bottom2?.title}</h4>
          {bottom2?.button_text && (
            <a href={bottom2.button_link || "/shop"} className="text-xs font-semibold text-brand underline">
              {bottom2.button_text}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
