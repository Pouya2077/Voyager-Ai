
import { CalendarClock, MapPin, BadgeDollarSign, Users } from "lucide-react";
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
  return (
    <GlassMorphCard
      className="group cursor-pointer h-full"
      hoverEffect={true}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
          <img
            src={image || "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80"}
            alt={title}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-medium py-1 px-2 rounded-full">
            Day {day}
          </div>
          {cost && (
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-foreground text-xs font-medium py-1 px-2 rounded-full flex items-center">
              <BadgeDollarSign size={12} className="mr-1" />
              {cost}
            </div>
          )}
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
          {description}
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
