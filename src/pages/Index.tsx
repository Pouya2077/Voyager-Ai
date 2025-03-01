import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import GlassMorphCard from "@/components/GlassMorphCard";
import { startGumloopPipeline, getPipelineRunStatus } from "@/utils/gumloopApi";
import { ArrowRight, Globe, Map, Calendar, CreditCard, Compass, Sparkles, Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [gumloopRunId, setGumloopRunId] = useState<string | null>(null);
  const [gumloopResponse, setGumloopResponse] = useState<any>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  useEffect(() => {
    const startPipeline = async () => {
      setIsLoading(true);
      try {
        const apiKey = "4997b5ac80a9402d977502ac41891eec";
        const userId = "1y5cS7wht6QDSjLHGBJOi6vu19y1";
        const savedItemId = "mqWGGXyZuhFwLQt5YDpyZC";
        
        const pipelineResponse = await startGumloopPipeline(
          userId,
          savedItemId,
          apiKey,
          [{ input_name: "city", value: "Paris" }]
        );
        
        setGumloopRunId(pipelineResponse.run_id);
        setGumloopResponse(pipelineResponse);
        
        const intervalId = window.setInterval(async () => {
          if (pipelineResponse.run_id) {
            try {
              const runData = await getPipelineRunStatus(
                pipelineResponse.run_id,
                userId,
                apiKey
              );
              
              setRunStatus(runData.state);
              setRunLogs(runData.log || []);
              
              if (runData.state === "DONE" || runData.state === "FAILED" || runData.state === "TERMINATED") {
                clearInterval(intervalId);
                setPollingInterval(null);
                setGumloopResponse(runData);
                setIsLoading(false);
              }
            } catch (err) {
              console.error("Error polling for run status:", err);
              clearInterval(intervalId);
              setPollingInterval(null);
              setError("Error checking pipeline status");
              setIsLoading(false);
            }
          }
        }, 3000);
        
        setPollingInterval(intervalId);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred starting the pipeline");
        setIsLoading(false);
      }
    };
    
    startPipeline();
  }, []);

  const handleGetStarted = () => {
    navigate("/plan");
  };

  const popularDestinations = [
    {
      name: "Paris",
      country: "France",
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Tokyo",
      country: "Japan",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "New York",
      country: "USA",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Venice",
      country: "Italy",
      image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-radial from-blue-50 to-transparent opacity-70 z-0"></div>
        <div className="absolute inset-0 bg-noise opacity-10 z-0"></div>
        
        <div className="container mx-auto px-4 pt-24 pb-16 sm:px-6 lg:pt-32 lg:pb-24 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="mb-8 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Introducing Voyager AI Travel Assistant
            </div>
            
            <h1 className="h1 mb-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              Your Personal AI Travel Companion for{" "}
              <span className="text-primary">Perfect Journeys</span>
            </h1>
            
            <div className="w-full max-w-lg mx-auto mb-8 p-4 border border-border rounded-lg bg-background/80 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">Gumloop API Test Result:</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground flex items-center">
                    <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-primary border-r-transparent animate-spin"></span>
                    Pipeline status: {runStatus || "Starting pipeline..."}
                  </p>
                  {runLogs.length > 0 && (
                    <div className="mt-2 text-xs">
                      <p className="font-medium">Recent logs:</p>
                      <div className="bg-black/5 dark:bg-white/5 p-2 rounded-md max-h-20 overflow-y-auto">
                        {runLogs.slice(-3).map((log, index) => (
                          <div key={index} className="text-xs">{log}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : error ? (
                <div className="text-red-500">
                  <p>Error: {error}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Pipeline ID: {gumloopRunId || "N/A"}</span>
                    <span>Status: {runStatus || "N/A"}</span>
                  </div>
                  <pre className="text-xs text-left p-3 bg-black/5 dark:bg-white/5 rounded-md overflow-auto max-h-60">
                    {JSON.stringify(gumloopResponse, null, 2)}
                  </pre>
                  {gumloopResponse?.outputs && Object.keys(gumloopResponse.outputs).length > 0 && (
                    <div className="mt-2 p-3 bg-primary/10 rounded-md">
                      <p className="text-sm font-medium">Pipeline Outputs:</p>
                      <pre className="text-xs mt-1">
                        {JSON.stringify(gumloopResponse.outputs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {isLoading && (
              <div className="w-full max-w-lg mx-auto mb-8 flex flex-col items-center p-4 bg-primary/5 rounded-lg animate-pulse">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                <p className="text-primary font-medium">Processing your travel data...</p>
                <p className="text-sm text-muted-foreground mt-1">This might take a moment</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                  <div className="bg-primary h-2.5 rounded-full animate-progress" style={{width: '70%'}}></div>
                </div>
              </div>
            )}
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: "0.6s" }}>
              Discover, plan, and experience your dream vacation with a smart travel buddy that helps you create personalized itineraries based on your preferences and budget.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.8s" }}>
              <button
                onClick={handleGetStarted}
                className="btn-primary flex items-center justify-center"
              >
                Plan Your Journey <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <a
                href="#about"
                className="btn-secondary flex items-center justify-center"
              >
                Learn More
              </a>
            </div>
            
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl animate-float">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-transparent opacity-60 z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=2069"
                  alt="World Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <Globe className="h-24 w-24 text-white animate-rotate-globe" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="h2 mb-4">Popular Destinations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore trending locations loved by travelers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <div
                key={destination.name}
                className="group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              >
                <div className="relative overflow-hidden rounded-xl aspect-[4/5]">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{destination.name}</h3>
                    <p className="text-sm text-white/80">{destination.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <button
              onClick={handleGetStarted}
              className="btn-ghost group"
            >
              Discover All Destinations
              <ArrowRight className="ml-1 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <section 
        id="about" 
        ref={featuresRef} 
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="h2 mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered travel buddy simplifies trip planning with personalized recommendations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Map className="h-10 w-10 text-primary" />,
                title: "Choose Your Destinations",
                description: "Tell us where you'd like to go, or let our AI suggest amazing places based on your preferences.",
                delay: 0.2
              },
              {
                icon: <Calendar className="h-10 w-10 text-primary" />,
                title: "Set Your Dates & Duration",
                description: "Select when you want to travel and how long you plan to stay for perfectly timed itineraries.",
                delay: 0.4
              },
              {
                icon: <CreditCard className="h-10 w-10 text-primary" />,
                title: "Define Your Budget",
                description: "Specify how much you want to spend, and we'll create a plan that fits your financial comfort zone.",
                delay: 0.6
              },
              {
                icon: <Sparkles className="h-10 w-10 text-primary" />,
                title: "AI Trip Generation",
                description: "Our AI analyzes thousands of options to create a perfectly tailored itinerary just for you.",
                delay: 0.8
              },
              {
                icon: <Compass className="h-10 w-10 text-primary" />,
                title: "Personalized Experiences",
                description: "Get recommendations for activities, restaurants, and hidden gems that match your interests.",
                delay: 1.0
              },
              {
                icon: <Globe className="h-10 w-10 text-primary" />,
                title: "Instant Adaptability",
                description: "Change any detail and watch your itinerary update in real-time to match your new preferences.",
                delay: 1.2
              }
            ].map((feature, index) => (
              <GlassMorphCard 
                key={index}
                className={`h-full transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${feature.delay}s` }}
                hoverEffect={true}
              >
                <div className="flex flex-col h-full">
                  <div className="rounded-full p-2 bg-primary/10 w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground flex-grow">{feature.description}</p>
                </div>
              </GlassMorphCard>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Plan Your Dream Vacation?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Let our AI travel buddy help you create the perfect itinerary in minutes.
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center bg-white text-primary px-8 py-3 rounded-full font-medium shadow-lg hover:bg-white/90 transition-all duration-300 ease-out"
            >
              Start Planning Now <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <span className="rounded-md bg-primary p-1 mr-2">
                <span className="block h-6 w-6 rounded-sm bg-white"></span>
              </span>
              <span className="font-semibold text-xl">Voyager</span>
            </div>
            
            <div className="flex space-x-8 mb-6 md:mb-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Voyager. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
