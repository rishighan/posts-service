// const Service = require("moleculer").Service;
// const fetch = require("isomorphic-fetch");

module.exports = {
	name: "posts",
	version: 1,
	mixins: [],
	actions: {
		getPosts() {
			return {foo: "boo"};
		}
	}
};