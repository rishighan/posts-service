const path = require("path");
const mkdir = require("mkdirp").sync;
const DbService = require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongoose");

module.exports = (collection, model)  => {
	if(process.env.MONGO_URI) {
		return {
			mixins: [DbService],
			adapter: new MongoAdapter(process.env.MONGO_URI, {
				user: process.env.MONGODB_USERNAME,
				pass: process.env.MONGODB_PASSWORD,
				keepAlive: true,
			}),
			model: model,
			collection    
		};
	} 
	mkdir(path.resolve("./data"));
};