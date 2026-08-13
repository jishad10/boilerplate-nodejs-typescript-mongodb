import { IUser } from "../entities/auth/auth.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }

    namespace Multer {
      type Files = {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}

export {};