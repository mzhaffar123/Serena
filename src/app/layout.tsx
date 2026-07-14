import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Serena - Layanan Konsultasi Kesehatan Mental Online",
  description: "Temukan kedamaian dan solusi bersama psikolog dan konselor profesional Serena. Tempat aman, nyaman, dan terpercaya untuk kesehatan mental Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-serena-lavender-100 selection:text-serena-lavender-800">
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-serena-cream-50 via-serena-lavender-50 to-serena-sky-50 text-indigo-950">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
