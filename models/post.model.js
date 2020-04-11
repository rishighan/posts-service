let mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory");
let paginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

const PostSchema = mongoose.Schema({
	title: String,
	slug: String,
	tags: [{
		value: String,
		label: String
	}],
	date_created: Date,
	date_updated: Date,
	attachment: [{
		name: String,
		size: Number,
		url: String,
		isHero: Boolean,
		date_created: Date,
		date_updated: Date

	}],
	posts_relationships: {
		related_posts: [{type: Schema.Types.ObjectId, ref: "PostsRelationships"}],
	},
	is_sticky: Boolean,
	is_archived: Boolean,
	is_draft: Boolean,
	content: String,
	excerpt: String,
});

// pagination
PostSchema.plugin(paginate);

// diff history
PostSchema.plugin(diffHistory.plugin);

// indices
PostSchema.index({
	date_created: -1,
	date_updated: -1,
	title: "text",
	content: "text",
	excerpt: "text"
}, {
	collation: {locale: "en", strength: 2}
});
PostSchema.set("autoIndex", false);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;