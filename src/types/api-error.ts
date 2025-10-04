/**
 * APIエラーレスポンスの型定義
 */

export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
      success?: boolean;
    };
    status?: number;
  };
  message?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
  };
}

export const getErrorMessage = (error: unknown): string => {
  const apiError = error as ApiErrorResponse;
  return apiError.response?.data?.message || 
         apiError.response?.data?.error || 
         apiError.message || 
         'エラーが発生しました';
};

export const isApiError = (error: unknown): error is ApiErrorResponse => {
  return error !== null && 
         typeof error === 'object' &&
         'response' in error;
};
