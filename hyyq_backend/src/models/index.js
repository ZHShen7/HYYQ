import Mongoose from "mongoose";

import User from "./user.js";
import Match from "./match.js";

const { model, Schema } = Mongoose;

const UserModel = model("user", new Schema(User, { versionKey: false, timestamps: true }));
const MatchModel = model("match", new Schema(Match, { versionKey: false, timestamps: true }));

export {
	User,
	UserModel,
	Match,
	MatchModel,
};