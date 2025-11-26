import BlogModel from "../models/Blog.js";
import fs from "fs";
import path from "path";

// ---------------- CREATE BLOG ----------------
const Create = async (req, res) => {
  try {
    const { title, desc } = req.body;

    if (!title || !desc) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    // Store only filename
    const imageName = req.file.filename;

    const newBlog = new BlogModel({
      title,
      desc,
      image: imageName,
    });

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: "Blog Created Successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------- UPDATE BLOG ----------------
const update = async (req, res) => {
  try {
    const { title, desc } = req.body;
    const blogId = req.params.id;

    const blog = await BlogModel.findById(blogId);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    if (title) blog.title = title;
    if (desc) blog.desc = desc;

    if (req.file && req.file.filename) {
      // delete old image
      if (blog.image && blog.image !== "default.png") {
        const oldPath = path.join("public/images", blog.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      blog.image = req.file.filename;
    }

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------- GET ALL POSTS ----------------
const GetPosts = async (req, res) => {
  try {
    const posts = await BlogModel.find();
    res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------- DELETE BLOG ----------------
const DeleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await BlogModel.findById(blogId);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // delete image
    if (blog.image && blog.image !== "default.png") {
      const imgPath = path.join("public/images", blog.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await BlogModel.findByIdAndDelete(blogId);

    res.status(200).json({
      success: true,
      message: "Post Delete Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { Create, update, GetPosts, DeleteBlog };
