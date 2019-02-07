"use strict";

const ApiGateway = require("moleculer-web");	

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,
		routes: [{
			path: "/api",
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			]
		}],
		aliases: {
			"GET /posts/:id": "posts.retrieve",
			"GET /posts/:tagName": "posts.findByTagName",
			"GET /posts/:tagNames": "posts.fiterPostsByTags",
			"POST /posts/:searchTerm": "posts.searchPosts",
			"GET /posts/getStatistics": "posts.getStatistics",
			"GET /posts/getArchivedPosts": "posts.getArchivedPosts"
		},
		// Parse body content
		bodyParsers: {
			json: {
				strict: false
			},
			urlencoded: {
				extended: false
			}
		}
	}
};
