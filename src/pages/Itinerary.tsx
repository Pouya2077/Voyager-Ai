import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ItineraryCard from "@/components/ItineraryCard";
import GlassMorphCard from "@/components/GlassMorphCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, MapPin, Clock, BadgeDollarSign, Users, Heart, Share, Download, Printer, Loader2, Plane, Hotel, Landmark, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { startGumloopPipeline, getPipelineRunStatus } from "@/utils/gumloopApi";
import { toast } from "sonner";

interface TripDetails {
  destination: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  budget: number;
  travelers: number;
  interests: string[];
}

const GUMLOOP_USER_ID = "1y5cS7wht6QDSjLHGBJOi6vu19y1";
const GUMLOOP_SAVED_ITEM_ID = "veV5ZPJy5nYw4pQGdceWD5";
const GUMLOOP_API_KEY = "4997b5ac80a9402d977502ac41891eec";

const Itinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState("overview");
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [sights, setSights] = useState<string[]>([]);
  const [flights, setFlights] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [accommodations, setAccommodations] = useState<string[]>([]);
  const [accommodationLinks, setAccommodationLinks] = useState<string[]>([]);
  const [flightLinks, setFlightLinks] = useState<string[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (location.state?.tripDetails) {
      setTripDetails(location.state.tripDetails);
      
      fetchDataFromGumloop(location.state.tripDetails);
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

  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchDataFromGumloop = async (details: TripDetails) => {
    if (!details || !details.destination) return;
    
    setIsApiLoading(true);
    startTimer();
    
    try {
      const city = details.destination.split(',')[0];
      const formattedStartDate = format(details.startDate, "MMMM do");
      const formattedEndDate = format(details.endDate, "MMMM do");
      
      const pipelineInputs = [
        { input_name: "destination", value: city },
        { input_name: "budget", value: details.budget.toString() },
        { input_name: "num_travelers", value: details.travelers.toString() },
        { input_name: "start_date", value: formattedStartDate },
        { input_name: "end_date", value: formattedEndDate }
      ];
      
      console.log("Gumloop API Inputs:", {
        userId: GUMLOOP_USER_ID,
        savedItemId: GUMLOOP_SAVED_ITEM_ID,
        apiKey: GUMLOOP_API_KEY.substring(0, 4) + "...",
        pipelineInputs
      });
      
      const response = await startGumloopPipeline(
        GUMLOOP_USER_ID,
        GUMLOOP_SAVED_ITEM_ID,
        GUMLOOP_API_KEY,
        pipelineInputs
      );
      
      console.log("Gumloop Pipeline Response:", response);
      setRunId(response.run_id);
      
      if (response.run_id) {
        pollRunStatus(response.run_id);
      }
    } catch (error) {
      console.error("Error starting Gumloop pipeline:", error);
      toast.error("Failed to fetch travel data");
      setIsLoading(false);
      setIsApiLoading(false);
      stopTimer();
    }
  };

  const pollRunStatus = async (runId: string) => {
    try {
      const statusResponse = await getPipelineRunStatus(
        runId,
        GUMLOOP_USER_ID, 
        GUMLOOP_API_KEY
      );
      
      console.log("Gumloop Pipeline Status:", statusResponse);
      setRunStatus(statusResponse.state);
      
      if (statusResponse.state === "DONE") {
        if (statusResponse.outputs) {
          console.log("API outputs:", statusResponse.outputs);
          
          if (statusResponse.outputs.sights) {
            setSights(statusResponse.outputs.sights);
          }
          if (statusResponse.outputs.flights) {
            setFlights(Array.isArray(statusResponse.outputs.flights) ? 
              statusResponse.outputs.flights : 
              [statusResponse.outputs.flights]);
          }
          if (statusResponse.outputs.activities) {
            setActivities(statusResponse.outputs.activities);
          }
          if (statusResponse.outputs.accommodations) {
            setAccommodations(Array.isArray(statusResponse.outputs.accommodations) ? 
              statusResponse.outputs.accommodations : 
              [statusResponse.outputs.accommodations]);
          }
          if (statusResponse.outputs["accommodation links"]) {
            setAccommodationLinks(Array.isArray(statusResponse.outputs["accommodation links"]) ? 
              statusResponse.outputs["accommodation links"] : 
              [statusResponse.outputs["accommodation links"]]);
          }
          if (statusResponse.outputs["flight links"]) {
            setFlightLinks(Array.isArray(statusResponse.outputs["flight links"]) ? 
              statusResponse.outputs["flight links"] : 
              [statusResponse.outputs["flight links"]]);
          }
        }
        setIsLoading(false);
        setIsApiLoading(false);
        stopTimer();
      } else if (statusResponse.state === "FAILED" || statusResponse.state === "TERMINATED") {
        toast.error(`Pipeline ${statusResponse.state.toLowerCase()}`);
        setIsLoading(false);
        setIsApiLoading(false);
        stopTimer();
      } else {
        setTimeout(() => pollRunStatus(runId), 3000);
      }
    } catch (error) {
      console.error("Error polling run status:", error);
      toast.error("Failed to get pipeline status");
      setIsLoading(false);
      setIsApiLoading(false);
      stopTimer();
    }
  };

  const generateMockItinerary = () => {
    if (!tripDetails) return [];
    
    const activities = sights.length > 0 
      ? sights 
      : [
          "Museum Visit", "Historical Tour", "Local Food Tasting", 
          "City Walking Tour", "Shopping Trip", "Cultural Experience",
          "Beach Day", "Nature Hike", "Boat Tour", "Wine Tasting",
          "Art Gallery", "Local Market", "Scenic Viewpoint", "Landmark Visit"
        ];
    
    const itinerary = [];
    const city = tripDetails.destination.split(",")[0];
    
    for (let i = 1; i <= tripDetails.duration; i++) {
      const dayActivities = [];
      const numActivities = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < numActivities; j++) {
        const activityIndex = (i + j) % activities.length;
        const randomActivity = activities[activityIndex];
        
        // Generate a search-based image URL based on the sight name and destination
        const searchTerm = encodeURIComponent(`${randomActivity} ${city}`);
        const imageUrl = `https://source.unsplash.com/600x400/?${searchTerm}`;
        
        const startHour = 8 + j * 3;
        
        dayActivities.push({
          title: randomActivity,
          description: `Experience ${randomActivity} in ${city}. This is one of the must-do activities during your stay.`,
          location: `${city} ${randomActivity}`,
          time: `${startHour}:00 - ${startHour + 2}:00`,
          cost: `$${Math.floor(Math.random() * 50) + 20}`,
          image: imageUrl
        });
      }
      
      itinerary.push({
        day: i,
        date: new Date(tripDetails.startDate.getTime() + (i - 1) * 24 * 60 * 60 * 1000),
        activities: dayActivities
      });
    }
    
    return itinerary;
  };

  const mockItinerary = generateMockItinerary();

  const handleBack = () => {
    navigate("/plan");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const renderLink = (text: string) => {
    if (!text) return '';
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(text);
    
    if (hasUrl) {
      const parts = text.split(urlRegex);
      const matches = text.match(urlRegex) || [];
      
      return (
        <span>
          {parts.map((part, i) => {
            if (i < matches.length) {
              return (
                <React.Fragment key={i}>
                  {part}
                  <a 
                    href={matches[i]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {matches[i]}
                  </a>
                </React.Fragment>
              );
            }
            return part;
          })}
        </span>
      );
    }
    
    return text;
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
            
            {isApiLoading && (
              <div className="w-full max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Processing {runStatus && `(${runStatus})`} - {formatElapsedTime()}
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-progress"></div>
                </div>
              </div>
            )}
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
        
        <Tabs defaultValue="overview" value={activeDay} onValueChange={setActiveDay} className="w-full">
          <div className="mb-8 overflow-x-auto pb-2">
            <TabsList className="inline-flex min-w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
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
                
                {sights.length === 0 && isApiLoading && (
                  <div className="flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-8 mb-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Finding the best attractions for you...</h3>
                    <p className="text-sm text-muted-foreground mb-3 text-center">
                      We're searching for the best attractions in {tripDetails?.destination.split(',')[0]}
                    </p>
                    <div className="w-full max-w-md">
                      <div className="flex items-center gap-2 mb-2 justify-center">
                        <span className="text-sm font-medium">
                          {runStatus && `${runStatus}`} - {formatElapsedTime()}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-progress"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  {mockItinerary.flatMap(day => 
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
                
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <Plane className="mr-2 h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Flights</h2>
                    {flights.length > 0 && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {flights.length} options
                      </span>
                    )}
                  </div>
                  
                  {flights && flights.length > 0 ? (
                    <GlassMorphCard>
                      <ul className="space-y-3">
                        {flights.map((flight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            {renderLink(flight)}
                          </li>
                        ))}
                      </ul>
                    </GlassMorphCard>
                  ) : isApiLoading ? (
                    <div className="flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Searching for flight options...</span>
                    </div>
                  ) : (
                    <GlassMorphCard>
                      <p className="text-muted-foreground text-sm">
                        No flight information available. Try customizing your travel dates or budget.
                      </p>
                    </GlassMorphCard>
                  )}
                </div>
                
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <LinkIcon className="mr-2 h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Flight Links</h2>
                    {flightLinks.length > 0 && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {flightLinks.length} resources
                      </span>
                    )}
                  </div>
                  
                  {flightLinks && flightLinks.length > 0 ? (
                    <GlassMorphCard>
                      <ul className="space-y-3">
                        {flightLinks.map((link, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </GlassMorphCard>
                  ) : isApiLoading ? (
                    <div className="flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Gathering flight resources...</span>
                    </div>
                  ) : (
                    <GlassMorphCard>
                      <p className="text-muted-foreground text-sm">
                        No flight links available. Try customizing your travel dates or budget.
                      </p>
                    </GlassMorphCard>
                  )}
                </div>
                
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <Hotel className="mr-2 h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Accommodations</h2>
                    {accommodations.length > 0 && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {accommodations.length} options
                      </span>
                    )}
                  </div>
                  
                  {accommodations && accommodations.length > 0 ? (
                    <GlassMorphCard>
                      <ul className="space-y-3">
                        {accommodations.map((accommodation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            {renderLink(accommodation)}
                          </li>
                        ))}
                      </ul>
                    </GlassMorphCard>
                  ) : isApiLoading ? (
                    <div className="flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Finding accommodation options...</span>
                    </div>
                  ) : (
                    <GlassMorphCard>
                      <p className="text-muted-foreground text-sm">
                        No accommodation information available. Try customizing your trip duration or budget.
                      </p>
                    </GlassMorphCard>
                  )}
                </div>
                
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <LinkIcon className="mr-2 h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Accommodation Links</h2>
                    {accommodationLinks.length > 0 && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {accommodationLinks.length} resources
                      </span>
                    )}
                  </div>
                  
                  {accommodationLinks && accommodationLinks.length > 0 ? (
                    <GlassMorphCard>
                      <ul className="space-y-3">
                        {accommodationLinks.map((link, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <a 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all"
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </GlassMorphCard>
                  ) : isApiLoading ? (
                    <div className="flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Gathering accommodation resources...</span>
                    </div>
                  ) : (
                    <GlassMorphCard>
                      <p className="text-muted-foreground text-sm">
                        No accommodation links available. Try customizing your trip duration or budget.
                      </p>
                    </GlassMorphCard>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <Landmark className="mr-2 h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Activities</h2>
                    {activities.length > 0 && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {activities.length} options
                      </span>
                    )}
                  </div>
                  
                  {activities.length > 0 ? (
                    <GlassMorphCard>
                      <ul className="space-y-3">
                        {activities.map((activity, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            {renderLink(activity)}
                          </li>
                        ))}
                      </ul>
                    </GlassMorphCard>
                  ) : isApiLoading ? (
                    <div className="flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg p-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Discovering activities for your trip...</span>
                    </div>
                  ) : (
                    <GlassMorphCard>
                      <p className="text-muted-foreground text-sm">
                        No activity information available. Try customizing your interests or location.
                      </p>
                    </GlassMorphCard>
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
                          {renderLink(sight)}
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
        </Tabs>
      </div>
    </div>
  );
};

export default Itinerary;
