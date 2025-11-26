import express from "express";
import dotenv from "dotenv";
import AuthRoutes from "./routes/Auth.js";
import connectDB from "./libs/db.js";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

import BlogRoutes from "./routes/Blogs.js";
import DashboardRoutes from "./routes/Dashboard.js";
import CommentRoutes from "./routes/Comments.js";
import PublicRoutes from "./routes/Public.js";

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();
connectDB();

// Required for __dirname in ES Modules
const __dirname = path.resolve();

// Serve images only once (FIXED DUPLICATE)
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Body parser
app.use(express.json());

// Cookie parser MUST be before routes
app.use(cookieParser());

// CORS FIX (must be before routes)
const corsOptoins = {
  origin: "https://bloggingplatformapplication.netlify.app/",
      methods: ["GET", "POST", "PUT","PATCH", "DELETE"],


  credentials: true,
};
app.use(cors(corsOptoins));

// Test route
app.get("/", (req, res) => {
  res.send("hello from server");
});

// API Routes
app.use("/auth", AuthRoutes);
app.use("/blog", BlogRoutes);
app.use("/dashboard", DashboardRoutes);
app.use("/comment", CommentRoutes);
app.use("/public", PublicRoutes);

app.listen(PORT, () => {
  console.log(`App is running on Port ${PORT}`);
});
