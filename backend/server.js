import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";
import session from "express-session";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //don't save session if unmodified,
    saveUninitialized: false, //don't create session until something stored
    cookie: {
        httpOnly: true,
        secure: false, //true in production https
        maxAge: 1000 * 60 * 60, //1 hour
    }
}))

app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`)
})
