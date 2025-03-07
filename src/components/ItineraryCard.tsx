
import React, { useState } from "react";
import { CalendarClock, MapPin } from "lucide-react";
import GlassMorphCard from "./GlassMorphCard";

// Define a fallback array of image URLs in case API data is not available
const fallbackImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/800px-Empire_State_Building_%28aerial_view%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/NYC_Downtown_Manhattan_Skyline_seen_from_Paulus_Hook_2019-12-20_IMG_7347_FRD_%28cropped%29.jpg/1280px-NYC_Downtown_Manhattan_Skyline_seen_from_Paulus_Hook_2019-12-20_IMG_7347_FRD_%28cropped%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu.jpg/800px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Top_of_Rock_Cropped.jpg/2560px-Top_of_Rock_Cropped.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Empire_State_Building_from_the_Top_of_the_Rock.jpg/1920px-Empire_State_Building_from_the_Top_of_the_Rock.jpg"
];

interface ItineraryCardProps {
  day: number;
  title: string;
  description: string;
  location: string;
  time?: string;
  cost?: string;
  image?: string;
  onClick?: () => void;
  joinedLists?: string[]; // New prop for the "joined lists" data from API
}

const ItineraryCard = ({
  day,
  title,
  description,
  location,
  time,
  cost,
  image,
  onClick,
  joinedLists = [] // Default to empty array if not provided
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
    setImageError(true);
    e.currentTarget.src = '';
    e.currentTarget.style.display = 'none';
  };

  // Function to extract image URL from joined list item
  const extractImageUrl = (item: string): string => {
    // Find the first URL in the string
    const urlMatch = item.match(/(https?:\/\/[^\s]+)/);
    return urlMatch ? urlMatch[0] : '';
  };

  // Get image from joined lists array based on day number
  // If day exceeds array length, cycle back to the beginning (modulo operation)
  let imageSource = '';
  
  if (joinedLists && joinedLists.length > 0) {
    const imageIndex = (day - 1) % joinedLists.length;
    const listItem = joinedLists[imageIndex];
    imageSource = extractImageUrl(listItem);
  } else {
    // Fallback to old method if joinedLists is not available
    const fallbackIndex = (day - 1) % fallbackImages.length;
    imageSource = fallbackImages[fallbackIndex];
  }

  return (
    <GlassMorphCard
      className="group h-full"
      hoverEffect={false}
    >
      <div className="flex flex-col h-full">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-black">
          {imageSource && !imageError && (
            <img
              src={imageSource}
              alt={title}
              className="w-full h-full object-cover"
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
          <span className="text-sm font-medium text-primary flex items-center">
            Details
            <svg
              className="h-4 w-4 ml-1"
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
          </span>
        </div>
      </div>
    </GlassMorphCard>
  );
};

export default ItineraryCard;
