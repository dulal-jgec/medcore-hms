import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { AuthProvider } from "@/components/shared/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "MedCore HMS",
  description: "Hospital Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
       <ThemeProvider>
  <AuthProvider>{children}</AuthProvider>
</ThemeProvider>
      </body>
    </html>
  );
}