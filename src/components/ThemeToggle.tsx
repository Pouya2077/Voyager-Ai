
import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  // Light mode is now the only mode
  return (
    <button
      className={cn(
        "relative p-2 rounded-full bg-secondary/50 hover:bg-secondary/70 transition-colors",
        className
      )}
      aria-label="Light mode"
      disabled={true}
    >
      <Sun className="h-5 w-5" />
    </button>
  );
};

export default ThemeToggle;
