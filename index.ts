
import { Database } from "bun:sqlite";
import { createTables, getChildrenAttributes, insertData } from "./lib";

// Initialize the SQLite database
const db = new Database("nested_example.db");


// Example JSON Data
const exampleData = [
	{
		name: "Parent1",
		children: [
			{ name: "Child1", attributes: { height: 120, weight: 40 } },
			{ name: "Child2", attributes: { height: 130, weight: 45 } }
		]
	}
];

// Run the functions
createTables(db);
insertData(db, exampleData);
const results = getChildrenAttributes(db, 1);

console.log("Children attributes for Parent 1:", results);

// Close the database
db.close();
