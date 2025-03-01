
import { useState, useEffect } from "react";
import { fetchGumloopOutputs, startGumloopPipeline, getPipelineRunStatus } from "@/utils/gumloopApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassMorphCard from "./GlassMorphCard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface GumloopApiTestProps {
  className?: string;
  city?: string;
  autoStart?: boolean;
  tripDetails?: {
    destination: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    budget: number;
    travelers: number;
    interests: string[];
  };
}

const GumloopApiTest = ({ className, city = "Paris", autoStart = false, tripDetails }: GumloopApiTestProps) => {
  const [workbookId, setWorkbookId] = useState("veV5ZPJy5nYw4pQGdceWD5"); // Updated workbook ID
  const [userId, setUserId] = useState("1y5cS7wht6QDSjLHGBJOi6vu19y1"); // Default user ID
  const [apiKey, setApiKey] = useState("4997b5ac80a9402d977502ac41891eec"); // Default API key
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [runId, setRunId] = useState("");
  const [runStatus, setRunStatus] = useState("");
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  
  useEffect(() => {
    // If autoStart is true, automatically start the API call
    if (autoStart && (city || tripDetails)) {
      handleTestApi();
    }
    
    return () => {
      // Clear the timer on component unmount
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [autoStart, city, tripDetails]);

  const startTimer = () => {
    setElapsedTime(0);
    const interval = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
    return interval;
  };

  const stopTimer = (interval: number) => {
    clearInterval(interval);
    setTimerInterval(null);
  };
  
  const handleTestApi = async () => {
    if (!workbookId.trim()) {
      toast.error("Please enter a workbook ID");
      return;
    }
    
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }
    
    setLoading(true);
    setRunStatus("Starting pipeline...");
    setRunLogs([]);
    const timerInt = startTimer();
    
    try {
      // Prepare API inputs based on tripDetails if available, otherwise use city
      const pipelineInputs = [];
      
      if (tripDetails) {
        // Format dates to strings (e.g., "March 8th")
        const startDateStr = format(tripDetails.startDate, "MMMM do");
        const endDateStr = format(tripDetails.endDate, "MMMM do");
        
        // Primary destination (city)
        pipelineInputs.push({ 
          input_name: "destination", 
          value: tripDetails.destination.split(',')[0] // Just the city name
        });
        
        // Budget
        pipelineInputs.push({ 
          input_name: "budget", 
          value: tripDetails.budget.toString() 
        });
        
        // Interests (join with commas if multiple)
        pipelineInputs.push({ 
          input_name: "interest", 
          value: tripDetails.interests.length > 0 ? tripDetails.interests.join(", ") : "anything" 
        });
        
        // Number of travelers
        pipelineInputs.push({ 
          input_name: "num_travelers", 
          value: tripDetails.travelers.toString() 
        });
        
        // Dates
        pipelineInputs.push({ input_name: "start_date", value: startDateStr });
        pipelineInputs.push({ input_name: "end_date", value: endDateStr });
        
        console.log(`Starting Gumloop pipeline with complete trip details for ${tripDetails.destination}`);
      } else {
        // Fallback to just using the city if detailed trip info isn't available
        pipelineInputs.push({ input_name: "destination", value: city });
        pipelineInputs.push({ input_name: "budget", value: "1000" });
        pipelineInputs.push({ input_name: "interest", value: "anything" });
        pipelineInputs.push({ input_name: "num_travelers", value: "2" });
        pipelineInputs.push({ input_name: "start_date", value: "Next week" });
        pipelineInputs.push({ input_name: "end_date", value: "Two weeks from now" });
        
        console.log(`Starting Gumloop pipeline with basic details for city: ${city}`);
      }
      
      // Start the pipeline with the inputs
      const pipelineResponse = await startGumloopPipeline(
        userId,
        workbookId,
        apiKey,
        pipelineInputs
      );
      
      if (pipelineResponse && pipelineResponse.run_id) {
        setRunId(pipelineResponse.run_id);
        await pollPipelineStatus(pipelineResponse.run_id, timerInt);
      } else {
        throw new Error("Failed to start pipeline");
      }
    } catch (error) {
      console.error("Gumloop API test failed:", error);
      toast.error("Failed to fetch data from Gumloop");
      stopTimer(timerInt);
      setLoading(false);
    }
  };
  
  const pollPipelineStatus = async (runId: string, timerInt: number) => {
    try {
      let isComplete = false;
      let attempts = 0;
      
      while (!isComplete && attempts < 60) { // Limit to 60 attempts (5 minutes with 5s interval)
        attempts++;
        
        const statusResponse = await getPipelineRunStatus(runId, userId, apiKey);
        
        setRunStatus(statusResponse.state);
        if (statusResponse.log && statusResponse.log.length > 0) {
          setRunLogs(statusResponse.log.filter((log: string) => !log.includes("__system__")));
        }
        
        // Check if there are outputs or if the pipeline is done
        if (statusResponse.state === "COMPLETED" || statusResponse.state === "ERROR" || statusResponse.outputs) {
          isComplete = true;
          setResults(statusResponse);
          if (statusResponse.state === "COMPLETED") {
            toast.success("Successfully fetched data from Gumloop!");
          } else if (statusResponse.state === "ERROR") {
            toast.error("Pipeline encountered an error");
          }
          stopTimer(timerInt);
          setLoading(false);
        } else {
          // Wait before polling again
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      if (!isComplete) {
        toast.error("Pipeline taking too long, please check later");
        stopTimer(timerInt);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error polling pipeline status:", error);
      toast.error("Failed to check pipeline status");
      stopTimer(timerInt);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <GlassMorphCard className={className}>
      <h2 className="text-xl font-semibold mb-4">Gumloop API Connection</h2>
      
      <div className="space-y-4">
        {!autoStart && (
          <>
            <div className="space-y-2">
              <Label htmlFor="workbook-id">Gumloop Workbook ID</Label>
              <Input
                id="workbook-id"
                value={workbookId}
                onChange={(e) => setWorkbookId(e.target.value)}
                placeholder="Enter your workbook ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">Gumloop API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
              <p className="text-xs text-muted-foreground">
                Your API key is only stored locally in your browser and is never sent to our servers.
              </p>
            </div>
          </>
        )}
        
        {tripDetails ? (
          <div className="text-sm text-muted-foreground">
            <p>Destination: {tripDetails.destination}</p>
            <p>Dates: {format(tripDetails.startDate, "MMM d")} - {format(tripDetails.endDate, "MMM d, yyyy")}</p>
            <p>Budget: ${tripDetails.budget}</p>
            <p>Travelers: {tripDetails.travelers}</p>
            {tripDetails.interests.length > 0 && (
              <p>Interests: {tripDetails.interests.join(", ")}</p>
            )}
          </div>
        ) : city ? (
          <p className="text-sm text-muted-foreground">Destination: {city}</p>
        ) : null}
        
        {!autoStart && (
          <Button 
            onClick={handleTestApi} 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Testing..." : "Test Connection"}
          </Button>
        )}
      </div>
      
      {loading && (
        <div className="mt-4 flex flex-col items-center p-4 bg-primary/5 rounded-lg">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
          <p className="text-primary font-medium">Processing your travel data...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Elapsed time: {formatTime(elapsedTime)}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div className="bg-primary h-2.5 rounded-full animate-progress"></div>
          </div>
          
          {runStatus && (
            <p className="text-sm text-muted-foreground mt-2">
              Status: {runStatus}
            </p>
          )}
          
          {runLogs.length > 0 && (
            <div className="mt-2 w-full">
              <p className="text-xs font-medium">Recent logs:</p>
              <div className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded-md max-h-20 overflow-y-auto">
                {runLogs.slice(-3).map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {results && !loading && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Results:</h3>
          <pre className="bg-secondary/30 p-4 rounded-md overflow-auto max-h-[200px] text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </GlassMorphCard>
  );
};

export default GumloopApiTest;
