import { env } from "process";

export default {
	mongodb: {
		host: "116.62.127.61",
		password: "123456",
		port: 27017,
		username: "root"
	},
	publicPath: env.NODE_ENV === "dev" ? "" : ""
};