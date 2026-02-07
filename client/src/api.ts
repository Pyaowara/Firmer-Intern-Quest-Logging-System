import type { LogQueryParams, LogResponse, UserResponse } from "./types";

const API_BASE = "/api";

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}

export async function verifyAuth() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
}

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

  const response = await fetch(`${API_BASE}/logs?${searchParams.toString()}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }
  return response.json();
}

export async function fetchUsers(): Promise<UserResponse> {
  const response = await fetch(`${API_BASE}/users`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

export async function exportLogs(params: LogQueryParams) {
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
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const response = await fetch(
    `${API_BASE}/logs/export?${searchParams.toString()}`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to export logs");
  }
  return response.json();
}
