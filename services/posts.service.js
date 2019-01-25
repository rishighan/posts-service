
const Service = require("moleculer").Service;
import {fetch} from "isomorphic-fetch";

class PostsService extends Service {
	constructor(broker) {
		super(broker);

		this.parseServiceSchema({
			name: "posts",
			version: "v1",
			meta: {
				scalable: true
			},
			dependencies: ["auth"],
			actions: {
				createPost: this.createPost,
				getPosts: this.getPosts,
				getPostById: this.getPostById,
				getPostByTagName: this.getPostByTagName,
				filterOnTags: this.filterOnTags,
				searchPost: this.searchPost,
				updatePost: this.updatePost,
				deletePost: this.deletePost,
				deleteFile: this.deleteFile,
				getArchivedPosts: this.getArchivedPosts,
				getPostsStats: this.getPostsStats
			},
			events: {},
			created: this.serviceCreated,
			started: this.serviceStarted,
			stopped: this.serviceStopped
		});
	}

	createPost(post) {
		return fetch("/db/createpost", {
			method: "POST",
			body: post
		})
			.then(response => response.json());


	}

	serviceCreated() {
		this.logger.info("Posts service created.");
	}

	serviceStarted() {
		this.logger.info("Posts service started.");
	}

	serviceStopped() {
		this.logger.info("Posts service stopped.");
	}
}

module.exports = PostsService;

