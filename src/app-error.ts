export default class AppError {
  readonly visibleByUser: boolean;
  readonly httpCode: number;
  readonly message: string;
  readonly debugInfo: string;

  constructor({
    visibleByUser,
    httpCode,
    message,
    debugInfo = "",
  }: {
    visibleByUser: boolean;
    httpCode: number;
    message: string;
    debugInfo?: string;
  }) {
    this.visibleByUser = visibleByUser;
    this.httpCode = httpCode;
    this.message = message;
    this.debugInfo = debugInfo;
  }
}
