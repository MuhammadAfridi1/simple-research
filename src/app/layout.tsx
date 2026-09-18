import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Field / Notes — Research Archive",
  description: "A personal research library.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
