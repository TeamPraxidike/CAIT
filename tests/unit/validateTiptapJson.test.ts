import { describe, it, expect } from 'vitest';
import {
	validateTiptapJson,
	validateOptionalTiptapJson
} from '$lib/server/validateTiptapJson';

describe('validateTiptapJson', () => {
	it('should return invalid for null', () => {
		expect(validateTiptapJson(null)).toEqual({ valid: false, error: 'Content is required' });
	});

	it('should return invalid for undefined', () => {
		expect(validateTiptapJson(undefined)).toEqual({ valid: false, error: 'Content is required' });
	});

	it('should return invalid for a string', () => {
		expect(validateTiptapJson('hello')).toEqual({
			valid: false,
			error: 'Content must be a JSON object'
		});
	});

	it('should return invalid for a number', () => {
		expect(validateTiptapJson(42)).toEqual({
			valid: false,
			error: 'Content must be a JSON object'
		});
	});

	it('should return invalid for an array', () => {
		expect(validateTiptapJson([1, 2, 3])).toEqual({
			valid: false,
			error: 'Content must be a JSON object'
		});
	});

	it('should return invalid for an object with wrong type', () => {
		const result = validateTiptapJson({ type: 'paragraph' });
		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.error).toContain('Expected top-level type "doc"');
		}
	});

	it('should return invalid for an object with no type', () => {
		const result = validateTiptapJson({ content: [] });
		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.error).toContain('Expected top-level type "doc"');
		}
	});

	it('should return valid for a minimal doc', () => {
		expect(validateTiptapJson({ type: 'doc', content: [] })).toEqual({ valid: true });
	});

	it('should return valid for a doc with a paragraph', () => {
		expect(
			validateTiptapJson({
				type: 'doc',
				content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
			})
		).toEqual({ valid: true });
	});

	it('should return valid for a doc with a mention node', () => {
		expect(
			validateTiptapJson({
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'mention',
								attrs: { id: 'user-1', label: 'Alice' }
							}
						]
					}
				]
			})
		).toEqual({ valid: true });
	});
});

describe('validateOptionalTiptapJson', () => {
	it('should return valid for null', () => {
		expect(validateOptionalTiptapJson(null)).toEqual({ valid: true });
	});

	it('should return valid for undefined', () => {
		expect(validateOptionalTiptapJson(undefined)).toEqual({ valid: true });
	});

	it('should return valid for an empty string', () => {
		expect(validateOptionalTiptapJson('')).toEqual({ valid: true });
	});

	it('should delegate to validateTiptapJson for an invalid object', () => {
		const result = validateOptionalTiptapJson({ type: 'paragraph' });
		expect(result.valid).toBe(false);
		if (!result.valid) {
			expect(result.error).toContain('Expected top-level type "doc"');
		}
	});

	it('should return valid for a valid doc', () => {
		expect(
			validateOptionalTiptapJson({
				type: 'doc',
				content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
			})
		).toEqual({ valid: true });
	});
});
