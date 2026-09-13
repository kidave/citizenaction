import { useState } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { MediaProvider } from "@/context/MediaContext";
import ThemeProvider from "@/styles/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from "@/lib/queryClient";

export default function AppProviders({ children }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={150}>
            <MediaProvider>{children}</MediaProvider>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
