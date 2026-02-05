import type { LogQueryParams, LogResponse, UserResponse } from "./types";

const API_BASE = "/api";

export async function fetchLogs(params: LogQueryParams): Promise<LogResponse> {
  const searchParams = new URLSearchParams();

  if (params.action?.length) {
    params.action.forEach((a) => searchParams.append("action", a));
  }
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.userId?.length) {
    params.userId.forEach((id) => searchParams.append("userId", id));
  }
  if (params.statusCode) searchParams.set("statusCode", params.statusCode);
  if (params.labnumber) searchParams.set("labnumber", params.labnumber);
  if (params.minTimeMs !== undefined)
    searchParams.set("minTimeMs", String(params.minTimeMs));
  if (params.maxTimeMs !== undefined)
    searchParams.set("maxTimeMs", String(params.maxTimeMs));
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(`${API_BASE}/logs?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }
  return response.json();
}

export async function fetchUsers(): Promise<UserResponse> {
  const response = await fetch(`${API_BASE}/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}
