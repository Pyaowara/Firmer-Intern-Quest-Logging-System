import type { LogQueryParams } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateForApi(date: Date | null): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function parseDateFromApi(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  return new Date(dateStr);
}

export function getDefaultStartDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getDefaultEndDate(): Date {
  const today = new Date();
  today.setHours(23, 59, 0, 0);
  return today;
}

export const getInitialFiltersFromStorage = (): {
  filters: LogQueryParams;
  selectedActions: string[];
  selectedUsers: string[];
  labnumber: string;
  statusCode: string;
  minTimeMs: number;
  maxTimeMs: number;
} => {
  try {
    const saved = localStorage.getItem("logTableFilters");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        filters: {
          page: 1,
          limit: parsed.limit || 50,
          startDate:
            parsed.startDate || formatDateForApi(getDefaultStartDate()),
          endDate: parsed.endDate || formatDateForApi(getDefaultEndDate()),
          action: parsed.action,
          userId: parsed.userId,
          labnumber: parsed.labnumber,
          statusCode: parsed.statusCode,
          minTimeMs: parsed.minTimeMs ?? 0,
          maxTimeMs: parsed.maxTimeMs ?? 999999,
        },
        selectedActions: parsed.action || [],
        selectedUsers: parsed.userId || [],
        labnumber: parsed.labnumber || "",
        statusCode: parsed.statusCode || "",
        minTimeMs: parsed.minTimeMs ?? 0,
        maxTimeMs: parsed.maxTimeMs ?? 999999,
      };
    }
  } catch (err) {
    console.error("Failed to load filters from localStorage:", err);
  }

  return {
    filters: {
      page: 1,
      limit: 50,
      startDate: formatDateForApi(getDefaultStartDate()),
      endDate: formatDateForApi(getDefaultEndDate()),
    },
    selectedActions: [],
    selectedUsers: [],
    labnumber: "",
    statusCode: "",
    minTimeMs: 0,
    maxTimeMs: 999999,
  };
};
