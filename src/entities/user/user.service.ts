import { Types } from "mongoose";
import User from "../auth/auth.model";
import { RoleType } from "../../lib/types";
import { createFilter, createPaginationInfo } from "../../lib/pagination";
import { cloudinaryUpload, cloudinaryDelete } from "../../lib/cloudinaryUpload";
import AppError from "../../core/error/appError";


// ─── DTO Types ────────────────

interface GetUsersInput {
  page?: string | number;
  limit?: string | number;
  search?: string;
  date?: string;
}

interface UpdateUserInput {
  id: Types.ObjectId;
  [key: string]: any;
}

const SELECT_FIELDS = "-password -createdAt -updatedAt -__v -verificationCode -verificationCodeExpires";


// ─── Admin ─────────────────

export const getAllUsers = async ({ page = 1, limit = 10, search, date }: GetUsersInput) => {
  const _page = Number(page);
  const _limit = Number(limit);

  const filter = createFilter(search, date);
  filter.role = RoleType.USER;

  const totalUsers = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select(SELECT_FIELDS)
    .sort({ createdAt: -1 })
    .skip((_page - 1) * _limit)
    .limit(_limit);

  return { users, paginationInfo: createPaginationInfo(_page, _limit, totalUsers) };
};


export const getAllAdmins = async ({ page = 1, limit = 10, search, date }: GetUsersInput) => {
  const _page = Number(page);
  const _limit = Number(limit);

  const filter = { ...createFilter(search, date), role: RoleType.ADMIN };

  const totalAdmins = await User.countDocuments(filter);
  const admins = await User.find(filter)
    .select(SELECT_FIELDS)
    .sort({ createdAt: -1 })
    .skip((_page - 1) * _limit)
    .limit(_limit);

  return { admins, paginationInfo: createPaginationInfo(_page, _limit, totalAdmins) };
};


// ─── User Profile ────────────────

export const getUserById = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId).select(SELECT_FIELDS);
  if (!user) throw new AppError(404, "User not found");
  return user;
};


export const updateUser = async ({ id, ...updateData }: UpdateUserInput) => {
  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select(SELECT_FIELDS);

  if (!updatedUser) throw new AppError(404, "User not found");
  return updatedUser;
};


export const deleteUser = async (userId: Types.ObjectId) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) throw new AppError(404, "User not found");
  return true;
};


// ─── Single Avatar ─────────────────

export const createAvatarProfile = async (id: Types.ObjectId, files: Express.Multer.Files) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");

  const profileImage = files["profileImage"]?.[0];
  if (!profileImage) throw new AppError(400, "Profile image is required");

  const result = await cloudinaryUpload(profileImage.path, `${user._id}-${Date.now()}`, "user-profile");

  return User.findByIdAndUpdate(id, { profileImage: result.url }, { new: true }).select(SELECT_FIELDS);
};


export const updateAvatarProfile = async (id: Types.ObjectId, files: Express.Multer.Files) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");

  const profileImage = files["profileImage"]?.[0];
  if (!profileImage) throw new AppError(400, "Profile image is required");

  if (user.profileImage) await cloudinaryDelete(user.profileImage);

  const result = await cloudinaryUpload(profileImage.path, `${user._id}-${Date.now()}`, "user-profile");

  return User.findByIdAndUpdate(id, { profileImage: result.url }, { new: true }).select(SELECT_FIELDS);
};


export const deleteAvatarProfile = async (id: Types.ObjectId) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");
  if (!user.profileImage) throw new AppError(400, "No profile image to delete");

  await cloudinaryDelete(user.profileImage);

  return User.findByIdAndUpdate(id, { profileImage: "" }, { new: true }).select(SELECT_FIELDS);
};


// ─── Multiple Avatar ───────────────

export const createMultipleAvatar = async (id: Types.ObjectId, files: Express.Multer.Files) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");

  const images = files["multiProfileImage"];
  if (!images?.length) throw new AppError(400, "Profile images are required");

  const imageUrls = await Promise.all(
    images.map((image, index) =>
      cloudinaryUpload(image.path, `${user._id}-${Date.now()}-${index}`, "user-profile").then((r) => r.url)
    )
  );

  return User.findByIdAndUpdate(id, { multiProfileImage: imageUrls }, { new: true }).select(SELECT_FIELDS);
};


export const updateMultipleAvatar = async (id: Types.ObjectId, files: Express.Multer.Files) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");

  const images = files["multiProfileImage"];
  if (!images?.length) throw new AppError(400, "Profile images are required");

  if (user.multiProfileImage?.length) {
    await Promise.all(user.multiProfileImage.map((url) => cloudinaryDelete(url)));
  }

  const imageUrls = await Promise.all(
    images.map((image, index) =>
      cloudinaryUpload(image.path, `${user._id}-${Date.now()}-${index}`, "user-profile").then((r) => r.url)
    )
  );

  return User.findByIdAndUpdate(id, { multiProfileImage: imageUrls }, { new: true }).select(SELECT_FIELDS);
};


export const deleteMultipleAvatar = async (id: Types.ObjectId) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");
  if (!user.multiProfileImage?.length) throw new AppError(400, "No profile images to delete");

  await Promise.all(user.multiProfileImage.map((url) => cloudinaryDelete(url)));

  return User.findByIdAndUpdate(id, { multiProfileImage: [] }, { new: true }).select(SELECT_FIELDS);
};


// ─── PDF ───────────────────────

export const createUserPDF = async (id: Types.ObjectId, files: Express.Multer.Files) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");

  const pdfFile = files["userPDF"]?.[0];
  if (!pdfFile) throw new AppError(400, "PDF file is required");

  const result = await cloudinaryUpload(pdfFile.path, `${user._id}-${Date.now()}`, "user-pdf");

  return User.findByIdAndUpdate(id, { pdfFile: result.url }, { new: true }).select(SELECT_FIELDS);
};


export const updateUserPDF = async (id: Types.ObjectId, files: Express.Multer.Files) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");

  const pdfFile = files["userPDF"]?.[0];
  if (!pdfFile) throw new AppError(400, "PDF file is required");

  if (user.pdfFile) await cloudinaryDelete(user.pdfFile);

  const result = await cloudinaryUpload(pdfFile.path, `${user._id}-${Date.now()}`, "user-pdf");

  return User.findByIdAndUpdate(id, { pdfFile: result.url }, { new: true }).select(SELECT_FIELDS);
};


export const deleteUserPDF = async (id: Types.ObjectId) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");
  if (!user.pdfFile) throw new AppError(400, "No PDF file to delete");

  await cloudinaryDelete(user.pdfFile);

  return User.findByIdAndUpdate(id, { pdfFile: null }, { new: true }).select(SELECT_FIELDS);
};


// ─── ADMIN ───────────────────────

export const adminGetUserById = async (userId: string) => {
  const user = await User.findById(userId).select(SELECT_FIELDS);
  if (!user) throw new AppError(404, "User not found");
  return user;
};


export const adminUpdateUser = async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select(SELECT_FIELDS);

  if (!updatedUser) throw new AppError(404, "User not found");
  return updatedUser;
};


export const adminDeleteUser = async (userId: string) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) throw new AppError(404, "User not found");
  return true;
};