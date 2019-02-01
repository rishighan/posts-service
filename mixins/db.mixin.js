const path = require("path");
const mkdir = require("mkdirp").sync;
const DbService = require("moleculer-db");
const MongoAdapter = require("moleculer-db-adapter-mongoose");
const Post = require("../models/post.model");
module.exports = function(collection) {
	if(process.env.MONGO_URI) {
		return {
			mixins: [DbService],
			adapter: new MongoAdapter(process.env.MONGO_URI),
			model: Post, 
			collection    
		};
	} 
	mkdir(path.resolve("./data"));
};