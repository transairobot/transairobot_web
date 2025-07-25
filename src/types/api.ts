export interface ApiResponse<T> {
  code: number;
  msg: string;
  body: T;
}
