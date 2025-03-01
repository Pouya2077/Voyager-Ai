
import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TripDurationPickerProps {
  onDatesChange: (startDate: Date, endDate: Date, duration: number) => void;
}

const TripDurationPicker = ({ onDatesChange }: TripDurationPickerProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(undefined);
    } else if (date && date > startDate) {
      setEndDate(date);
      if (date && startDate) {
        const duration = differenceInDays(date, startDate) + 1;
        onDatesChange(startDate, date, duration);
      }
    } else {
      setStartDate(date);
      setEndDate(undefined);
    }
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
    }
    return "Select trip dates";
  };

  // Calculate trip duration in days
  const duration = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  return (
    <div className="w-full">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex h-14 w-full items-center justify-between rounded-xl border bg-white px-4 py-2 text-left font-normal transition-all",
              isCalendarOpen ? "ring-2 ring-primary/30 border-primary" : "border-border"
            )}
          >
            <div className="flex items-center">
              <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-foreground">
                  {formatDateRange()}
                </p>
                {duration > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {duration} {duration === 1 ? "day" : "days"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              {duration > 0 ? duration : "?"}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={startDate}
            selected={{
              from: startDate,
              to: endDate,
            }}
            onSelect={(range) => {
              if (range?.from) handleSelect(range.from);
              if (range?.to) handleSelect(range.to);
            }}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TripDurationPicker;
