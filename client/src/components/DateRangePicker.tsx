import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
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
  const [startTime, setStartTime] = useState(
    startDate ? format(startDate, "HH:mm") : "00:00",
  );
  const [endTime, setEndTime] = useState(
    endDate ? format(endDate, "HH:mm") : "23:59",
  );

  const applyTime = (date: Date | null, time: string): Date | null => {
    if (!date) return null;
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const handleSelect = (range: DateRange | undefined) => {
    const from = range?.from ? applyTime(range.from, startTime) : null;
    const to = range?.to ? applyTime(range.to, endTime) : null;
    onChange(from, to);
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (startDate) {
      const newStart = applyTime(startDate, time);
      onChange(newStart, endDate);
    }
  };

  const handleEndTimeChange = (time: string) => {
    setEndTime(time);
    if (endDate) {
      const newEnd = applyTime(endDate, time);
      onChange(startDate, newEnd);
    }
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
                {startDate
                  ? `${format(startDate, "d MMM yyyy")} ${startTime}`
                  : "Start Date"}
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
                {endDate
                  ? `${format(endDate, "d MMM yyyy")} ${endTime}`
                  : "End Date"}
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
        <div className="flex border-t p-3 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <label className="text-sm text-gray-500">Start:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <label className="text-sm text-gray-500">End:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
