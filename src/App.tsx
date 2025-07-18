import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDatabase } from "@/hooks/useDatabase";
import Index from "./pages/Index";
import Historique from "./pages/Historique";
import Profils from "./pages/Profils";
import AjouterGarde from "./pages/AjouterGarde";
import ModifierGarde from "./pages/ModifierGarde";
import ModifierProfil from "./pages/ModifierProfil";
import NotFound from "./pages/NotFound";
import AjouterEnfant from "./pages/AjouterEnfant";
import AjouterGrandParent from "./pages/AjouterGrandParent";

const queryClient = new QueryClient();

const DatabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { isReady, error } = useDatabase();
  
  // Show loading or error state if needed
  if (error) {
    console.error('Database error:', error);
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DatabaseProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/profils" element={<Profils />} />
          <Route path="/ajouter" element={<AjouterGarde />} />
          <Route path="/ajouter-enfant" element={<AjouterEnfant />} />
          <Route path="/ajouter-grand-parent" element={<AjouterGrandParent />} />
          <Route path="/modifier-garde/:id" element={<ModifierGarde />} />
          <Route path="/modifier-profil/:id" element={<ModifierProfil />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </DatabaseProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
