/**
 * ! Executing this script will delete all data in your database and seed it with 10 user.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from '@snaplet/seed';

const main = async () => {
	const seed = await createSeedClient();

	// Truncate all tables in the database
	await seed.$resetDatabase();

	const names = ['Winston', 'Franklin', 'Boris', 'Otto'];
	const lastNames = ['Churchill', 'Roosevelt', 'Johnson', 'von Bismarck'];
	const titles = [
		'ANN',
		'Convolutional neural networks',
		'SVM',
		'Reinforcment learning',
	];

	// Seed the database with 10 user
	await seed.material((x) =>
		x(titles.length, ({ index }) => ({
			publication: {
				title: titles[index],
			},
			user: {
				userId: index,
				firstName: names[index],
				lastName: lastNames[index],
			},
		})),
	);

	await seed.tag((x) => x(20, ({ index }) => ({ content: `tag ${index}` })));

	// seed.projects((x) => x(3, { name: 'Project Name' }));
	process.exit();
};

main();
