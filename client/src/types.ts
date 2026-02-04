export interface User {
  _id: string;
  username: string;
  code: string;
  prefix: string;
  firstname: string;
  lastname: string;
  isActive: boolean;
  isDel: boolean;
  level: "admin" | "user";
}

export interface Log {
  _id: string;
  timestamp: string;
  request: {
    method: string;
    endpoint: string;
  };
  response: {
    statusCode: string;
    message: string;
    timeMs: number;
  };
  action: string;
  userId: User;
  labnumber: string[];
}

export interface LogQueryParams {
  action?: string[];
  startDate?: string;
  endDate?: string;
  userId?: string[];
  statusCode?: string;
  labnumber?: string;
  minTimeMs?: number;
  maxTimeMs?: number;
  page?: number;
  limit?: number;
  sortBy?: "timestamp" | "timeMs" | "action";
  sortOrder?: "none" | "asc" | "desc";
}

export interface LogResponse {
  success: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Log[];
}

export interface UserResponse {
  success: boolean;
  count: number;
  data: User[];
}
