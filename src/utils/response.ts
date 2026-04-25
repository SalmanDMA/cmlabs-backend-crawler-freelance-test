import { Response } from "express";

type ResponseData<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const successResponse = <T>(
  res: Response,
  message: string,
  status = 200,
  data?: T,
): Response => {
  const responseData: ResponseData<T> = {
    success: true,
    message,
    data,
  };
  return res.status(status).json(responseData);
};

export const errorResponse = (
  res: Response,
  message: string,
  status = 500,
): Response => {
  let finalMessage = message;

  if (message.toLowerCase().includes("foreign key constraint")) {
    finalMessage = "Cannot delete data as it is in use in other tables.";
  }

  const responseData: ResponseData<null> = {
    success: false,
    message: finalMessage,
  };

  return res.status(status).json(responseData);
};
