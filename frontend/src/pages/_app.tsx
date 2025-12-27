import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/hooks/use-auth";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  // Create a client state to handle React Query cache
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        refetchInterval: 5000, // Automatical polling for real-time feel
      },
    },
  }));

  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  // Helper to determine if we should show layout (e.g. hide on login)
  // const showLayout = router.pathname !== '/login'; 
  // For MVP, we'll wrap everything, or handle inside layout components

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <main className={`${inter.className} flex h-screen w-full bg-slate-50 text-slate-900`}>
          {/* Sidebar - Hide on Login */}
          {!isLoginPage && <Sidebar />}

          <div className="flex flex-col flex-1 h-full overflow-hidden">
            {/* Navbar - Hide on Login */}
            {!isLoginPage && <Navbar />}

            {/* Main Content Area */}
            <div className={isLoginPage ? "flex-1 overflow-auto" : "flex-1 overflow-auto p-6"}>
              <Component {...pageProps} />
            </div>
          </div>
        </main>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
