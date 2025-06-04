import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types/common";

export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: Response,
  error: string,
  statusCode: number = 400,
  errors?: Record<string, string[]>
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    errors,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const pages = Math.ceil(total / limit);

  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    data: {
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    },
    message,
  };

  return res.status(200).json(response);
};

export const sendValidationErrorResponse = (
  res: Response,
  errors: Record<string, string[]>
): Response => {
  return sendErrorResponse(res, "Validation failed", 422, errors);
};
