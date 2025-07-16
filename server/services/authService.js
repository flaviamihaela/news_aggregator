import bcrypt from "bcryptjs";

export const salt = bcrypt.genSaltSync(10);

export const secret = process.env.JWT_SECRET;

