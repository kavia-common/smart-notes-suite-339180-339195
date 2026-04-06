import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Notes Suite",
  description:
    "A feature-rich notes app with tags, search, pin/favorite, markdown editing, and local persistence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
