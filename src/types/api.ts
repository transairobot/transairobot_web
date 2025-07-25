export interface ApiResponse<T> {
  error_code: number;
  error_msg: string;
  body: T;
}
