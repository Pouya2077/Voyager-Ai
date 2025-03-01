
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TripPlanner from "./pages/TripPlanner";
import Itinerary from "./pages/Itinerary";
import NotFound from "./pages/NotFound";
import AnimatedTransition from "./components/AnimatedTransition";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <AnimatedTransition>
              <Index />
            </AnimatedTransition>
          } />
          <Route path="/plan" element={
            <AnimatedTransition>
              <TripPlanner />
            </AnimatedTransition>
          } />
          <Route path="/itinerary" element={
            <AnimatedTransition>
              <Itinerary />
            </AnimatedTransition>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
