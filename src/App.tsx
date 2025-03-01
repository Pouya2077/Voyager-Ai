
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import TripPlanner from "./pages/TripPlanner";
import Itinerary from "./pages/Itinerary";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AnimatedTransition from "./components/AnimatedTransition";
import GumloopApiTest from "./components/GumloopApiTest";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status whenever localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    // Initial check
    checkAuth();
    
    // Listen for storage events (in case another tab changes auth state)
    window.addEventListener("storage", checkAuth);
    
    // Cleanup
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Initialize theme on app load
  useEffect(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem("theme");
    
    if (storedTheme) {
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      // If no stored preference, check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      localStorage.setItem("theme", prefersDark ? "dark" : "light");
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <AnimatedTransition>
                {isLoggedIn ? <Navigate to="/" replace /> : <Login setIsLoggedIn={setIsLoggedIn} />}
              </AnimatedTransition>
            } />
            <Route path="/" element={
              <AnimatedTransition>
                {!isLoggedIn ? <Navigate to="/login" replace /> : <Index />}
              </AnimatedTransition>
            } />
            <Route path="/plan" element={
              <AnimatedTransition>
                {!isLoggedIn ? <Navigate to="/login" replace /> : <TripPlanner />}
              </AnimatedTransition>
            } />
            <Route path="/itinerary" element={
              <AnimatedTransition>
                {!isLoggedIn ? <Navigate to="/login" replace /> : <Itinerary />}
              </AnimatedTransition>
            } />
            <Route path="/gumloop-test" element={
              <AnimatedTransition>
                {!isLoggedIn ? <Navigate to="/login" replace /> : (
                  <div className="container mx-auto px-4 pt-32 pb-20">
                    <h1 className="text-3xl font-bold mb-8 text-center">Gumloop API Integration Test</h1>
                    <div className="max-w-md mx-auto">
                      <GumloopApiTest />
                    </div>
                  </div>
                )}
              </AnimatedTransition>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
