const DBService = require("../mixins/db.mixin");
const Post = require("../models/post.model");

module.exports = {
	name: "posts",
	version: 1,
	mixins: [ DBService("posts") ],
	actions: {
		retrieve:
			{
				cache: {
					keys: ["title", "excerpt", "slug", "content"]
				},
				params: {
					_id: { type: "string", optional: true },
					slug: { type: "string", optional: true},
					title: { type: "string", optional: true }
				},
				model: Post,
				handler(broker) {
					return new Promise((resolve, reject) => {
						// "find" is a method on the service, not the mongoose adapter, so... thanks moleculer?
						resolve(broker.call("v1.posts.find", { query: broker.params }));
					}); 
				}
			},
		create: {},
		findByTagName: {
			cache: {
				keys: ["title", "slug", "content"]
			},
			params: {
				tagName: { type: "string" },
				pageOffset: { type: "string" },
				pageLimit: { type: "string" }
			},
			model: Post,
			handler(broker) {
				let options = {
					sort: { date_updated: -1 },
					page: parseInt(broker.params.pageOffset, 10) || 1,
					limit: parseInt(broker.params.pageLimit, 10) || 5
				};
				let query = { tags: { $elemMatch: { id: broker.params.tagName } }, is_draft: false, is_archived: false };
				return new Promise((resolve, reject) => {
					return Post.paginate(query, options, (error, resultSet) => {
						if(resultSet){
							resolve(resultSet.docs);
						} else if(error) {
							reject(new Error(error));
						}
					});
				});
			}	
		},
		filterPostsByTags: {
			cache: {
				keys: [ "title", "slug", "content" ]
			},
			params: {
				tagNames: { type: "array" }
			},
			model: Post,
			handler(broker) {
				let queryString = { "tags.id": { $nin: broker.params.tagNames } };
				return broker.call("v1.posts.find", { query: queryString })
					.then((data) => data);
			}
		},
		searchPosts: {
			cache: {
				keys: [ "title", "excerpt" ]
			},
			params: {
				searchTerm: { type: "string" },
				pageOffset: { type: "string" },
				pageLimit: { type: "string" }
			},
			model: Post,
			handler(broker) {
				let options = {
					page: parseInt(broker.params.pageOffset, 10),
					limit: parseInt(broker.params.pageLimit, 10)
				};
				let query = { $text: { $search: broker.params.searchTerm }};
				return new Promise((resolve, reject) => {
					return Post.paginate(query, options, (error, resultSet) => {
						if(resultSet) {
							resolve(resultSet.docs);
						} else if(error) {
							reject(new Error(error));
						}
					});
				});
			}
		},
		getArchivedPosts: {
			cache: {
				keys: ["title"]
			},
			handler(broker) {
				return Promise((resolve, reject) => {

				});
			}
		},
		getStatistics: {
			cache: {
				keys: [ "title", "excerpt"]
			},
			handler(broker) {
				let drafts = broker.call("v1.posts.count", { query: { is_draft: true } });
				let totalPosts = broker.call("v1.posts.count", { query: {} });
				let blogPosts = broker.call("v1.posts.count", { query: { tags: { $elemMatch: { id: "Blog" } } } });
				return Promise.all([drafts, totalPosts, blogPosts])
					.then((data) => {
						return {
							drafts: data[0],
							blogPosts: data[2],
							total: data[1]
						};	
					})
					.catch((error) => error )
					.finally((response) => response);								
			}
		}
	},

	settings: {
		fields: ["_id", "slug", "tags", "date_created", "date_updated", "attachment", "is_sticky", "is_archived", "is_draft", "content", "excerpt"],
		entityValidator: {
			title: {type: "string", min: 1},
			slug: {type: "string", optional: true},
			content: {type: "string", optional: true},
			attachment: {type: "string", items: "object", optional: true},
			tags: {type: "array", items: "string", optional: true},
			excerpt: {type: "string", optional: true}
		}
	}
};