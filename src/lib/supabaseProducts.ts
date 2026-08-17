import { supabase } from "@/lib/supabaseClient";

export type DbProduct = {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  rating: number;
  review_count: number;
  discount_percent: number | null;
  category: string;
  brand: string | null;
  color: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
  stock: number;
  featured: boolean;
  is_flash_sale: boolean;
  store_id: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  discountPercent?: number;
  category: string;
  brand?: string;
  color?: string;
  description: string;
  imageUrl?: string;
  stock: number;
  featured: boolean;
  isFlashSale: boolean;
  storeId?: string;
};

function toProduct(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    oldPrice: p.old_price ?? undefined,
    rating: p.rating,
    reviewCount: p.review_count,
    discountPercent: p.discount_percent ?? undefined,
    category: p.category,
    brand: p.brand ?? undefined,
    color: p.color ?? undefined,
    description: p.description ?? "",
    imageUrl: p.image_url ?? undefined,
    stock: p.stock,
    featured: p.featured,
    isFlashSale: p.is_flash_sale,
    storeId: p.store_id ?? undefined,
  };
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data as DbProduct[] | null, error };
}

export async function fetchAllProductsForSite() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "Published")
    .order("created_at", { ascending: false });
  const products = data ? (data as DbProduct[]).map(toProduct) : [];
  return { products, error };
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  const product = data ? toProduct(data as DbProduct) : null;
  return { product, error };
}

export async function addProduct(product: Omit<DbProduct, "id" | "created_at">) {
  const { data, error } = await supabase.from("products").insert(product).select().single();
  return { data: data as DbProduct | null, error };
}

export async function updateProduct(id: string, product: Partial<Omit<DbProduct, "id" | "created_at">>) {
  const { data, error } = await supabase.from("products").update(product).eq("id", id).select().single();
  return { data: data as DbProduct | null, error };
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error };
}

export async function bulkAddProducts(products: Omit<DbProduct, "id" | "created_at">[]) {
  const { data, error } = await supabase.from("products").insert(products).select();
  return { data: data as DbProduct[] | null, error };
}

export async function uploadProductImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = Math.random().toString(36).substring(2) + "." + fileExt;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
  return { url: data.publicUrl, error: null };
}
