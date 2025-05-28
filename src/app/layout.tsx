import type { Metadata } from "next";
import "./globals.css";
import { TRPCReactProvider } from "@/networking/trpc/client";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Chainlink Demo",
  description:
    "Track verifiable market data powered by Chainlink's decentralized oracles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TRPCReactProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
