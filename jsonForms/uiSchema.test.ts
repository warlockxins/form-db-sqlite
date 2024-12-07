
import { createTables, insertLayout, insertControl, getUISchema } from './uiSchema';

import { describe, test, expect, beforeEach, beforeAll } from "bun:test";
import { Database } from 'bun:sqlite';

describe('UI Schema Tests', () => {
	const db = new Database('ui_schema.db');

	beforeAll(() => {
		createTables(db);
	});

	beforeEach(() => {
		db.exec('DELETE FROM layouts');
		db.exec('DELETE FROM controls');
	});

	test('should insert a basic vertical layout and controls', () => {
		const layoutId = insertLayout(db, 'VerticalLayout');
		insertControl(db, 'First Name', '#/properties/firstName', layoutId);
		insertControl(db, 'Last Name', '#/properties/lastName', layoutId);

		const schema = getUISchema(db);
		expect(schema).toHaveLength(1);
		expect(schema[0].type).toBe('VerticalLayout');
		expect(schema[0].elements).toHaveLength(2);
		expect(schema[0].elements[0].label).toBe('First Name');
	});

	test('should handle nested layouts', () => {
		const layoutId1 = insertLayout(db, 'VerticalLayout');
		insertControl(db, 'First Name', '#/properties/firstName', layoutId1);
		insertControl(db, 'Last Name', '#/properties/lastName', layoutId1);

		const layoutId2 = insertLayout(db, 'HorizontalLayout', layoutId1);
		insertControl(db, 'Email', '#/properties/email', layoutId2);
		insertControl(db, 'Phone', '#/properties/phone', layoutId2);

		const schema = getUISchema(db);
		expect(schema).toHaveLength(1);
		// console.log("--->", schema)
		expect(schema[0].type).toBe('VerticalLayout');
		expect(schema[0].elements).toHaveLength(3);
		expect(schema[0].elements[0].type).toBe('Control');
		expect(schema[0].elements[0].label).toBe('First Name');
		expect(schema[0].elements[2].elements[0].label).toBe('Email')
	});

	test('should correctly fetch UI schema with nested layouts', () => {
		const layoutId1 = insertLayout(db, 'VerticalLayout');
		insertControl(db, 'First Name', '#/properties/firstName', layoutId1);

		const layoutId2 = insertLayout(db, 'HorizontalLayout', layoutId1);
		insertControl(db, 'Email', '#/properties/email', layoutId2);

		const schema = getUISchema(db);

		// console.log("====>", schema)
		expect(schema[0].type).toBe('VerticalLayout');
		expect(schema[0].elements).toHaveLength(2);
		expect(schema[0].elements[1].elements[0].label).toBe('Email');
	});
});
