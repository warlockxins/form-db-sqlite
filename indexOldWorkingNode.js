
const sqlite3 = require('better-sqlite3');
const db = new sqlite3('nested_example.db');

// Sample JSON
const jsonData = {
	id: 1,
	name: "Parent",
	children: [
		{
			id: 2,
			name: "Child1",
			attributes: { height: 120, weight: 40 }
		},
		{
			id: 3,
			name: "Child2",
			attributes: { height: 130, weight: 45 }
		}
	]
};

// Function to create tables and insert data
function createTables() {
	// Create 'parent' table
	db.exec(`
        CREATE TABLE IF NOT EXISTS parent (
            id INTEGER PRIMARY KEY,
            name TEXT
        );
    `);

	// Create 'parent_children' table
	db.exec(`
        CREATE TABLE IF NOT EXISTS parent_children (
            id INTEGER PRIMARY KEY,
            name TEXT,
            parent_id INTEGER,
            FOREIGN KEY (parent_id) REFERENCES parent(id)
        );
    `);

	// Create 'parent_children_attributes' table
	db.exec(`
        CREATE TABLE IF NOT EXISTS parent_children_attributes (
            height INTEGER,
            weight INTEGER,
            parent_id INTEGER,
            FOREIGN KEY (parent_id) REFERENCES parent_children(id)
        );
    `);
}

// Function to insert data into the tables
function insertData() {
	// Insert data into 'parent' table
	const parentStmt = db.prepare('INSERT INTO parent (id, name) VALUES (?, ?)');
	parentStmt.run(jsonData.id, jsonData.name);

	// Insert data into 'parent_children' table
	const childStmt = db.prepare('INSERT INTO parent_children (id, name, parent_id) VALUES (?, ?, ?)');
	jsonData.children.forEach(child => {
		childStmt.run(child.id, child.name, jsonData.id);

		// Insert child attributes into 'parent_children_attributes' table
		const attrStmt = db.prepare('INSERT INTO parent_children_attributes (height, weight, parent_id) VALUES (?, ?, ?)');
		attrStmt.run(child.attributes.height, child.attributes.weight, child.id);
	});
}

function getAllChildrenAttributes(attributeParentId) {
	const attrStmt = db.prepare(`SELECT 
    pc.id AS child_id,
    pc.name AS child_name,
    pca.height,
    pca.weight
FROM 
    parent_children pc
JOIN 
    parent_children_attributes pca
ON 
    pc.id = pca.parent_id
WHERE 
    pc.parent_id = ?;`)

	const rows = attrStmt.all(attributeParentId);
	console.table(rows)
}

// Create the tables and insert data
createTables();
// insertData();

getAllChildrenAttributes(1)
console.log("Tables created and data inserted successfully.");


// Close the database connection
db.close();
