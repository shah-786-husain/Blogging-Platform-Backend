import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/User.js";

// -------------- REGISTER --------------
const Register = async (req, res) => {
  try {
    const { FullName, email, password } = req.body;

    if (!FullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existUser = await UserModel.findOne({ email });
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    let profileImage = "default.png";
    if (req.file && req.file.filename) {
      profileImage = req.file.filename;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      FullName,
      email,
      password: hashedPassword,
      profile: profileImage,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------- LOGIN --------------
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });

    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({
        success: false,
        message: "Invalid password.",
      });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    // Cookie FIX
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true only in production HTTPS
      sameSite: "None", // prevents cross-site rejection
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------- LOGOUT --------------
const Logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// -------------- UPDATE PROFILE --------------
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { FullName, oldpassword, newpassword } = req.body;

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (oldpassword) {
      const isMatch = await bcrypt.compare(oldpassword, user.password);
      if (!isMatch)
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
    }

    if (FullName) user.FullName = FullName;

    if (oldpassword && newpassword) {
      user.password = await bcrypt.hash(newpassword, 10);
    }

    // --- FIXED IMAGE UPDATE ---
    if (req.file && req.file.filename) {
      const newImage = req.file.filename;

      if (user.profile !== "default.png") {
        const oldPath = `public/images/${user.profile}`;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      user.profile = newImage;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { Register, Login, Logout, updateProfile };
