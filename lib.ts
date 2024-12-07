import { Database } from "bun:sqlite";

// Create tables
export function createTables(db: Database) {
	db.run(`
    CREATE TABLE IF NOT EXISTS parent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    )
  `);

	db.run(`
    CREATE TABLE IF NOT EXISTS parent_children (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      parent_id INTEGER,
      FOREIGN KEY (parent_id) REFERENCES parent(id)
    )
  `);

	db.run(`
    CREATE TABLE IF NOT EXISTS parent_children_attributes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      height INTEGER,
      weight INTEGER,
      parent_id INTEGER,
      FOREIGN KEY (parent_id) REFERENCES parent_children(id)
    )
  `);
}

// Get the last inserted row ID
function getLastInsertRowId(db: Database): number {
	return db.query("SELECT last_insert_rowid() AS id").get().id;
}

// Insert data into the database
export function insertData(db: Database, jsonData: any) {
	const parentStmt = db.prepare("INSERT INTO parent (name) VALUES (?)");
	const childStmt = db.prepare(
		"INSERT INTO parent_children (name, parent_id) VALUES (?, ?)"
	);
	const childAttrStmt = db.prepare(
		"INSERT INTO parent_children_attributes (height, weight, parent_id) VALUES (?, ?, ?)"
	);

	for (const parent of jsonData) {
		parentStmt.run(parent.name);
		const parentId = getLastInsertRowId(db);

		for (const child of parent.children) {
			childStmt.run(child.name, parentId);
			const childId = getLastInsertRowId(db);

			childAttrStmt.run(child.attributes.height, child.attributes.weight, childId);
		}
	}
}

// Query data from the database
export function getChildrenAttributes(db: Database, parentId: number) {
	const query = `
    SELECT 
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
      pc.parent_id = ?
  `;

	return db.query(query).all(parentId);
}
