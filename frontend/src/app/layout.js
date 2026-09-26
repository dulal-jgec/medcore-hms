import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "./globals.css";

import AuthProvider from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: {
    default: "MedCore — Hospital Management System",
    template: "%s | MedCore",
  },
  description:
    "MedCore is a multi-tenant hospital management platform for patients, doctors, and hospital administrators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}