import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Pubic
 */

const registerUser = asyncHandler(async(req, res) => {
    const {name, email, password} = req.body;

    //check if user already exists
    const userExists = await User.findOne({email});
    if(userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    //Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    res.status(201).json({
        message: "User registered successfully",
        userId: user._id
    })
})


/**
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Public 
 */

const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body;

    // check if user already exists 
    const user = await User.findOne({email});
    if(!user) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    
    //Temp we will replace it with OAuth tokens
    // const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "30d"});
    
    //store user in session
    req.session.user = {
        id: user._id,
        email: user.email
    };
    
    //save session before redirect
    return req.session.save(() => {
        if(req.session.oauthRequest) {
            return res.redirect("http://localhost:5000/api/oauth/authorize");
        }
        res.status(200).json({
            message: "User logged in successfully",
        })
    })
})


export { registerUser, loginUser };