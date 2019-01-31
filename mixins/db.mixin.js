const path = require("path");
const mkdir = require("mkdirp").sync;
const DbService = require("moleculer-db");

module.exports = function(collection) {
    console.log(process.env.MONGO_URI);
    if(process.env.MONGO_URI) {
		const MongoAdapter = require("moleculer-db-adapter-mongoose");
		return {
			mixins: [DbService],
			adapter: MongoAdapter(process.env.MONGO_URI),
			collection    
		};
	} 
	mkdir(path.resolve("./data"));
};