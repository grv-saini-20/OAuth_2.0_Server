import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";


dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`)
})
