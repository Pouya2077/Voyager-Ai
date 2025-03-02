
import React, { useState } from "react";
import { CalendarClock, MapPin } from "lucide-react";
import GlassMorphCard from "./GlassMorphCard";

interface ItineraryCardProps {
  day: number;
  title: string;
  description: string;
  location: string;
  time?: string;
  cost?: string;
  image?: string;
  onClick?: () => void;
}

const ItineraryCard = ({
  day,
  title,
  description,
  location,
  time,
  cost,
  image,
  onClick
}: ItineraryCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Helper function to display external links in description
  const renderDescription = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const hasUrl = urlRegex.test(text);
    
    if (hasUrl) {
      const parts = text.split(urlRegex);
      const matches = text.match(urlRegex) || [];
      
      return (
        <>
          {parts.map((part, i) => {
            if (i < matches.length) {
              return (
                <React.Fragment key={i}>
                  {part}
                  <a 
                    href={matches[i]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {matches[i]}
                  </a>
                </React.Fragment>
              );
            }
            return part;
          })}
        </>
      );
    }
    
    return text;
  };

  // Image error handling function
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`Failed to load image: ${image}`);
    setImageError(true);
    // Remove the src attribute entirely to leave a black background
    e.currentTarget.src = '';
    e.currentTarget.style.display = 'none';
  };

  // Debug: Print image URL to console
  if (image) {
    console.log(`ItineraryCard image URL (Day ${day}): ${image}`);
  }

  return (
    <GlassMorphCard
      className="group cursor-pointer h-full"
      hoverEffect={true}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-black">
          {image && !imageError && (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
              onError={handleImageError}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-medium py-1 px-2 rounded-full">
            Day {day}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">{title}</h3>
        
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <MapPin size={12} className="mr-1" />
          <span className="truncate">{location}</span>
          {time && (
            <>
              <span className="mx-1.5">•</span>
              <CalendarClock size={12} className="mr-1" />
              <span>{time}</span>
            </>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
          {renderDescription(description)}
        </p>
        
        <div className="mt-auto pt-3 border-t border-border">
          <button className="text-sm font-medium text-primary flex items-center">
            View Details
            <svg
              className="h-4 w-4 ml-1 transform transition-transform duration-200 group-hover:translate-x-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </GlassMorphCard>
  );
};

export default ItineraryCard;
