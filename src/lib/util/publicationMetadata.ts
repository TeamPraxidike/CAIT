const CREATIVE_COMMONS_LICENSE_URLS: Record<string, string> = {
	'CC BY': 'https://creativecommons.org/licenses/by/4.0/',
	'CC BY-SA': 'https://creativecommons.org/licenses/by-sa/4.0/',
	'CC BY-ND': 'https://creativecommons.org/licenses/by-nd/4.0/',
	'CC BY-NC': 'https://creativecommons.org/licenses/by-nc/4.0/',
	'CC BY-NC-SA': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
	'CC BY-NC-ND': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
};

export function formatTimeEstimate(totalMinutes: number | null | undefined): string | null {
	if (!totalMinutes || totalMinutes < 1) return null;

	const minutes = Math.round(totalMinutes);
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	const parts: string[] = [];

	if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
	if (remainingMinutes > 0) {
		parts.push(`${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`);
	}

	return parts.join(' ');
}

export function getLicenseUrl(license: string | null | undefined): string | null {
	if (!license) return null;

	return CREATIVE_COMMONS_LICENSE_URLS[license.trim().toUpperCase()] ?? null;
}
