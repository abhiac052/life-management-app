export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { timestamp: string };
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
  meta: { timestamp: string };
}
