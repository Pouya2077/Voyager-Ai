
import { useState, useEffect, useRef } from "react";
import { Search, X, MapPin } from "lucide-react";

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  initialValue?: string;
}

const LocationSearch = ({ onLocationSelect, initialValue = "" }: LocationSearchProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock locations data (in a real app, this would come from an API)
  const popularLocations = [
    "Paris, France",
    "Tokyo, Japan",
    "New York, USA",
    "Rome, Italy",
    "Barcelona, Spain",
    "London, UK",
    "Sydney, Australia",
    "Dubai, UAE",
    "Bangkok, Thailand",
    "Bali, Indonesia"
  ];

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filteredLocations = popularLocations.filter(location =>
        location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filteredLocations);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleClear = () => {
    setSearchTerm("");
    setSuggestions([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelect = (location: string) => {
    setSearchTerm(location);
    setSuggestions([]);
    onLocationSelect(location);
  };

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      onLocationSelect(searchTerm);
      setIsSearchFocused(false);
    }
  };

  const handleBlur = () => {
    // Allow selecting custom locations that are not in the suggestions list
    setTimeout(() => {
      setIsSearchFocused(false);
      // If there's a valid search term, use it even if it's not in the suggestions
      if (searchTerm.trim() && !popularLocations.includes(searchTerm)) {
        onLocationSelect(searchTerm);
      }
    }, 200);
  };

  return (
    <div className="relative w-full">
      <div className={`flex items-center transition-all duration-300 bg-white border rounded-xl overflow-hidden ${
        isSearchFocused ? "ring-2 ring-primary/30 border-primary" : "border-border"
      }`}>
        <div className="flex-shrink-0 pl-3 text-muted-foreground">
          <Search size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleInputSubmit}
          placeholder="Search destinations..."
          className="w-full py-3 px-3 bg-transparent outline-none text-foreground"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-2 mr-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {isSearchFocused && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-border overflow-hidden animate-scale-in origin-top">
          {suggestions.length > 0 ? (
            <ul className="py-1 max-h-60 overflow-auto">
              {suggestions.map((location) => (
                <li key={location}>
                  <button
                    onClick={() => handleSelect(location)}
                    className="flex items-center w-full px-4 py-2 hover:bg-muted text-left transition-colors"
                  >
                    <MapPin size={16} className="mr-2 text-primary" />
                    <span>{location}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm.length > 1 ? (
            <div className="p-4">
              <div className="text-center text-muted-foreground mb-2">
                No matching destinations found.
              </div>
              <button
                onClick={() => handleSelect(searchTerm)}
                className="flex items-center justify-center w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-md text-primary transition-colors"
              >
                <MapPin size={16} className="mr-2" />
                <span>Use "{searchTerm}" as destination</span>
              </button>
            </div>
          ) : (
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Popular Destinations
              </div>
              <ul className="grid grid-cols-2 gap-1">
                {popularLocations.slice(0, 6).map((location) => (
                  <li key={location}>
                    <button
                      onClick={() => handleSelect(location)}
                      className="flex items-center w-full px-2 py-1.5 hover:bg-muted rounded-md text-left text-sm transition-colors"
                    >
                      <MapPin size={14} className="mr-1.5 text-primary" />
                      <span className="truncate">{location}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
