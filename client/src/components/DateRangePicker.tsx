import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRange = { from: Date | undefined; to?: Date | undefined };

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const handleSelect = (range: DateRange | undefined) => {
    onChange(range?.from ?? null, range?.to ?? null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex border rounded-lg overflow-hidden cursor-pointer bg-white hover:bg-gray-50">
          {/* Start Date */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-2 flex-1 border-r",
              !startDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-semibold text-sm">
                {startDate ? format(startDate, "d MMM yyyy") : "Start Date"}
              </div>
              <div className="text-xs text-gray-500">
                {startDate ? format(startDate, "EEEE") : "Select date"}
              </div>
            </div>
          </div>

          {/* End Date */}
          <div
            className={cn(
              "flex items-center gap-3 px-4 py-2 flex-1",
              !endDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <div>
              <div className="font-semibold text-sm">
                {endDate ? format(endDate, "d MMM yyyy") : "End Date"}
              </div>
              <div className="text-xs text-gray-500">
                {endDate ? format(endDate, "EEEE") : "Select date"}
              </div>
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={startDate ?? new Date()}
          selected={{ from: startDate ?? undefined, to: endDate ?? undefined }}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
