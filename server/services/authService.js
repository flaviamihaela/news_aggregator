import bcrypt from 'bcryptjs';

export const salt = bcrypt.genSaltSync(10);
export const secret = 'asdfe45we45w345wegw345werjktjwertkj'; // Secret for JWT
