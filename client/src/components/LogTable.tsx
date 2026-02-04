import { useState, useEffect } from "react";
import type { Log, LogQueryParams } from "../types";
import { fetchLogs } from "../api";
import { DateRangePicker } from "./DateRangePicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDateForApi(date: Date | null): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T00:00`;
}

function parseDateFromApi(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  return new Date(dateStr);
}

export function LogTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<LogQueryParams>({
    page: 1,
    limit: 50,
  });

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
      {/* Date Range Picker */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-1.5 max-w-md">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
        </CardContent>
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
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time (ms)</TableHead>
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
                        {log.userId?.firstname} {log.userId?.lastname}
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
