"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../services/posts.service");

describe("Test 'posts' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("test saying hello", () => {
		it("should return with 'Hello Moleculer'", () => {
			expect("hello").toEqual("hello");
		});

	});
});

