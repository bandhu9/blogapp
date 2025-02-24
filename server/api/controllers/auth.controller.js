import User from "../models/user.model.js";
import bcryptjs from "bcryptjs"; // hash the password
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  //   console.log(req.body);
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    // return res.status(400).json({ message: "All fields are required" }); // it will show error in postman when send data from postman
    next(errorHandler(400, "All fields are required"));
  }

  const hashedPassword = await bcryptjs.hashSync(password, 10);

  const newUser = new User({ username, email, password: hashedPassword });
  //   console.log("newUser", newUser);

  try {
    await newUser.save(); // save data to mongoDB
    res.json({ message: "signup successful" });
  } catch (error) {
    // res.status(500).json({ message: error.message });
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    next(errorHandler(400, "All fileds are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      next(errorHandler(400, "User not found"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid password"));
    }
    const token = jwt.sign(
      {
        id: validUser._id,
        // isAdmin: validUser.isAdmin
      },
      process.env.JWT_SECRET
    );
    console.log("token", token);
    const { password: pass, ...rest } = validUser._doc; //validUser._doc same as validUser
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};
