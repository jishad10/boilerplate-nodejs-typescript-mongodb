import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RoleType } from "../../lib/types";
import config from "../../core/config/config";
import { IAddress, IUser, IUserMethods, UserModel } from "./auth.interface";


const AddressSchema = new Schema<IAddress>(
  {
    country: { type: String, default: "" },
    cityState: { type: String, default: "" },
    roadArea: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    taxId: { type: String, default: "" },
  },
  { _id: false }
);


const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: { type: String, required: true },
    username: { type: String, trim: true },
    dob: { type: Date, default: null },
    phone: { type: String, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    role: {
      type: String,
      enum: [RoleType.USER, RoleType.ADMIN],
      default: RoleType.USER,
    },
    stripeAccountId: { type: String, default: null },
    bio: { type: String, default: "" },
    address: { type: AddressSchema, default: () => ({}) },
    profileImage: { type: String, default: "" },
    multiProfileImage: { type: [String], default: [] },
    pdfFile: { type: String, default: "" },

    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },

    resetExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },

    refreshToken: { type: String, default: "" },
    hasActiveSubscription: { type: Boolean, default: false },
    subscriptionExpireDate: { type: Date, default: null },

    blockedUsers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    language: { type: String, default: "en" },
  },
  {
    timestamps: true,
  }
);


// PRE SAVE — Hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// --- Instance Methods -- //

// Compare password
UserSchema.methods.comparePassword = function (plainPassword: string) 
{
  return bcrypt.compare(plainPassword, this.password);
};

// Generate access token
UserSchema.methods.generateAccessToken = function (payload: object) 
{
  return jwt.sign(payload, config.jwt.accessTokenSecret!, {
    expiresIn: config.jwt.accessTokenExpires as any,
  });
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function (payload: object) 
{
  return jwt.sign(payload, config.jwt.refreshTokenSecret!, {
    expiresIn: config.jwt.refreshTokenExpires as any,
  });
};


export const User = model<IUser, UserModel>("User", UserSchema);

export default User;

