const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory");
const paginate = require("mongoose-paginate");

// Post model
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
	is_sticky: Boolean,
	is_archived: Boolean,
	is_draft: Boolean,
	content: String,
	excerpt: String,
});

// pagination
PostSchema.plugin(paginate);
// Diff history
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