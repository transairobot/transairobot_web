export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const SuccessCode = 0;
