import { Types, Model, HydratedDocument } from "mongoose";
import { RoleType } from "../../lib/types";


export interface IAddress {
  country?: string;
  cityState?: string;
  roadArea?: string;
  postalCode?: string;
  taxId?: string;
}


export interface IUser {
  name: string;
  email: string;
  password: string;

  username?: string | null;
  dob?: Date | null;
  phone?: string | null;

  gender: "male" | "female" | "other";
  role: typeof RoleType[keyof typeof RoleType];

  stripeAccountId?: string | null;
  bio?: string | null;

  address?: IAddress;

  profileImage?: string | null;
  multiProfileImage: string[];

  pdfFile?: string | null;

  otp?: string | null;
  otpExpires?: Date | null;
  otpVerified: boolean;

  resetExpires?: Date | null;
  isVerified: boolean;

  refreshToken?: string | null;

  hasActiveSubscription: boolean;
  subscriptionExpireDate?: Date | null;

  blockedUsers: Types.ObjectId[];

  language: string;
}


export interface IUserMethods {
  comparePassword(plainPassword: string): Promise<boolean>;
  generateAccessToken(payload: object): string;
  generateRefreshToken(payload: object): string;
}


// Hydrated Document Type
export type UserDocument = HydratedDocument<IUser, IUserMethods>;


// Model Type
export type UserModel = Model<IUser, {}, IUserMethods>;