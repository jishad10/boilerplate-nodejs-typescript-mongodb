import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateResponse } from "../../lib/responseFormate";
import { IUser } from "../../entities/auth/auth.interface";
import User from "../../entities/auth/auth.model";
import { RoleType } from "../../lib/types";
import config from "../config/config";
import catchAsync from "../../lib/catchAsync";


interface DecodedToken extends JwtPayload {
  _id: string;
}


export const verifyToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => 
  {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return generateResponse(res, 401, false, "No token, auth denied", null);
    }

    const decoded = jwt.verify( 
      token,
      config.jwt.accessTokenSecret!
    ) as DecodedToken;

    const user: IUser | null = await User.findById(decoded._id)
      .select("-password -createdAt -updatedAt -__v");

    if (!user) {
      return generateResponse(res, 401, false, "User not found", null);
    }

    req.user = user;
    next();
  }
);


export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    generateResponse(res, 401, false, "Unauthorized: User not found", null);
    return;
  }

  if (req.user.role !== "USER") {
    generateResponse(res, 403, false, "User access only", null);
    return;
  }

  next();
};


export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    generateResponse(res, 401, false, "Unauthorized: Admin not found", null);
    return;
  }

  if (req.user.role !== "ADMIN") {
    generateResponse(res, 403, false, "Admin access only", null);
    return;
  }

  next();
};


export const userAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const role = req.user?.role;

  if (!role || ![RoleType.USER, RoleType.ADMIN].includes(role)) {
    generateResponse(
      res,
      403,
      false,
      "User or Admin access only",
      null
    );
    return;
  }

  next();
};