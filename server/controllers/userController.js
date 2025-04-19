import Directory from "../models/directoryModel.js";
import Session from "../models/sessionMode.js";
import User from "../models/userModel.js";
import mongoose, { Types } from "mongoose";

export const register = async (req, res, next) => {
  const { name, email,password } = req.body;

  const session = await mongoose.startSession();


  try {
    const rootDirId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    session.startTransaction();

    await Directory.create(
      [
        {
          _id: rootDirId,
          name: `root-${email}`,
          parentDirId: null,
          userId,
        },
      ],
      { session }
    );

    await User.create(
      [
        {
          _id: userId,
          name,
          email,
          password,
          rootDirId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Registration Error:", err);

    if (err.code === 11000 && err.keyValue.email) {
      return res.status(409).json({
        error: "This email already exists",
        message:
          "A user with this email address already exists. Please try logging in or use a different email.",
      });
    }

    next(err);
  }
};
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }

  const passwordMatch = user.isPasswordCorrect(password);
  if (!passwordMatch) {
    return res.status(404).json({ error: "Invalid Credentials" });
  }


  const session=await Session.create({userId:user._id})



  res.cookie("sid", session.id, {
    httpOnly: true,
    signed: true,
    maxAge: 60 * 1000 * 60 * 24 * 7
  });
  res.json({ message: "Logged In" });
};

export const getCurrentUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

export const logout = (req, res) => {
  res.clearCookie("uid");
  res.status(204).end();
};
