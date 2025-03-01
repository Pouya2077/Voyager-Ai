
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { Menu, X, LogOut } from "lucide-react";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    toast.success("Successfully logged out!");
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          Travel Planner
        </Link>
        
        <div className="items-center hidden md:flex">
          <Link to="/" className="mx-3 text-sm hover:text-primary">
            Home
          </Link>
          <Link to="/plan" className="mx-3 text-sm hover:text-primary">
            Plan a Trip
          </Link>
          {/* Add more navigation links here */}
        </div>
        
        <div className="flex items-center">
          {username && (
            <span className="mr-4 text-sm text-muted-foreground hidden md:block">
              Welcome, {username}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="mr-2"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md py-4 border-b border-border">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link 
              to="/" 
              className="py-2 text-sm hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/plan" 
              className="py-2 text-sm hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Plan a Trip
            </Link>
            {/* Add more mobile navigation links here */}
            {username && (
              <div className="py-2 text-sm text-muted-foreground">
                Logged in as {username}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center justify-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
