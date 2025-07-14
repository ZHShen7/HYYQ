import Mongoose from "mongoose";

import User from "./user.js";

const { model, Schema } = Mongoose;

const UserModel = model("user", new Schema(User, { versionKey: false, timestamps: true }));

export {
	User,
	UserModel,
};