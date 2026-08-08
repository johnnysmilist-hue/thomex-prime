import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
