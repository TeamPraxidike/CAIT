import { describe, expect, it } from 'vitest';
import { formatTimeEstimate, getLicenseUrl } from '$lib/util/publicationMetadata';

describe('formatTimeEstimate', () => {
	it.each([
		[1, '1 minute'],
		[30, '30 minutes'],
		[60, '1 hour'],
		[61, '1 hour 1 minute'],
		[90, '1 hour 30 minutes'],
		[120, '2 hours'],
	])('formats %i minutes as %s', (minutes, expected) => {
		expect(formatTimeEstimate(minutes)).toBe(expected);
	});

	it.each([null, undefined, 0, -15])('does not display an invalid estimate of %s', (minutes) => {
		expect(formatTimeEstimate(minutes)).toBeNull();
	});
});

describe('getLicenseUrl', () => {
	it.each([
		['CC BY', 'https://creativecommons.org/licenses/by/4.0/'],
		['CC BY-SA', 'https://creativecommons.org/licenses/by-sa/4.0/'],
		['CC BY-ND', 'https://creativecommons.org/licenses/by-nd/4.0/'],
		['CC BY-NC', 'https://creativecommons.org/licenses/by-nc/4.0/'],
		['CC BY-NC-SA', 'https://creativecommons.org/licenses/by-nc-sa/4.0/'],
		['CC BY-NC-ND', 'https://creativecommons.org/licenses/by-nc-nd/4.0/'],
	])('links %s to its official license', (license, expected) => {
		expect(getLicenseUrl(license)).toBe(expected);
	});

	it('matches known licenses without case or surrounding-space sensitivity', () => {
		expect(getLicenseUrl('  cc by-sa  ')).toBe(
			'https://creativecommons.org/licenses/by-sa/4.0/',
		);
	});

	it.each(['Custom terms', '', null, undefined])('does not link an unknown license of %s', (license) => {
		expect(getLicenseUrl(license)).toBeNull();
	});
});
