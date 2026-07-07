import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";

export const metadata: Metadata = {
  title: "SupplyChain AI – Enterprise Supply Chain Intelligence",
  description:
    "AI-powered Supply Chain Intelligence Platform. Monitor shipments, predict delays, analyze supplier risks, and optimize logistics with live public data.",
  keywords: "supply chain, logistics, AI, shipment tracking, risk management, port analytics",
  openGraph: {
    title: "SupplyChain AI",
    description: "Enterprise AI-powered Supply Chain Intelligence Platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-mesh antialiased" suppressHydrationWarning>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopNavbar />
              <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(10,15,30,0.97)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "12px",
              color: "#f1f5f9",
              backdropFilter: "blur(20px)",
              fontSize: "13px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#040810" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#040810" } },
          }}
        />
      </body>
    </html>
  );
}
