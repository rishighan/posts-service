const DBService = require("../mixins/db.mixin");

module.exports = {
	name: "posts",
	version: 1,
	mixins: [ DBService("posts") ],
	actions: {
		getPosts() {
			return {foo: "boo"};
		}
	}
};