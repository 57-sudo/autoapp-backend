export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(msg: string) { return new ApiError(400, msg); }
  static unauthorized(msg: string) { return new ApiError(401, msg); }
  static forbidden(msg: string) { return new ApiError(403, msg); }
  static notFound(msg: string) { return new ApiError(404, msg); }
}
