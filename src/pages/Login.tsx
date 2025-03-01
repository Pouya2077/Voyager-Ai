
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import GlassMorphCard from "@/components/GlassMorphCard";
import { ArrowRight, LogIn, User, Lock, Mail } from "lucide-react";
import { startGumloopPipeline, getPipelineRunStatus } from "@/utils/gumloopApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

const Login = ({ setIsLoggedIn }: LoginProps) => {
  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sign-up");
  const navigate = useNavigate();

  const handleAuthentication = async (e: React.FormEvent, mode: "sign-up" | "sign-in") => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call Gumloop API for sign-up or sign-in
      const userId = "1y5cS7wht6QDSjLHGBJOi6vu19y1";
      const savedItemId = "2KLH8qYh4rTQf4qYM1Sfh3";
      const apiKey = "4997b5ac80a9402d977502ac41891eec";

      const pipelineInputs = [
        { input_name: "name", value: username },
        { input_name: "email", value: email },
        { input_name: "password", value: password },
        { input_name: "mode", value: mode }
      ];

      // Start the pipeline with all inputs
      const pipelineResponse = await startGumloopPipeline(
        userId,
        savedItemId,
        apiKey,
        pipelineInputs
      );

      if (pipelineResponse && pipelineResponse.run_id) {
        const runId = pipelineResponse.run_id;
        
        // Poll for results
        let isComplete = false;
        let attempts = 0;
        let authResult = null;
        
        while (!isComplete && attempts < 30) {
          attempts++;
          
          const statusResponse = await getPipelineRunStatus(runId, userId, apiKey);
          
          // Check if there are outputs or if the pipeline is done
          if (
            statusResponse.state === "COMPLETED" || 
            statusResponse.state === "ERROR" || 
            (statusResponse.outputs && statusResponse.outputs.authStatus)
          ) {
            isComplete = true;
            authResult = statusResponse.outputs;
            
            if (authResult && authResult.authStatus === "success") {
              // Set login state
              localStorage.setItem("isLoggedIn", "true");
              localStorage.setItem("username", username);
              localStorage.setItem("email", email);
              // Update parent component state
              setIsLoggedIn(true);
              toast.success(mode === "sign-up" ? "Successfully signed up!" : "Successfully signed in!");
              // Force navigate to home page
              navigate("/", { replace: true });
            } else {
              toast.error(`${mode === "sign-up" ? "Sign up" : "Sign in"} failed: ${authResult?.message || "Unknown error"}`);
            }
          } else {
            // Wait before polling again
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!isComplete) {
          toast.error(`${mode === "sign-up" ? "Sign up" : "Sign in"} took too long, please try again`);
        }
      } else {
        throw new Error(`Failed to start authentication pipeline`);
      }
    } catch (error) {
      console.error(`${mode === "sign-up" ? "Sign up" : "Sign in"} error:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${mode === "sign-up" ? "sign up" : "sign in"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Set login state to true even when skipping
    localStorage.setItem("isLoggedIn", "true");
    // Update parent component state
    setIsLoggedIn(true);
    // Force navigate to home page with replace to prevent back navigation to login
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Travel Planner</h1>
          <p className="text-muted-foreground mt-2">Sign up or sign in to plan your next adventure</p>
        </div>

        <GlassMorphCard className="w-full">
          <Tabs 
            defaultValue="sign-up" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="sign-up">
              <form onSubmit={(e) => handleAuthentication(e, "sign-up")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Signing up...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign Up
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="sign-in">
              <form onSubmit={(e) => handleAuthentication(e, "sign-in")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 pt-4 border-t border-border">
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={handleSkip}
            >
              Skip for now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </GlassMorphCard>
      </div>
    </div>
  );
};

export default Login;
