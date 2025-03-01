
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassMorphCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const GlassMorphCard = ({ 
  children, 
  className, 
  hoverEffect = false 
}: GlassMorphCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-lg transition-all",
        hoverEffect && "hover:shadow-md hover:translate-y-[-2px]",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassMorphCard;
