const DBService = require("../mixins/db.mixin");
const Post = require("../models/post.model");
const Series = require("../models/series.model");
const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory");
const _ = require("lodash");

module.exports = {
	name: "posts",
	version: 1,
	mixins: [DBService("posts", Post)],
	actions: {
		findSeries: {
			handler(broker) {
				return new Promise((resolve, reject) => {
					Series.findOne(
						{
							series_name: broker.params.series_name,
						},
						(error, data) => {
							if (data) {
								resolve(data);
							} else {
								reject(new Error(error));
							}
						}
					);
				});
			},
		},
		findSeriesByPostId: {
			params: {
				postId: { type: "string" }
			},
			handler(broker) {
				return new Promise((resolve, reject) => {
					Series.find({ 
						"post": { $elemMatch: { $eq: broker.params.postId }}
					}, (error, data) => {
						if(data) {
							resolve(data);
						} else {
							reject(new Error(error));
						}
					});
				});	
			}
		},
		retrieveSeries: {
			handler(broker) {
				const paginationOptions = {
					pageOffset: broker.params.pageOffset,
					pageLimit: broker.params.pageLimit,
				};
				return new Promise((resolve, reject) => {
					return Series.paginate({}, paginationOptions, (error, resultSet) => {
						if (resultSet) {
							resolve(resultSet);
						} else {
							reject(new Error(error));
						}
					});
				});
			},
		},
		createSeries: {
			params: {
				series_name: { type: "string" },
				post: { type: "array" },
			},
			handler(broker) {
				return new Promise((resolve, reject) => {
					_.each(broker.params.post, (id) => {
						new mongoose.Types.ObjectId(id);
					});
					Series.create(broker.params, (error, data) => {
						if (data) {
							resolve(data);
						} else {
							reject(new Error(error));
						}
					});
				});
			},
		},
		updateSeries: {
			params: { _id: { type: "string" } },
			handler(broker) {
				const query = { _id: broker.params._id };
				return new Promise((resolve, reject) => {
					Series.findOneAndUpdate(
						query,
						broker.params,
						{ new: true },
						(error, data) => {
							if (data) {
								resolve(data);
							} else {
								reject(new Error(error));
							}
						}
					);
				});
			},
		},
		deleteSeries: {
			params: { series: { type: "string" } },
			handler(broker) {
				return new Promise((resolve, reject) => {
					return Series.findByIdAndDelete(
						broker.params.seriesId,
						(error, data) => {
							if (data) {
								resolve(data);
							} else {
								reject(new Error(error));
							}
						}
					);
				});
			},
		},
		create: {
			cache: {
				keys: [],
			},
			params: {
				title: { type: "string" },
				slug: { type: "string" },
				tags: { type: "array", optional: true },
				attachment: { type: "array", optional: true },
				is_draft: { type: "boolean" },
				is_sticky: { type: "boolean" },
				is_archived: { type: "boolean" },
				content: { type: "string", optional: true },
				excerpt: { type: "string" },
			},
			handler(broker) {
				let postData = Object.assign(
					{
						date_created: new Date(),
						date_updated: new Date(),
					},
					broker.params
				);
				return new Promise((resolve, reject) => {
					Post.create(postData, (error, data) => {
						if (data) {
							resolve(data);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			},
		},
		retrieve: {
			cache: {
				keys: ["title", "excerpt", "slug", "content"],
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
			},
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
			},
		},
		findByTagName: {
			cache: {
				keys: ["title", "slug", "content"],
			},
			params: {
				tagName: { type: "string" },
				pageOffset: { type: "string", optional: true },
				pageLimit: { type: "string", optional: true },
			},
			handler(broker) {
				let pagingOptions = {
					sort: { date_updated: -1 },
					page: parseInt(broker.params.pageOffset, 10) || 0,
					limit: parseInt(broker.params.pageLimit, 10) || Infinity,
				};
				let query = {
					tags: { $elemMatch: { value: broker.params.tagName } },
					is_draft: false,
					is_archived: false,
				};
				return new Promise((resolve, reject) => {
					return Post.paginate(query, pagingOptions, (error, resultSet) => {
						if (resultSet) {
							resolve(resultSet.docs);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			},
		},
		filterPostsByTags: {
			cache: {
				keys: ["title", "slug", "content"],
			},
			params: {
				tagNames: { type: "array" },
				operator: { type: "string" },
			},
			handler(broker) {
				let subQuery = broker.params.queryDetails.operator === "include" ? { $in: broker.params.queryDetails.tagNames } : { $nin: broker.params.queryDetails.tagNames };
				let queryString = {
					"tags.value": subQuery,
					is_draft: false,
					is_archived: false,
				};
				let options = {
					page: parseInt(broker.params.pageOffset, 10),
					limit: parseInt(broker.params.pageLimit, 10),
				};
				return new Promise((resolve, reject) => {
					return Post.paginate(queryString, options, (error, resultSet) => {
						if (resultSet) {
							resolve(resultSet.docs);
						} else if (error) {
							reject(new Error(error));
						}
					});
				});
			},
		},
		searchPosts: {
			cache: {
				keys: ["title", "excerpt"],
			},
			params: {
				searchTerm: { type: "string" },
				pageOffset: { type: "string" },
				pageLimit: { type: "string" },
			},
			handler(broker) {
				let options = {
					page: parseInt(broker.params.pageOffset, 10),
					limit: parseInt(broker.params.pageLimit, 10),
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
			},
		},
		getArchivedPosts: {
			cache: {
				keys: ["title", "slug"],
			},
			handler() {
				return new Promise((resolve, reject) => {
					return Post.aggregate(
						[
							{
								$match: {
									is_archived: true,
								},
							},
							{
								$group: {
									_id: {
										year: { $year: "$date_created" },
										month: { $month: "$date_created" },
									},
									archivedPosts: {
										$push: {
											title: "$title",
											slug: "$slug",
											date_updated: "$date_updated",
										},
									},
								},
							},
						],
						(err, data) => {
							if (err) {
								reject(err);
							}
							resolve(data);
						}
					);
				});
			},
		},
		getDrafts: {
			cache: {
				keys: ["title", "excerpt"],
			},
			handler(context) {
				const options = {
					page: parseInt(context.params.pageOffset, 10),
					limit: parseInt(context.params.pageLimit, 10),
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
			},
		},
		getStatistics: {
			cache: {
				keys: ["title", "excerpt"],
			},
			handler(broker) {
				let drafts = broker.call("v1.posts.count", {
					query: { is_draft: true },
				});
				let totalPosts = broker.call("v1.posts.count", { query: {} });
				let blogPosts = broker.call("v1.posts.count", {
					query: { tags: { $elemMatch: { value: "blog" } } },
				});
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
							},
						];
					})
					.catch((error) => error)
					.finally((response) => response);
			},
		},
		getDiffHistories: {
			params: {
				postId: { type: "string" },
			},
			async handler(context) {
				try {
					const histories = await diffHistory.getDiffs(
						"Post",
						context.params.postId
					);
					return histories;
				} catch (error) {
					return error;
				}
			},
		},
		update: {
			cache: {
				keys: ["title", "content", "excerpt", "tags", "attachment"],
			},
			params: {
				title: { type: "string" },
				slug: { type: "string" },
				tags: { type: "array", optional: true },
				date_created: { type: "string" },
				attachment: { type: "array", optional: true },
				is_draft: { type: "boolean" },
				is_sticky: { type: "boolean" },
				is_archived: { type: "boolean" },
				content: { type: "string", optional: true },
				excerpt: { type: "string" },
				upsertValue: { type: "boolean" },
			},
			handler(broker) {
				return new Promise((resolve, reject) => {
					return Post.updateOne(
						{
							_id: broker.params.postId,
						},
						{
							$set: {
								title: broker.params.title,
								slug: broker.params.slug,
								tags: broker.params.tags,
								date_created: broker.params.date_created,
								date_updated: new Date(),
								attachment: broker.params.attachment,
								is_draft: broker.params.is_draft,
								is_archived: broker.params.is_archived,
								is_sticky: broker.params.is_sticky,
								content: broker.params.content,
								excerpt: broker.params.excerpt,
							},
						},
						{
							upsert: broker.params.upsertValue,
						},
						(error, data) => {
							if (data) {
								resolve(data);
							} else if (error) {
								reject(new Error(error));
							}
						}
					);
				});
			},
		},
		delete: {
			cache: {},
			params: {
				postId: { type: "string" },
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
			},
		},
	},
	settings: {
		model: Post,
		fields: [
			"_id",
			"slug",
			"tags",
			"date_created",
			"date_updated",
			"attachment",
			"is_sticky",
			"is_archived",
			"is_draft",
			"content",
			"excerpt",
		],
		entityValidator: {
			title: { type: "string", min: 1 },
			slug: { type: "string", optional: true },
			content: { type: "string", optional: true },
			attachment: { type: "string", items: "object", optional: true },
			tags: { type: "array", items: "string", optional: true },
			excerpt: { type: "string", optional: true },
		},
	},
};
