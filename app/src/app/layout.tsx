import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/Header";

export const metadata: Metadata = {
  title: "Парикмахерская - д. Примерово",
  description: "Стрижки, укладки, бритье. Запись через Telegram-бота"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
