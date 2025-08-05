import Mongoose from "mongoose";

import User from "./user.js";
import Match from "./match.js";
import SmsCode from "./sms-code.js";
import Admin from "./admin.js";
import Club from "./club.js";

const { model, Schema } = Mongoose;

const UserModel = model("user", new Schema(User, { versionKey: false, timestamps: true }));
const MatchModel = model("match", new Schema(Match, { versionKey: false, timestamps: true }));
const SmsCodeModel = model("sms_code", new Schema(SmsCode, { versionKey: false, timestamps: true }));
const AdminModel = model("admin", new Schema(Admin, { versionKey: false, timestamps: true }));
const ClubModel = model("club", new Schema(Club, { versionKey: false, timestamps: true }));

export {
	User,
	UserModel,
	Match,
	MatchModel,
	SmsCode,
	SmsCodeModel,
	Admin,
	AdminModel,
	Club,
	ClubModel,
};