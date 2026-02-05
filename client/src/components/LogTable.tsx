import { useState, useEffect } from "react";
import type { Log, LogQueryParams, User } from "../types";
import { fetchLogs, fetchUsers } from "../api";
import { ACTION_ORDER } from "../constants/actions";
import { DateRangePicker } from "./DateRangePicker";
import { MultiSelectFilter } from "./MultiSelectorFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateForApi,
  getDefaultStartDate,
  getDefaultEndDate,
  parseDateFromApi,
  getInitialFiltersFromStorage,
} from "@/lib/utils";

export function LogTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const initial = getInitialFiltersFromStorage();
  const [selectedActions, setSelectedActions] = useState<string[]>(
    initial.selectedActions,
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    initial.selectedUsers,
  );
  const [labnumber, setLabnumber] = useState(initial.labnumber);
  const [statusCode, setStatusCode] = useState(initial.statusCode);
  const [minTimeMs, setMinTimeMs] = useState<number>(initial.minTimeMs);
  const [maxTimeMs, setMaxTimeMs] = useState<number>(initial.maxTimeMs);
  const [filters, setFilters] = useState<LogQueryParams>(initial.filters);
  const [limit, setLimit] = useState<number>(initial.filters.limit || 50);

  useEffect(() => {
    const filtersToSave = {
      ...filters,
      action: selectedActions.length > 0 ? selectedActions : undefined,
      userId: selectedUsers.length > 0 ? selectedUsers : undefined,
      labnumber: labnumber || undefined,
      statusCode: statusCode || undefined,
      minTimeMs,
      maxTimeMs,
    };
    localStorage.setItem("logTableFilters", JSON.stringify(filtersToSave));
  }, [
    filters,
    selectedActions,
    selectedUsers,
    labnumber,
    statusCode,
    minTimeMs,
    maxTimeMs,
  ]);

  useEffect(() => {
    fetchUsers()
      .then((res) => {
        setUsers(res.data);
        setUsersLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setUsersLoading(false);
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchLogs(filters)
      .then((res) => {
        if (!cancelled) {
          setLogs(res.data);
          setTotalCount(res.totalCount);
          setTotalPages(res.totalPages);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const handleFiltersChange = (newFilters: Partial<LogQueryParams>) => {
    setLoading(true);
    setFilters({ ...filters, ...newFilters });
  };

  const handleSort = (column: "timestamp" | "timeMs" | "action") => {
    let newSortOrder: "none" | "asc" | "desc" = "asc";

    if (filters.sortBy === column) {
      if (filters.sortOrder === "asc") {
        newSortOrder = "desc";
      } else if (filters.sortOrder === "desc") {
        newSortOrder = "none";
      }
    }

    handleFiltersChange({
      sortBy: newSortOrder === "none" ? undefined : column,
      sortOrder: newSortOrder,
      page: 1,
    });
  };

  const getSortIcon = (column: "timestamp" | "timeMs" | "action") => {
    if (filters.sortBy !== column || filters.sortOrder === "none") {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    if (filters.sortOrder === "asc") {
      return <ArrowUp className="h-4 w-4" />;
    }
    return <ArrowDown className="h-4 w-4" />;
  };

  const getStatusVariant = (
    statusCode: string,
  ): "default" | "success" | "warning" | "destructive" => {
    const code = parseInt(statusCode, 10);
    if (code >= 200 && code < 300) return "success";
    if (code >= 400 && code < 500) return "warning";
    if (code >= 500) return "destructive";
    return "default";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-0">
        <CardContent className="pt-6 pl-6 pr-6">
          <div className="space-y-6">
            {/* Date Range - Full Width */}
            <div className="border-b pb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Date Range
                </label>
                <DateRangePicker
                  startDate={parseDateFromApi(filters.startDate)}
                  endDate={parseDateFromApi(filters.endDate)}
                  onChange={(start, end) =>
                    handleFiltersChange({
                      startDate: formatDateForApi(start),
                      endDate: formatDateForApi(end),
                      page: 1,
                    })
                  }
                />
              </div>
            </div>

            {/* Multi-select Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-b pb-6">
              <MultiSelectFilter
                label="Action Filter"
                options={ACTION_ORDER.map((action) => ({
                  label: action,
                  value: action,
                }))}
                selected={selectedActions}
                onChange={(actions) => {
                  setSelectedActions(actions);
                  handleFiltersChange({
                    action: actions.length > 0 ? actions : undefined,
                    page: 1,
                  });
                }}
                placeholder="Select actions to filter..."
              />
              <MultiSelectFilter
                label="User Filter"
                options={users.map((user) => ({
                  label: `${user.firstname} ${user.lastname})`,
                  value: user._id,
                }))}
                selected={selectedUsers}
                onChange={(userIds) => {
                  setSelectedUsers(userIds);
                  handleFiltersChange({
                    userId: userIds.length > 0 ? userIds : undefined,
                    page: 1,
                  });
                }}
                placeholder="Select users to filter..."
                loading={usersLoading}
              />
            </div>

            {/* Text and Number Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Lab Number
                </label>
                <Input
                  type="text"
                  placeholder="Search lab number..."
                  value={labnumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLabnumber(value);
                    handleFiltersChange({
                      labnumber: value || undefined,
                      page: 1,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status Code
                </label>
                <Input
                  type="text"
                  placeholder="Search status code..."
                  value={statusCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStatusCode(value);
                    handleFiltersChange({
                      statusCode: value || undefined,
                      page: 1,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Response Time (ms)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={Number(minTimeMs).toString()}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? 0 : parseInt(e.target.value);
                      setMinTimeMs(val);
                    }}
                    onBlur={() => {
                      if (maxTimeMs < minTimeMs) {
                        const temp = minTimeMs;
                        setMinTimeMs(maxTimeMs);
                        setMaxTimeMs(temp);
                        handleFiltersChange({
                          minTimeMs: maxTimeMs,
                          maxTimeMs: temp,
                          page: 1,
                        });
                      } else {
                        handleFiltersChange({
                          minTimeMs,
                          maxTimeMs,
                          page: 1,
                        });
                      }
                    }}
                    className="flex-1"
                    min="0"
                  />
                  <span className="text-gray-400 font-medium">—</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={Number(maxTimeMs).toString()}
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? 999999
                          : parseInt(e.target.value);
                      setMaxTimeMs(val);
                    }}
                    onBlur={() => {
                      if (maxTimeMs < minTimeMs) {
                        const temp = minTimeMs;
                        setMinTimeMs(maxTimeMs);
                        setMaxTimeMs(temp);
                        handleFiltersChange({
                          minTimeMs: maxTimeMs,
                          maxTimeMs: temp,
                          page: 1,
                        });
                      } else {
                        handleFiltersChange({
                          minTimeMs,
                          maxTimeMs,
                          page: 1,
                        });
                      }
                    }}
                    className="flex-1"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setLabnumber("");
            setStatusCode("");
            setMinTimeMs(0);
            setMaxTimeMs(999999);
            setSelectedActions([]);
            setSelectedUsers([]);
            handleFiltersChange({
              startDate: formatDateForApi(getDefaultStartDate()),
              endDate: formatDateForApi(getDefaultEndDate()),
              labnumber: undefined,
              statusCode: undefined,
              minTimeMs: 0,
              maxTimeMs: 999999,
              action: undefined,
              userId: undefined,
              page: 1,
            });
          }}
          className="text-white bg-[#e51c26] hover:text-[#e51c26] hover:bg-white border border-[#e51c26]"
        >
          Clear All Filters
        </Button>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No logs found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleSort("timestamp")}
                        className="flex items-center gap-2 hover:text-[#e51c26] transition-colors"
                      >
                        Timestamp
                        {getSortIcon("timestamp")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort("action")}
                        className="flex items-center gap-2 hover:text-[#e51c26] transition-colors"
                      >
                        Action
                        {getSortIcon("action")}
                      </button>
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort("timeMs")}
                        className="flex items-center gap-2 hover:text-[#e51c26] transition-colors"
                      >
                        Time (ms)
                        {getSortIcon("timeMs")}
                      </button>
                    </TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Lab Numbers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-mono text-sm">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        {log.userId?.prefix} {log.userId?.firstname}{" "}
                        {log.userId?.lastname}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusVariant(log.response.statusCode)}
                        >
                          {log.response.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {log.response.timeMs}
                      </TableCell>
                      <TableCell className="max-w-[600px] truncate text-sm text-gray-600">
                        {log.request.endpoint}
                      </TableCell>
                      <TableCell className="text-sm max-w-[600px]">
                        <div className="flex flex-wrap gap-1">
                          {log.labnumber.map((num, idx) => (
                            <span key={idx} className="whitespace-nowrap">
                              {num}
                              {idx < log.labnumber.length - 1 && ","}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {logs.length} of {totalCount} logs (Page{" "}
                  {filters.page} of {totalPages})
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="limit"
                    value={limit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setLimit(val);
                    }}
                    onBlur={() => {
                      handleFiltersChange({
                        limit: limit || 50,
                        page: 1,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                      }
                    }}
                    className="flex-1"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() => handleFiltersChange({ page: 1 })}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() =>
                      handleFiltersChange({ page: (filters.page || 1) - 1 })
                    }
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === totalPages}
                    onClick={() =>
                      handleFiltersChange({ page: (filters.page || 1) + 1 })
                    }
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === totalPages}
                    onClick={() => handleFiltersChange({ page: totalPages })}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
