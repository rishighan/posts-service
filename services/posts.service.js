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
					return this.Promise.resolve()
						.then(() => {
							// "find" is a method on the service, not the mongoose adapter, so... thanks moleculer?
							return broker.call("v1.posts.find", { query: broker.params });
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
					return Post.paginate(query, options, (error, data) => {
						if(data){
							resolve(data.docs[0]);
						} else if(error) {
							reject(new Error(error));
						}
					});
				});
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