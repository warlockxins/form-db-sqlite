
import { Database } from 'bun:sqlite';

const createTables = (db: Database) => {
	db.exec(`
    CREATE TABLE IF NOT EXISTS layouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      parent_id INTEGER,
      FOREIGN KEY (parent_id) REFERENCES layouts(id)
    );
    CREATE TABLE IF NOT EXISTS controls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      scope TEXT NOT NULL,
      layout_id INTEGER,
      FOREIGN KEY (layout_id) REFERENCES layouts(id)
    );
  `);
};

const insertLayout = (db: Database, type: string, parentId: number | bigint | null = null): number | bigint => {
	// Insert and return the id of the newly inserted row
	const result = db.prepare('INSERT INTO layouts (type, parent_id) VALUES (?, ?) RETURNING id').run(type, parentId);
	console.log("check here ->", result)
	return result.lastInsertRowid;
};

const insertControl = (db: Database, label: string, scope: string, layoutId: number | bigint): number | bigint => {
	// Insert and return the id of the newly inserted row
	const result = db.prepare('INSERT INTO controls (label, scope, layout_id) VALUES (?, ?, ?) RETURNING id').run(label, scope, layoutId);
	return result.lastInsertRowid;
};

const getUILayout = (db: Database, layoutId: number): any => {
	console.log(`Fetching layout with ID: ${layoutId}`);  // Log layout ID

	const layout = db.prepare('SELECT * FROM layouts WHERE id = ?').get(layoutId);

	if (!layout) {
		console.error(`Layout with ID ${layoutId} not found.`);  // Detailed error logging
		throw new Error(`Layout with id ${layoutId} not found.`);
	}

	const controls = db.query('SELECT * FROM controls WHERE layout_id = ?').all(layoutId);

	const layoutObj: any = {
		type: layout.type,
		elements: controls.map((control: any) => ({
			type: 'Control',
			scope: control.scope,
			label: control.label,
		})),
	};

	const childLayouts = db.query('SELECT * FROM layouts WHERE parent_id = ?').all(layoutId);
	childLayouts.forEach((childLayout: any) => {
		layoutObj.elements.push(getUILayout(db, childLayout.id));
	});

	return layoutObj;
};

const getUISchema = (db: Database) => {
	const rootLayouts = db.query('SELECT * FROM layouts WHERE parent_id IS NULL').all();
	return rootLayouts.map((rootLayout: any) => getUILayout(db, rootLayout.id));
};

export { createTables, insertLayout, insertControl, getUISchema };
