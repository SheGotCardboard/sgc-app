import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { getAccess } from "@/lib/access";
import CardContextMenu from "@/components/card/CardContextMenu";

export const metadata: Metadata = {
  title: "She Got Cardboard",
  description: "Collect Her Story.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAccess();

  return (
    <html lang="en">
      <body>
        {children}
        <CardContextMenu
          isAuthenticated={access.isAuthenticated}
          hasWishlist={access.hasWishlist}
          hasCardFavorites={access.hasCardFavorites}
        />
      </body>
    </html>
  );
}