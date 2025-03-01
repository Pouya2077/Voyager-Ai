
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ItineraryCard from "@/components/ItineraryCard";
import GlassMorphCard from "@/components/GlassMorphCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, MapPin, Clock, BadgeDollarSign, Users, Heart, Share, Download, Printer } from "lucide-react";
import { format } from "date-fns";

interface TripDetails {
  destination: string;
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

  useEffect(() => {
    if (location.state?.tripDetails) {
      setTripDetails(location.state.tripDetails);
      
      // Simulate itinerary data loading
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } else {
      navigate("/plan");
    }
  }, [location, navigate]);

  // Mock itinerary data
  const generateMockItinerary = () => {
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
    
    const activities = [
      "Museum Visit", "Historical Tour", "Local Food Tasting", 
      "City Walking Tour", "Shopping Trip", "Cultural Experience",
      "Beach Day", "Nature Hike", "Boat Tour", "Wine Tasting",
      "Art Gallery", "Local Market", "Scenic Viewpoint", "Landmark Visit"
    ];
    
    const itinerary = [];
    const city = tripDetails.destination.split(",")[0];
    
    for (let i = 1; i <= tripDetails.duration; i++) {
      const dayActivities = [];
      const numActivities = Math.floor(Math.random() * 3) + 2; // 2-4 activities per day
      
      for (let j = 0; j < numActivities; j++) {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const randomImage = images[Math.floor(Math.random() * images.length)];
        const startHour = 8 + j * 3; // Space activities throughout the day
        
        dayActivities.push({
          title: randomActivity,
          description: `Experience the amazing ${randomActivity.toLowerCase()} in ${city}. This is one of the must-do activities during your stay.`,
          location: `${city} ${randomActivity} Center`,
          time: `${startHour}:00 - ${startHour + 2}:00`,
          cost: `$${Math.floor(Math.random() * 50) + 20}`,
          image: randomImage
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
            <p className="text-muted-foreground">
              Our AI is crafting a personalized travel plan for your trip to {tripDetails?.destination}
            </p>
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
              {mockItinerary.map((day) => (
                <TabsTrigger key={day.day} value={`day-${day.day}`}>
                  Day {day.day}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Trip Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          
          {mockItinerary.map((day) => (
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
        </Tabs>
      </div>
    </div>
  );
};

export default Itinerary;
