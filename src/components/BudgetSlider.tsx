
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface BudgetSliderProps {
  onBudgetChange: (value: number) => void;
  initialValue?: number;
}

const BudgetSlider = ({ onBudgetChange, initialValue = 1000 }: BudgetSliderProps) => {
  const [budget, setBudget] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue.toString());
  
  const handleSliderChange = (value: number[]) => {
    const newBudget = value[0];
    setBudget(newBudget);
    setInputValue(newBudget.toString());
    onBudgetChange(newBudget);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 100 && numValue <= 10000) {
      setBudget(numValue);
      onBudgetChange(numValue);
    } else {
      setInputValue(budget.toString());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  // Determine budget category
  const getBudgetCategory = (value: number) => {
    if (value < 500) return "Budget";
    if (value < 1500) return "Moderate";
    if (value < 3000) return "Comfort";
    if (value < 5000) return "Luxury";
    return "Ultra Luxury";
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Your Budget</p>
          <p className="text-xs text-muted-foreground">
            {getBudgetCategory(budget)} travel
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-lg font-medium">$</span>
          {isEditing ? (
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-24 border rounded-md px-2 py-1 text-right"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-lg font-medium bg-transparent hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
            >
              {budget.toLocaleString()}
            </button>
          )}
        </div>
      </div>
      
      <Slider
        defaultValue={[budget]}
        min={100}
        max={10000}
        step={100}
        value={[budget]}
        onValueChange={handleSliderChange}
        className="py-2"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>$100</span>
        <span>$10,000+</span>
      </div>
    </div>
  );
};

export default BudgetSlider;
