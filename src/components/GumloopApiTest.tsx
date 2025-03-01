
import { useState } from "react";
import { fetchGumloopOutputs } from "@/utils/gumloopApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassMorphCard from "./GlassMorphCard";
import { toast } from "sonner";

interface GumloopApiTestProps {
  className?: string;
}

const GumloopApiTest = ({ className }: GumloopApiTestProps) => {
  const [workbookId, setWorkbookId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
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
    try {
      // Example inputs - adjust based on your Gumloop workbook requirements
      const inputs = {
        destination: "Paris, France",
        duration: 5,
        budget: 2000
      };
      
      const data = await fetchGumloopOutputs(workbookId, apiKey, inputs);
      setResults(data);
      toast.success("Successfully fetched data from Gumloop!");
    } catch (error) {
      console.error("Gumloop API test failed:", error);
      toast.error("Failed to fetch data from Gumloop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassMorphCard className={className}>
      <h2 className="text-xl font-semibold mb-4">Test Gumloop API Connection</h2>
      
      <div className="space-y-4">
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
        
        <Button 
          onClick={handleTestApi} 
          className="w-full"
          disabled={loading}
        >
          {loading ? "Testing..." : "Test Connection"}
        </Button>
      </div>
      
      {results && (
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
