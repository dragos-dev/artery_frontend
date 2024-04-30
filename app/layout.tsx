"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import {NextUIProvider} from "@nextui-org/react";
import { WagmiProvider } from "@/providers/WagmiProvider";
import AuthProvider from "@/providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  }
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={inter.className}>
          <QueryClientProvider client={queryClient}>
            <NextUIProvider>
              <WagmiProvider>
                <AuthProvider />
                <Toaster />
                {children}
              </WagmiProvider>
            </NextUIProvider>
          </QueryClientProvider>
        </body>
    </html>
  );
}
