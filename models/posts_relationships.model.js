const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostsRelationshipsSchema = mongoose.Schema({
	posts: [{
		series_name: String,
		posts: [{
			type: Schema.Types.ObjectId, ref: "Post",
		}],
	}]
});

const PostsRelationships = mongoose.model("PostsRelationship", PostsRelationshipsSchema);
module.exports = PostsRelationships;