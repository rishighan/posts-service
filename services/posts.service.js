const DBService = require("../mixins/db.mixin");

module.exports = {
	name: "posts",
	version: 1,
	mixins: [ DBService("posts") ],
	actions: {
		retrieve:
			{
				cache: 
				{
					keys: ["title", "excerpt", "slug", "content"]
				},
				params: {
					post: { type: "string" }
				},
				handler(ctx) {
					let params = {
						query: { title: "Hackintosh"}
					};		
					return this.Promise.resolve()
						.then(() => {
							return ctx.call("posts.find", { query: { title: ctx.params.title } });
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