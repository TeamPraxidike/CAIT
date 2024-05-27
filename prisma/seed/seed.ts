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

	const users = [
		{
			first: 'Omni-man',
			last: '',
			email: 'omniman@viltrum.org',
		},
		{
			first: 'Winston',
			last: 'Churchill',
			email: 'winchurch@parl.gov.uk',
		},
		{
			first: 'Franklin',
			last: 'Roosevelt',
			email: 'fdr@usa.gov',
		},
		{
			first: 'Boris',
			last: 'Johnson',
			email: 'borjon@parl.gov.uk',
		},
		{
			first: 'Otto',
			last: 'von Bismarck',
			email: 'ottogermany5@prussia.org',
		},
	];

	const titles = [
		'ANN',
		'Convolutional neural networks',
		'SVM',
		'Reinforcment learning',
	];
	const tags = [
		'ai',
		'ml',
		'dl',
		'rl',
		'cv',
		'nlp',
		'ann',
		'gbm',
		'xgboost',
		'lightgbm',
		'catboost',
		'neural networks',
	];

	await seed.tag((x) =>
		x(tags.length, ({ index }) => ({ content: tags[index] })),
	);

	await seed.user((x) =>
		x(users.length, ({ index }) => ({
			firstName: users[index].first,
			lastName: users[index].last,
			email: users[index].email,
			id: index + 1,
		})),
	);

	await seed.publication((x) =>
		x(titles.length, ({ index }) => ({
			title: titles[index],
			tags: { connect: { content: tags[index] } },
			publisherId: index + 1,
			publicationId: index + 1,
		})),
	);

	await seed.material((x) =>
		x(titles.length, ({ index }) => ({
			title: titles[index],
			publicationId: index + 1,
			userId: index + 1,
		})),
	);

	process.exit();
};

main();
