import { env } from "process";

export default {
	mongodb: {
		host: env.NODE_ENV === "dev" ? "116.62.127.61" : "127.0.0.1",
		password: "123456",
		port: 27017,
		username: "root"
	},
	publicPath: env.NODE_ENV === "dev" ? "" : "/awl"
};