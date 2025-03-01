
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import GlassMorphCard from "@/components/GlassMorphCard";
import { ArrowRight, LogIn, User, Lock } from "lucide-react";

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

const Login = ({ setIsLoggedIn }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // Set login state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);
      // Update parent component state
      setIsLoggedIn(true);
      toast.success("Successfully logged in!");
      // Force navigate to home page
      navigate("/", { replace: true });
    }, 1000);
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
          <p className="text-muted-foreground mt-2">Log in to plan your next adventure</p>
        </div>

        <GlassMorphCard className="w-full">
          <form onSubmit={handleLogin} className="space-y-4">
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
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </span>
              )}
            </Button>
          </form>

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
