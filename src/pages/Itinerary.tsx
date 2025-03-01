import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ItineraryCard from "@/components/ItineraryCard";
import GlassMorphCard from "@/components/GlassMorphCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, MapPin, Clock, BadgeDollarSign, Users, Heart, Share, Download, Printer, Loader2, Hotel, Plane, Utensils, MapPinned, Car } from "lucide-react";
import { format } from "date-fns";
import { startGumloopPipeline, getPipelineRunStatus } from "@/utils/gumloopApi";
import { toast } from "sonner";
import GumloopApiTest from "@/components/GumloopApiTest";

interface TripDetails {
  destination: string;
  city?: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  budget: number;
  travelers: number;
  interests: string[];
}

const Itinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("overview");
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [sights, setSights] = useState<string[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [apiResults, setApiResults] = useState<any>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (location.state?.tripDetails) {
      setTripDetails(location.state.tripDetails);
    } else {
      navigate("/plan");
    }
  }, [location, navigate]);

  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    setElapsedTime(0);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Format time as mm:ss
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Process API results when they become available
  const processApiResults = (results: any) => {
    if (!results || !results.outputs) return;

    console.log("Processing API results:", results);
    setApiResults(results);
    
    const outputs = results.outputs;
    
    // Extract sights data
    if (outputs.sights && Array.isArray(outputs.sights)) {
      setSights(outputs.sights);
    }
    
    // Extract accommodation recommendations
    if (outputs.accommodations && Array.isArray(outputs.accommodations)) {
      setAccommodations(outputs.accommodations);
    } else if (typeof outputs.accommodations === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedAccommodations = JSON.parse(outputs.accommodations);
        if (Array.isArray(parsedAccommodations)) {
          setAccommodations(parsedAccommodations);
        }
      } catch (error) {
        // If it's not valid JSON, split by newlines or other delimiter
        const accommodationsArr = outputs.accommodations.split(/\n|,/).filter(Boolean).map(item => item.trim());
        setAccommodations(accommodationsArr.map(name => ({ name })));
      }
    }
    
    // Extract flight recommendations
    if (outputs.flights && Array.isArray(outputs.flights)) {
      setFlights(outputs.flights);
    } else if (typeof outputs.flights === 'string') {
      try {
        const parsedFlights = JSON.parse(outputs.flights);
        if (Array.isArray(parsedFlights)) {
          setFlights(parsedFlights);
        }
      } catch (error) {
        const flightsArr = outputs.flights.split(/\n|,/).filter(Boolean).map(item => item.trim());
        setFlights(flightsArr.map(name => ({ name })));
      }
    }
    
    // Extract activities
    if (outputs.activities && Array.isArray(outputs.activities)) {
      setActivities(outputs.activities);
    } else if (typeof outputs.activities === 'string') {
      try {
        const parsedActivities = JSON.parse(outputs.activities);
        if (Array.isArray(parsedActivities)) {
          setActivities(parsedActivities);
        }
      } catch (error) {
        const activitiesArr = outputs.activities.split(/\n|,/).filter(Boolean).map(item => item.trim());
        setActivities(activitiesArr.map(name => ({ name })));
      }
    }
    
    setIsLoading(false);
  };

  // Mock itinerary data with real sights integrated
  const generateItinerary = () => {
    if (!tripDetails) return [];
    
    const images = [
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1526668665780-9a397bd45320?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1462400362591-9ca55235346a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504607798333-52a30db54a5d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507369632363-a0b8cfbfb290?auto=format&fit=crop&w=800&q=80"
    ];
    
    // Use real attractions or activities if available
    const attractionsToUse = sights.length > 0 ? 
      sights : 
      (activities.length > 0 ? 
        activities.map(a => typeof a === 'string' ? a : a.name || a.title) : 
        ["Museum Visit", "Historical Tour", "Local Food Tasting"]);
    
    const itinerary = [];
    const city = tripDetails.destination.split(",")[0];
    
    for (let i = 1; i <= tripDetails.duration; i++) {
      const dayActivities = [];
      // Determine how many activities to show per day - at least 2, and distribute all attractions across the days
      const numActivities = Math.max(2, Math.ceil(attractionsToUse.length / tripDetails.duration));
      
      for (let j = 0; j < numActivities; j++) {
        // Select activities in sequence from the available ones, cycling if necessary
        const activityIndex = (i - 1) * numActivities + j;
        const wrappedIndex = activityIndex % attractionsToUse.length;
        const activityName = attractionsToUse[wrappedIndex];
        
        if (activityName) {
          const randomImage = images[Math.floor(Math.random() * images.length)];
          const startHour = 8 + j * 3; // Space activities throughout the day
          
          dayActivities.push({
            title: activityName,
            description: `Experience ${activityName} in ${city}. This is one of the must-do activities during your stay.`,
            location: `${city}`,
            time: `${startHour}:00 - ${startHour + 2}:00`,
            cost: `$${Math.floor(Math.random() * 50) + 20}`,
            image: randomImage
          });
        }
      }
      
      itinerary.push({
        day: i,
        date: new Date(tripDetails.startDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000),
        activities: dayActivities
      });
    }
    
    return itinerary;
  };
  
  const itineraryData = generateItinerary();

  const handleBack = () => {
    navigate("/plan");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  if (isLoading || !tripDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block rounded-full bg-primary/10 p-4 mb-6">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Generating Your Perfect Itinerary</h2>
            <p className="text-muted-foreground mb-6">
              Our AI is crafting a personalized travel plan for your trip to {tripDetails?.destination}
            </p>
            
            <div className="mt-8">
              {/* Hidden component to handle API loading */}
              <div className="hidden">
                <GumloopApiTest 
                  autoStart={true}
                  tripDetails={tripDetails}
                  onResultsReceived={processApiResults}
                />
              </div>
              
              {/* Instead show our own loading UI that hooks into the API results */}
              <div className="w-full max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Processing your travel data - {formatElapsedTime()}
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-progress"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between mb-8 items-start md:items-center gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Planning
            </Button>
            <h1 className="text-3xl font-bold">{tripDetails.destination} Itinerary</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>
                  {format(tripDetails.startDate, "MMM d")} - {format(tripDetails.endDate, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>{tripDetails.duration} days</span>
              </div>
              <div className="flex items-center">
                <BadgeDollarSign className="mr-1 h-4 w-4" />
                <span>${tripDetails.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                <span>{tripDetails.travelers} travelers</span>
              </div>
              {tripDetails.interests.length > 0 && (
                <div className="flex items-center">
                  <span>•</span>
                  <span className="ml-2">{tripDetails.interests.slice(0, 3).join(", ")}{tripDetails.interests.length > 3 ? "..." : ""}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSave}
              className={isSaved ? "text-red-500 hover:text-red-600" : ""}
            >
              <Heart className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
            </Button>
            <Button variant="outline" size="icon">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mb-8 hidden">
          <GumloopApiTest 
            autoStart={true}
            tripDetails={tripDetails}
            onResultsReceived={processApiResults}
          />
        </div>
        
        <Tabs defaultValue="overview" value={activeDay} onValueChange={setActiveDay} className="w-full">
          <div className="mb-8 overflow-x-auto pb-2">
            <TabsList className="inline-flex min-w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {itineraryData.map((day) => (
                <TabsTrigger key={day.day} value={`day-${day.day}`}>
                  Day {day.day}
                </TabsTrigger>
              ))}
              <TabsTrigger value="flights">Flights</TabsTrigger>
              <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Trip Highlights</h2>
                  {sights.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {sights.length} attractions found
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {itineraryData.flatMap(day => 
                    day.activities.slice(0, 1).map((activity, i) => (
                      <ItineraryCard
                        key={`${day.day}-${i}`}
                        day={day.day}
                        title={activity.title}
                        description={activity.description}
                        location={activity.location}
                        time={activity.time}
                        cost={activity.cost}
                        image={activity.image}
                        onClick={() => setActiveDay(`day-${day.day}`)}
                      />
                    ))
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <GlassMorphCard>
                  <h3 className="text-lg font-semibold mb-4">Trip Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Destination</div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        <span>{tripDetails.destination}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Dates</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-primary" />
                        <span>
                          {format(tripDetails.startDate, "MMM d")} - {format(tripDetails.endDate, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Budget</div>
                      <div className="flex items-center">
                        <BadgeDollarSign className="h-4 w-4 mr-1 text-primary" />
                        <span>${tripDetails.budget.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Travelers</div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-primary" />
                        <span>{tripDetails.travelers}</span>
                      </div>
                    </div>
                    
                    {tripDetails.interests.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Interests</div>
                        <div className="flex flex-wrap gap-2">
                          {tripDetails.interests.map((interest) => (
                            <span key={interest} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassMorphCard>
                
                {sights.length > 0 && (
                  <GlassMorphCard>
                    <h3 className="text-lg font-semibold mb-4">Popular Attractions</h3>
                    <ul className="space-y-2">
                      {sights.map((sight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{sight}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassMorphCard>
                )}
                
                <GlassMorphCard>
                  <h3 className="text-lg font-semibold mb-4">Estimated Costs</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Activities</span>
                      <span className="font-medium">${Math.round(tripDetails.budget * 0.3).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accommodations</span>
                      <span className="font-medium">${Math.round(tripDetails.budget * 0.4).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Food & Dining</span>
                      <span className="font-medium">${Math.round(tripDetails.budget * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transportation</span>
                      <span className="font-medium">${Math.round(tripDetails.budget * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-border">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">${tripDetails.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </GlassMorphCard>
                
                <Button className="w-full">
                  Customize This Itinerary
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {itineraryData.map((day) => (
            <TabsContent key={day.day} value={`day-${day.day}`} className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Day {day.day}: {format(day.date, "EEEE, MMMM d")}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {day.activities.map((activity, index) => (
                      <GlassMorphCard key={index} className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/3 flex-shrink-0">
                          <div className="aspect-video sm:aspect-square rounded-lg overflow-hidden">
                            <img
                              src={activity.image}
                              alt={activity.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:w-2/3 flex flex-col">
                          <h3 className="text-xl font-semibold mb-1">{activity.title}</h3>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{activity.time}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              <span>{activity.location}</span>
                            </div>
                            <div className="flex items-center">
                              <BadgeDollarSign className="mr-1 h-4 w-4" />
                              <span>{activity.cost}/person</span>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4 flex-grow">
                            {activity.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-auto">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="ghost" size="sm">
                              Find Alternatives
                            </Button>
                          </div>
                        </div>
                      </GlassMorphCard>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <GlassMorphCard>
                    <h3 className="text-lg font-semibold mb-4">Day {day.day} Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Date</div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-primary" />
                          <span>{format(day.date, "EEEE, MMMM d, yyyy")}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Activities</div>
                        <div className="font-medium">{day.activities.length} planned</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Estimated Cost</div>
                        <div className="font-medium">
                          ${day.activities.reduce((total, activity) => {
                            const cost = parseInt(activity.cost.replace("$", ""), 10);
                            return total + (cost * tripDetails.travelers);
                          }, 0)}
                        </div>
                      </div>
                    </div>
                  </GlassMorphCard>
                  
                  <GlassMorphCard>
                    <h3 className="text-lg font-semibold mb-4">Weather Forecast</h3>
                    <div className="flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="h-16 w-16 mx-auto mb-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                          </svg>
                        </div>
                        <div className="text-3xl font-semibold">75°F</div>
                        <div className="text-muted-foreground">Sunny</div>
                        <div className="text-sm text-muted-foreground mt-1">Perfect weather for sightseeing!</div>
                      </div>
                    </div>
                  </GlassMorphCard>
                  
                  <Button className="w-full">
                    Edit Day {day.day}
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
          
          {/* Accommodations Tab */}
          <TabsContent value="accommodations" className="animate-fade-in">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Recommended Accommodations</h2>
              
              {accommodations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {accommodations.map((accommodation, index) => {
                    const name = typeof accommodation === 'string' ? accommodation : accommodation.name || accommodation.title || 'Accommodation Option';
                    const description = accommodation.description || `A fantastic accommodation option in ${tripDetails.destination.split(',')[0]}.`;
                    const price = accommodation.price || `$${Math.floor(Math.random() * 200) + 100}/night`;
                    
                    return (
                      <GlassMorphCard key={index} className="h-full flex flex-col">
                        <div className="aspect-video rounded-lg overflow-hidden mb-4">
                          <img
                            src={`https://images.unsplash.com/photo-${1500000000000 + index * 100000}?auto=format&fit=crop&w=800&q=80`}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2">{name}</h3>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Hotel className="h-4 w-4 mr-1 text-primary" />
                          <span className="mr-3">Hotel</span>
                          <MapPin className="h-4 w-4 mr-1 text-primary" />
                          <span>{tripDetails.destination.split(',')[0]}</span>
                        </div>
                        
                        <p className="text-muted-foreground mb-4 flex-grow">
                          {description}
                        </p>
                        
                        <div className="flex justify-between items-center pt-3 mt-auto border-t border-border">
                          <span className="font-medium text-lg">{price}</span>
                          <Button size="sm">View Details</Button>
                        </div>
                      </GlassMorphCard>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/30 rounded-lg">
                  <Hotel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Accommodations Available Yet</h3>
                  <p className="text-muted-foreground">
                    We're still searching for the perfect places for you to stay in {tripDetails.destination.split(',')[0]}.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Flights Tab */}
          <TabsContent value="flights" className="animate-fade-in">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Recommended Flights</h2>
              
              {flights.length > 0 ? (
                <div className="space-y-4">
                  {flights.map((flight, index) => {
                    const airline = typeof flight === 'string' ? flight.split(' ')[0] || 'Airline' : flight.airline || 'Airline';
                    const flightNumber = typeof flight === 'string' ? flight.split(' ')[1] || 'FL123' : flight.flightNumber || 'FL123';
                    const departure = flight.departure || '10:00 AM';
                    const arrival = flight.arrival || '2:00 PM';
                    const price = flight.price || `$${Math.floor(Math.random() * 500) + 300}`;
                    
                    return (
                      <GlassMorphCard key={index} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className="md:w-1/4 p-4 bg-primary/5 flex items-center md:h-full">
                            <Plane className="h-8 w-8 text-primary mr-3" />
                            <div>
                              <div className="font-semibold">{airline}</div>
                              <div className="text-sm text-muted-foreground">{flightNumber}</div>
                            </div>
                          </div>
                          
                          <div className="md:w-1/2 p-4 flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-lg font-medium">{departure}</div>
                              <div className="text-sm text-muted-foreground">Home</div>
                            </div>
                            
                            <div className="flex-grow px-6 flex flex-col items-center">
                              <div className="w-full h-0.5 bg-border relative">
                                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
                                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">Direct</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-medium">{arrival}</div>
                              <div className="text-sm text-muted-foreground">{tripDetails.destination.split(',')[0]}</div>
                            </div>
                          </div>
                          
                          <div className="md:w-1/4 p-4 border-t md:border-t-0 md:border-l border-border flex justify-between md:flex-col items-center">
                            <div className="text-xl font-semibold">{price}</div>
                            <Button size="sm">Select</Button>
                          </div>
                        </div>
                      </GlassMorphCard>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/30 rounded-lg">
                  <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Flight Information Available Yet</h3>
                  <p className="text-muted-foreground">
                    We're still searching for the best flights to {tripDetails.destination.split(',')[0]}.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Itinerary;
