import { Database } from "bun:sqlite";
import { describe, test, expect, beforeEach } from "bun:test";
import { createTables, getChildrenAttributes, insertData } from "./lib";

const exampleData = [
	{
		name: "Parent1",
		children: [
			{ name: "Child1", attributes: { height: 120, weight: 40 } },
			{ name: "Child2", attributes: { height: 130, weight: 45 } },
		],
	},
];

// Tests
describe("SQLite Functionality", () => {
	let db: Database;

	beforeEach(() => {
		// Create an in-memory database for testing
		db = new Database(":memory:");
		createTables(db);
	});

	test("should create tables", () => {
		const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all();
		expect(tables).toEqual(
			expect.arrayContaining([
				{ name: "parent" },
				{ name: "parent_children" },
				{ name: "parent_children_attributes" },
			])
		);
	});

	test("should insert data and query children attributes", () => {
		insertData(db, exampleData);
		const result = getChildrenAttributes(db, 1);

		expect(result).toEqual([
			{ child_id: 1, child_name: "Child1", height: 120, weight: 40 },
			{ child_id: 2, child_name: "Child2", height: 130, weight: 45 },
		]);
	});
});
