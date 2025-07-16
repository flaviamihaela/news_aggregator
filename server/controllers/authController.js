import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.mjs";
import { salt, secret } from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || password.length < 5) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const exists = await UserModel.findOne({ username });
    if (exists) {
      return res.status(409).json({ error: "Username already taken." });
    }

    await UserModel.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });

    return res.status(201).json({ message: "User created" });

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const userDoc = await UserModel.findOne({ username });
    if (!userDoc) {
      return res.status(400).json("wrong credentials");
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          id: userDoc._id,
          username,
        });
      });
  } else {
    return res.status(400).json("Wrong credentials.");
  }
  } catch (err) {
    console.error(err);
    return res.status(500).json( {error: "Internal sever error."});
  }

};

export const profile = (req, res) => {
  try {
      const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    return res.json(info);
  });
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: "Internal server error."});
  }

};

export const logout = (req, res) => {
  res.cookie("token", "").json("ok");
};
