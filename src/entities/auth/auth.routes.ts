import express, { Router } from "express";
import { verifyToken } from "../../core/middlewares/authMiddleware";
import { changePassword, forgetPassword, loginUser, logoutUser, refreshAccessToken, registerUser, resetPassword, verifyCode } from "./auth.controller";


const router: Router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/forget-password", forgetPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);
router.post("/change-password", verifyToken, changePassword);
router.post("/logout", verifyToken, logoutUser);


export default router;