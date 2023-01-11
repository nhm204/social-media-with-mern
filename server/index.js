import express from 'express';
import cors from 'cors';
import mongoose from "mongoose";
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import multer from 'multer';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import postRoutes from './routes/post.js';
import { register } from './controllers/auth.js';
import { verifyToken } from './middleware/auth.js';
import { createPost } from './controllers/post.js';
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";


// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
// app.use(bodyParser.json({ limit: "30mb", extended: true }));
// app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));


// File storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });


// Routes with Files
app.post("/api/v1/auth/register", upload.single("picture"), register);
app.post("/api/v1/post", verifyToken, upload.single("picture"), createPost);


// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);


// Mongoose Setup
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(5000, () => console.log("Server listening on port 5000!"));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch(e => console.log(e))