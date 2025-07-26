export interface ApiResponse<T> {
  code: number;
  message: string;
  body: T;
}

export const SuccessCode = 20000;
