import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";
import MobileNav from "@/components/MobileNav";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "Thomex - Tech & Electronics Store",
  description: "Latest gadgets and electronics, picked by the spec.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-gray-950 dark:text-white transition-colors pb-16 md:pb-0">
        <ThemeProvider>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                  <RecentlyViewedProvider>
                    {children}
                    <MobileNav />
                  </RecentlyViewedProvider>
                </WishlistProvider>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
