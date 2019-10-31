const DBService = require("../mixins/db.mixin");
const Post = require("../models/post.model");
const _ = require("lodash");

module.exports = {
	name: "posts",
	version: 1,
	mixins: [DBService("posts")],
	actions: {
		create: {
			cache: {
				keys: []
			},
			params: {
				title: { type: "string" },
				slug: { type: "string" },
				tags: { type: "array", optional: true },
				attachment: { type: "array", optional: true },
				is_draft: { type: "boolean" },
				is_sticky: { type: "boolean" }, // <- TODO
				is_archived: { type: "boolean" },
				content: { type: "string", optional: true },
				excerpt: { type: "string" },
			},
			handler(broker) {
				let postData = Object.assign({
					date_created: new Date(),
					date_updated: new Date()
				}, broker.params);
				return new Promise((resolve, reject) => {
					Post.create(postData, (error, data) => {
						if (data) {
							resolve(data);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			}

		},
		retrieve: {
			cache: {
				keys: ["title", "excerpt", "slug", "content"]
			},
			params: {
				_id: { type: "string", optional: true },
				slug: { type: "string", optional: true },
				title: { type: "string", optional: true },
				pageOffset: { type: "string", optional: true },
				pageLimit: { type: "string", optional: true },
			},
			handler(broker) {
				const queryConfig = {
					_id: broker.params._id,
					slug: broker.params.slug,
					title: broker.params.title,
				};
				const queryKey = _.findKey(queryConfig, (val) => val !== undefined);
				const query = {};
				query[queryKey] = queryConfig[queryKey];

				const pagingOptions = {
					limit: parseInt(broker.params.pageLimit, 10),
					page: parseInt(broker.params.pageOffset, 10),
				};
				return new Promise((resolve, reject) => {
					return Post.paginate(query, pagingOptions, (error, resultSet) => {
						if (resultSet) {
							resolve(resultSet);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			}
		},
		retrieveOne: {
			cache: {
				keys: [],
			},
			params: {
				_id: { type: "string", optional: true },
				slug: { type: "string", optional: true },
				title: { type: "string", optional: true },
			},
			handler(broker) {
				return new Promise((resolve, reject) => {
					return Post.findOne(broker.params, (error, result) => {
						if (result) {
							resolve(result);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			}
		},
		findByTagName: {
			cache: {
				keys: ["title", "slug", "content"]
			},
			params: {
				tagName: { type: "string" },
				pageOffset: { type: "string", optional: true },
				pageLimit: { type: "string", optional: true }
			},
			handler(broker) {
				let pagingOptions = {
					sort: { date_updated: -1 },
					page: parseInt(broker.params.pageOffset, 10) || 0,
					limit: parseInt(broker.params.pageLimit, 10) || Infinity,
				};
				let query = { tags: { $elemMatch: { id: broker.params.tagName } }, is_draft: false, is_archived: false };
				return new Promise((resolve, reject) => {
					return Post.paginate(query, pagingOptions, (error, resultSet) => {
						if (resultSet) {
							resolve(resultSet.docs);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			}
		},
		filterPostsByTags: {
			cache: {
				keys: ["title", "slug", "content"]
			},
			params: {
				tagNames: { type: "array" }
			},
			handler(broker) {
				let queryString = { "tags.id": { $nin: broker.params.tagNames } };
				return broker.call("v1.posts.find", { query: queryString })
					.then((data) => data);
			}
		},
		searchPosts: {
			cache: {
				keys: ["title", "excerpt"]
			},
			params: {
				searchTerm: { type: "string" },
				pageOffset: { type: "string" },
				pageLimit: { type: "string" }
			},
			handler(broker) {
				let options = {
					page: parseInt(broker.params.pageOffset, 10),
					limit: parseInt(broker.params.pageLimit, 10)
				};
				let query = { $text: { $search: broker.params.searchTerm } };
				return new Promise((resolve, reject) => {
					return Post.paginate(query, options, (error, resultSet) => {
						if (resultSet) {
							resolve(resultSet);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			}
		},
		getArchivedPosts: {
			cache: {
				keys: ["title", "slug"]
			},
			handler() {
				return new Promise((resolve, reject) => {
					return Post.aggregate([
						{
							$match: {
								is_archived: true
							}
						},
						{
							$group: {
								_id: {
									year: { $year: "$date_created" },
									month: { $month: "$date_created" }
								},
								archivedPosts: {
									$push: {
										title: "$title",
										slug: "$slug"
									}
								}
							}
						}],
					(err, data) => {
						if (err) {
							reject(err);
						}
						resolve(data);
					}
					);
				});
			}
		},
		getDrafts: {
			cache: {
				keys: ["title", "excerpt"],
			},
			handler(context) {
				const options = {
					page: parseInt(context.params.pageOffset, 10),
					limit: parseInt(context.params.pageLimit, 10)
				};
				const query = { is_draft: true };
				return new Promise((resolve, reject) => {
					return Post.paginate(query, options, (error, resultSet) => {
						if (error) {
							reject(new Error(error));
						}
						resolve(resultSet);
					});
				});
			}
		},
		getStatistics: {
			cache: {
				keys: ["title", "excerpt"]
			},
			handler(broker) {
				let drafts = broker.call("v1.posts.count", { query: { is_draft: true } });
				let totalPosts = broker.call("v1.posts.count", { query: {} });
				let blogPosts = broker.call("v1.posts.count", { query: { tags: { $elemMatch: { id: "Blog" } } } });
				return Promise.all([drafts, totalPosts, blogPosts])
					.then((data) => {
						return [
							{
								key: "Drafts",
								count: data[0],
							},
							{
								key: "Blog Posts",
								count: data[2],
							},
							{
								key: "Total",
								count: data[1],
							}
						];
					})
					.catch((error) => error)
					.finally((response) => response);
			}
		},
		update: {
			cache: {
				keys: ["title", "content", "excerpt", "tags", "attachment"]
			},
			params: {
				title: { type: "string" },
				slug: { type: "string" },
				tags: { type: "array", optional: true },
				date_created: { type: "string" },
				attachment: { type: "array", optional: true },
				is_draft: { type: "boolean" },
				is_sticky: { type: "boolean" }, // <- TODO
				is_archived: { type: "boolean" },
				content: { type: "string", optional: true },
				excerpt: { type: "string" },
				upsertValue: { type: "boolean" }
			},
			handler(broker) {
				return new Promise((resolve, reject) => {
					return Post.updateOne({
						_id: broker.params.postId
					},
					{
						$set:
							{
								title: broker.params.title,
								slug: broker.params.slug,
								tags: broker.params.tags,
								date_created: broker.params.date_created,
								date_updated: new Date(),
								attachment: broker.params.attachment,
								is_draft: broker.params.is_draft,
								is_archived: broker.params.is_archived,
								content: broker.params.content,
								excerpt: broker.params.excerpt
							}
					},
					{
						upsert: broker.params.upsertValue
					},
					(error, data) => {
						if (data) {
							resolve(data);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			}
		},
		delete: {
			cache: {},
			params: {
				postId: { type: "string" }
			},
			handler(broker) {
				return new Promise((resolve, reject) => {
					return Post.findByIdAndDelete(broker.params.postId, (error, data) => {
						if (data) {
							resolve(data);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			}
		}
	},
	settings: {
		model: Post,
		fields: ["_id", "slug", "tags", "date_created", "date_updated", "attachment", "is_sticky", "is_archived", "is_draft", "content", "excerpt"],
		entityValidator: {
			title: { type: "string", min: 1 },
			slug: { type: "string", optional: true },
			content: { type: "string", optional: true },
			attachment: { type: "string", items: "object", optional: true },
			tags: { type: "array", items: "string", optional: true },
			excerpt: { type: "string", optional: true }
		}
	}
};