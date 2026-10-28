import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TYPE RACING — Kejuaraan Balap Ketik Sprint Atletik",
  description: "Game balap ketik minimalis bertema stadion atletik berkecepatan tinggi melawan pelari AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@1..144,1..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full w-full max-h-[100dvh] max-w-[100dvw] overflow-hidden select-none bg-[#050811] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
