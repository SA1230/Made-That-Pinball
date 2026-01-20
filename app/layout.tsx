import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Nebula Cadet Pinball",
  description: "Original sci-fi pinball prototype"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
