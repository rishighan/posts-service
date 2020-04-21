const mongoose = require("mongoose");
const paginate = require("mongoose-paginate");
const autopopulate = require("mongoose-autopopulate");

// Series model
const SeriesSchema = mongoose.Schema({
	series_name: String,
	post: [{ 
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post",
		autopopulate: true,
	}],
});

SeriesSchema.plugin(paginate);
SeriesSchema.plugin(autopopulate);

const Series = mongoose.model("Series", SeriesSchema);
module.exports = Series;