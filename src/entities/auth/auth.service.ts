import jwt from "jsonwebtoken";
import User from "./auth.model";
import config from "../../core/config/config";
import sendEmail from "../../lib/sendEmail";
import verificationCodeTemplate from "../../lib/emailTemplates";
import AppError from "../../core/error/appError";


// DTO Types
interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

interface OTPInput {
  email: string;
  otp: string;
}

interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

interface ChangePasswordInput {
  userId: string;
  oldPassword: string;
  newPassword: string;
}


export const registerUserService = async ({
  name,
  email,
  password,
}: RegisterUserInput) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(400, "User already registered");
  }

  const user = await User.create({ name, email, password });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
  };
};


export const loginUserService = async ({ email, password }: LoginUserInput) => {
  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError(400, "Invalid password");
  }

  const payload = { _id: user._id, role: user.role };

  const refreshToken = user.generateRefreshToken(payload);
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      refreshToken,
    },
    accessToken: user.generateAccessToken(payload),
  };
};


export const refreshAccessTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(400, "No refresh token provided");
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new AppError(401, "Invalid refresh token");
  }

  const decoded: any = jwt.verify(
    refreshToken,
    config.jwt.refreshTokenSecret!
  );

  if (decoded._id !== user._id.toString()) {
    throw new AppError(401, "Invalid refresh token");
  }

  const payload = { _id: user._id, role: user.role };

  const newRefreshToken = user.generateRefreshToken(payload);
  user.refreshToken = newRefreshToken;

  await user.save({ validateBeforeSave: false });

  return {
    accessToken: user.generateAccessToken(payload),
    refreshToken: newRefreshToken,
  };
};


export const forgetPasswordService = async (email: string) => {
  if (!email) {
    throw new AppError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "Invalid email");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpires = new Date(Date.now() + config.email.expires);
  user.otpVerified = false;
  user.resetExpires = null;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: email,
    subject: "Password Reset OTP",
    html: verificationCodeTemplate(otp),
  });
};


export const verifyCodeService = async ({ email, otp }: OTPInput) => {
  if (!email || !otp) {
    throw new AppError(400, "Email and otp are required");
  }

  const user = await User.findOne({ email });

  if (!user || !user.otp || !user.otpExpires) {
    throw new AppError(404, "Otp not found");
  }

  if (
    parseInt(user.otp) !== parseInt(otp) ||
    Date.now() > user.otpExpires.getTime()
  ) {
    throw new AppError(403, "Invalid or expired otp");
  }

  user.otp = null;
  user.otpExpires = null;
  user.otpVerified = true;
  user.resetExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save({ validateBeforeSave: false });
};


export const resetPasswordService = async ({
  email,
  newPassword,
}: ResetPasswordInput) => {
  if (!email || !newPassword) {
    throw new AppError(400, "Email and new password are required");
  }

  const user = await User.findOne({ email });

  if (!user) throw new AppError(404, "Invalid email");

  if (!user.otpVerified || !user.resetExpires) {
    throw new AppError(403, "OTP verification required");
  }

  if (Date.now() > user.resetExpires.getTime()) {
    throw new AppError(403, "Reset session expired");
  }

  user.password = newPassword;
  user.otpVerified = false;
  user.resetExpires = null;

  await user.save();
};


export const changePasswordService = async ({
  userId,
  oldPassword,
  newPassword,
}: ChangePasswordInput) => {
  if (!userId || !oldPassword || !newPassword) {
    throw new AppError(400, "All password fields are required");
  }

  const user = await User.findById(userId);

  if (!user) throw new AppError(404, "User not found");

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    throw new AppError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save();
};