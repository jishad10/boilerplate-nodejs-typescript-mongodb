import { Request, Response } from "express";
import { generateResponse } from "../../lib/responseFormate";
import catchAsync from "../../lib/catchAsync";
import {
  getAllUsers,
  getAllAdmins,
  getUserById,
  updateUser,
  deleteUser,
  createAvatarProfile,
  updateAvatarProfile,
  deleteAvatarProfile,
  createMultipleAvatar,
  updateMultipleAvatar,
  deleteMultipleAvatar,
  createUserPDF,
  updateUserPDF,
  deleteUserPDF,
  adminGetUserById,
  adminUpdateUser,
  adminDeleteUser,
} from "./user.service";


// ─── Admin ───────────────────────

export const getAllUsersController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, date } = req.query as Record<string, string | undefined>;

  const { users, paginationInfo } = await getAllUsers({
    ...(page !== undefined && { page }),
    ...(limit !== undefined && { limit }),
    ...(search !== undefined && { search }),
    ...(date !== undefined && { date }),
  });

  return generateResponse(res, 200, true, "Users fetched successfully", { users, paginationInfo });
});


export const getAllAdminsController = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, date } = req.query as Record<string, string | undefined>;

  const { admins, paginationInfo } = await getAllAdmins({
    ...(page !== undefined && { page }),
    ...(limit !== undefined && { limit }),
    ...(search !== undefined && { search }),
    ...(date !== undefined && { date }),
  });

  return generateResponse(res, 200, true, "Admins fetched successfully", { admins, paginationInfo });
});


// ─── User Profile ───────────────

export const getUserProfileController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const user = await getUserById(userId);

  return generateResponse(res, 200, true, "User profile fetched successfully", user);
});


export const updateUserProfileController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const updatedUser = await updateUser({ id: userId, ...req.body });

  return generateResponse(res, 200, true, "User profile updated successfully", updatedUser);
});


export const deleteOwnAccountController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  await deleteUser(userId);

  return generateResponse(res, 200, true, "Your account has been deleted", null);
});


// ─── Single Avatar ─────────────

export const createAvatarController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  if (!req.files || !(req.files as Express.Multer.Files)["profileImage"]) {
    return generateResponse(res, 400, false, "Profile image is required", null);
  }

  const user = await createAvatarProfile(userId, req.files as Express.Multer.Files);

  return generateResponse(res, 200, true, "Avatar uploaded successfully", user);
});


export const updateAvatarProfileController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  if (!req.files || !(req.files as Express.Multer.Files)["profileImage"]) {
    return generateResponse(res, 400, false, "Profile image is required", null);
  }

  const user = await updateAvatarProfile(userId, req.files as Express.Multer.Files);

  return generateResponse(res, 200, true, "Avatar updated successfully", user);
});


export const deleteAvatarController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const user = await deleteAvatarProfile(userId);

  return generateResponse(res, 200, true, "Avatar deleted successfully", user);
});


// ─── Multiple Avatar ──────────────────

export const createMultipleAvatarController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return generateResponse(res, 400, false, "At least one avatar image is required", null);
  }

  const user = await createMultipleAvatar(userId, req.files as Express.Multer.Files);

  return generateResponse(res, 200, true, "Multiple avatars uploaded successfully", user);
});


export const updateMultipleAvatarController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  if (!req.files || Object.keys(req.files).length === 0) {
    return generateResponse(res, 400, false, "At least one avatar image is required", null);
  }

  const user = await updateMultipleAvatar(userId, req.files as Express.Multer.Files);

  return generateResponse(res, 200, true, "Multiple avatars updated successfully", user);
});


export const deleteMultipleAvatarController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const user = await deleteMultipleAvatar(userId);

  return generateResponse(res, 200, true, "Multiple avatars deleted successfully", user);
});


// ─── PDF ──────────────────────

export const createUserPDFController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  if (!req.files || !(req.files as Express.Multer.Files)["userPDF"]) {
    return generateResponse(res, 400, false, "PDF file is required", null);
  }

  const user = await createUserPDF(userId, req.files as Express.Multer.Files);

  return generateResponse(res, 200, true, "PDF uploaded successfully", user);
});


export const updateUserPDFController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  if (!req.files || !(req.files as Express.Multer.Files)["userPDF"]) {
    return generateResponse(res, 400, false, "PDF file is required", null);
  }

  const user = await updateUserPDF(userId, req.files as Express.Multer.Files);

  return generateResponse(res, 200, true, "PDF updated successfully", user);
});


export const deleteUserPDFController = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const user = await deleteUserPDF(userId);

  return generateResponse(res, 200, true, "PDF deleted successfully", user);
});

// ─── ADMIN ──────────────────────

export const adminGetUserByIdController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = await adminGetUserById(id);
  return generateResponse(res, 200, true, "User fetched successfully", user);
});


export const adminUpdateUserController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const updatedUser = await adminUpdateUser({ id, ...req.body });
  return generateResponse(res, 200, true, "User updated successfully", updatedUser);
});


export const adminDeleteUserController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await adminDeleteUser(id);
  return generateResponse(res, 200, true, "User deleted successfully", null);
});