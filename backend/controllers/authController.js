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
  const { email, password } = req.body; // ← remove oauthParams

  const user = await User.findOne({ email });
  if (!user) { res.status(401); throw new Error("Invalid email or password"); }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) { res.status(401); throw new Error("Invalid email or password"); }

  req.session.user = {
    id: user._id.toString(),
    email: user.email
  };

  return req.session.save(() => {
    if (req.session.oauthRequest && Object.keys(req.session.oauthRequest).length) {
      const params = new URLSearchParams(req.session.oauthRequest).toString();
      return res.json({
        redirectUrl: `http://localhost:5000/api/oauth/authorize?${params}`
      });
    }
    res.status(200).json({ message: "User logged in successfully" });
  });
});


export { registerUser, loginUser };