import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "School Tycoon — Simulacion de Gestion Escolar",
  description: "Construye y gestiona tu propia escuela en este juego de simulacion tycoon. Contrata profesores, inscribe estudiantes y conviertete en el mejor director.",
  keywords: ["School Tycoon", "simulacion", "tycoon", "escuela", "gestion", "juego"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏫</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${rajdhani.variable} ${jetbrainsMono.variable} antialiased`}
        style={{
          backgroundColor: '#050508',
          color: '#f0f0f0',
          fontFamily: "'Rajdhani', system-ui, -apple-system, sans-serif",
        }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
