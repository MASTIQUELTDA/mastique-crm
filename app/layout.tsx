import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mastique CRM",
  description: "Plataforma comercial e operacional da Mastique",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
