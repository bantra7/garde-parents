import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Historique from "./pages/Historique";
import Profils from "./pages/Profils";
import AjouterGarde from "./pages/AjouterGarde";
import ModifierGarde from "./pages/ModifierGarde";
import ModifierProfil from "./pages/ModifierProfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/profils" element={<Profils />} />
          <Route path="/ajouter" element={<AjouterGarde />} />
          <Route path="/modifier-garde/:id" element={<ModifierGarde />} />
          <Route path="/modifier-profil/:id" element={<ModifierProfil />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
