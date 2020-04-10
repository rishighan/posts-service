const mongoose = require("mongoose");

const boxedSetSchema = mongoose.Schema({
	relationships: [{
		series_name: String,
		posts: Array,
	}]
});

const BoxedSet = mongoose.model("boxedSet", boxedSetSchema);
module.exports = BoxedSet;