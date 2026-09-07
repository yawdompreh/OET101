import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OET Study | DDOMPREH Stock Predict",
  description: "A structured OET preparation course for healthcare professionals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
