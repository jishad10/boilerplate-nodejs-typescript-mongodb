import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";
import multer, { StorageEngine, Field } from "multer";
import { Request, RequestHandler } from "express";


// Create Upload Directories

const uploadDir: string = resolve(process.cwd(), "uploads");
const imageDir: string = resolve(uploadDir, "images");
const fileDir: string = resolve(uploadDir, "files");

if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
if (!existsSync(imageDir)) mkdirSync(imageDir, { recursive: true });
if (!existsSync(fileDir)) mkdirSync(fileDir, { recursive: true });


// Multer Storage Engine

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, imageDir);
    } else {
      cb(null, fileDir);
    }
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ): void => {
    const randomName: string = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeOriginalName: string = file.originalname.replace(/\s+/g, "-");
    cb(null, `${file.fieldname}-${randomName}-${safeOriginalName}`);
  },
});


//  Base Multer Instance

const upload: multer.Multer = multer({ storage });

// Custom Fields Upload Function

const multerUpload = (fields: Field[]): RequestHandler => {
  return upload.fields(fields);
};


export { upload, multerUpload };