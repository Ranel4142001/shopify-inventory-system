import { Request, Response, NextFunction } from 'express';

// Define a unified interface for all API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
  };
}

/**Global interceptor that overrides res.json to guarantee 
 * a consistent API response envelope across the application.
 */
export function responseInterceptor(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Preserve the original res.json function
  const originalJson = res.json;

  // Override res.json
  res.json = function (body: any): Response {
    // If the body already conforms to our standard structure, pass it through
    if (body && typeof body === 'object' && ('success' in body || 'error' in body)) {
      return originalJson.call(this, body);
    }

    // Wrap structural data inside the standard success envelope
    const formattedResponse: ApiResponse = {
      success: res.statusCode >= 200 && res.statusCode < 300,
      data: body,
    };

    return originalJson.call(this, formattedResponse);
  };

  next();
}