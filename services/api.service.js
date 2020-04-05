"use strict";

const ApiGateway = require("moleculer-web");

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3060,
		cors: {
			origin: "*",
			methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
			allowedHeaders: [],
			exposedHeaders: [],
			credentials: false,
			maxAge: 3600
		},
		routes: [{
			path: "/api",
			whitelist: [
				// Access to any actions in all services under "/api" URL
				"**"
			]
		}],
		aliases: {
			"POST /posts/create": "posts.create",
			"GET /posts/retrieve": "posts.retrieve",
			"GET /posts/retrieveOne": "posts.retrieveOne",
			"GET /posts/getDrafts": "posts.getDrafts",
			"POST /posts/update": "posts.update",
			"GET /posts/:tagName": "posts.findByTagName",
			"GET /posts/:tagNames": "posts.fiterPostsByTags",
			"POST /posts/:searchTerm": "posts.searchPosts",
			"GET /posts/getStatistics": "posts.getStatistics",
			"GET /posts/getDiffHistories": "posts.getDiffHistories",
			"GET /posts/getArchivedPosts": "posts.getArchivedPosts",
			"POST /posts/delete": "posts.delete"
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
