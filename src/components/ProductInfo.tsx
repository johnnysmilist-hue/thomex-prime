"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCurrency } from "@/context/CurrencyContext";
import SoldBy from "./SoldBy";
import { fetchAttributes, Attribute } from "@/lib/supabaseAttributes";
import { getColorHex } from "@/lib/colorMap";
import type { Product } from "@/lib/supabaseProducts";

export default function ProductInfo({
  product,
  onImageChange,
}: {
  product: Product;
  onImageChange?: (url: string | undefined) => void;
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { format } = useCurrency();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const wishlisted = isWishlisted(product.id);

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selected, setSelected] = useState<Record<string, Attribute>>({});

  useEffect(() => {
    fetchAttributes(product.id).then((r) => setAttributes(r.data || []));
  }, [product.id]);

  useEffect(() => {
    const withImage = Object.values(selected).find((a) => a.image_url);
    if (onImageChange) onImageChange(withImage?.image_url || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const grouped: Record<string, Attribute[]> = {};
  attributes.forEach((attr) => {
    if (!grouped[attr.name]) grouped[attr.name] = [];
    grouped[attr.name].push(attr);
  });

  const priceAdjustment = Object.values(selected).reduce((sum, a) => sum + a.price_modifier, 0);
  const finalPrice = product.price + priceAdjustment;

  const selectAttribute = (attr: Attribute) => {
    setSelected((prev) => ({ ...prev, [attr.name]: attr }));
  };

  const buildCartName = () => {
    const variantParts = Object.values(selected).map((a) => a.value);
    return variantParts.length > 0 ? product.name + " (" + variantParts.join(", ") + ")" : product.name;
  };

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: buildCartName(), price: finalPrice }, qty);
  };

  const handleBuyNow = () => {
    addToCart({ id: product.id, name: buildCartName(), price: finalPrice }, qty);
    router.push("/checkout");
  };

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
        <button
          onClick={() => toggleWishlist({ id: product.id, name: product.name, price: product.price })}
          aria-label="Toggle wishlist"
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-300">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">{product.name}</h1>

      <SoldBy storeId={product.storeId} />

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{product.description}</p>

      <div className="flex items-center gap-1 text-sm text-yellow-500 mb-4">
        {"★".repeat(Math.round(product.rating))}
        {"☆".repeat(5 - Math.round(product.rating))}
        <span className="text-gray-400 ml-1">({product.reviewCount} Reviews)</span>
      </div>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl font-bold text-black dark:text-white">{format(finalPrice)}</span>
        {product.oldPrice && (
          <span className="text-gray-400 line-through">{format(product.oldPrice)}</span>
        )}
      </div>
       {product.oldPrice && product.oldPrice > finalPrice && (
        <p className="text-xs text-green-600 dark:text-green-400 mb-5">
          You save {format(product.oldPrice - finalPrice)}
          {product.discountPercent ? " (" + product.discountPercent + "%)" : ""}
        </p>
      )}

      {Object.entries(grouped).map(([attrName, options]) => {
        const isColorGroup = attrName.trim().toLowerCase() === "color";

        return (
          <div key={attrName} className="mb-5">
            <p className="text-sm font-semibold mb-2 text-black dark:text-white">
              {attrName}
              {selected[attrName] && <span className="font-normal text-gray-500 dark:text-gray-400">: {selected[attrName].value}</span>}
            </p>

            {isColorGroup ? (
              <div className="flex flex-wrap gap-3">
                {options.map((opt) => {
                  const isSelected = selected[attrName]?.id === opt.id;
                  const hex = getColorHex(opt.value);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectAttribute(opt)}
                      title={opt.value}
                      aria-label={opt.value}
                      style={hex ? { backgroundColor: hex } : undefined}
                      className={
                        (isSelected
                          ? "w-8 h-8 rounded-full border-2 border-brand ring-2 ring-offset-2 ring-brand dark:ring-offset-gray-950"
                          : "w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600") +
                        (!hex ? " bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] text-gray-500" : "")
                      }
                    >
                      {!hex && opt.value.charAt(0).toUpperCase()}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                  const isSelected = selected[attrName]?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectAttribute(opt)}
                      className={
                        isSelected
                          ? "flex items-center gap-2 border-2 border-brand rounded-md px-3 py-1.5 text-sm text-black dark:text-white"
                          : "flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-black dark:text-white"
                      }
                    >
                      {opt.value}
                      {opt.price_modifier !== 0 && (
                        <span className="text-xs text-gray-400">
                          {opt.price_modifier > 0 ? "+" : ""}{opt.price_modifier}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1 text-lg text-black dark:text-white">-</button>
          <span className="px-4 text-black dark:text-white">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-3 py-1 text-lg text-black dark:text-white">+</button>
        </div>
      </div>

      {outOfStock ? (
        <p className="text-sm text-red-500 font-bold mb-4">Out of Stock</p>
      ) : lowStock ? (
        <p className="text-sm text-orange-500 font-bold mb-4">Only {product.stock} left in stock — order soon!</p>
      ) : (
        <div className="mb-4" />
      )}

      <div className="flex gap-3">
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 bg-brand text-white py-3 rounded-md font-semibold hover:bg-brand-dark transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:hover:bg-gray-300 dark:disabled:hover:bg-gray-700"
        >
          Buy Now
        </button>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 border border-brand text-brand py-3 rounded-md font-semibold hover:bg-brand/5 transition-colors disabled:border-gray-300 dark:disabled:border-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
