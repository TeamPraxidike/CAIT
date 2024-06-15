/**
 * ! Executing this script will delete all data in your database and seed it with 10 user.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from '@snaplet/seed';
import { coverPic, files } from './files';
import { addNode, handleEdges, prisma } from '../../src/lib/database';
import { Difficulty, MaterialType, PublicationType } from '@prisma/client';

const main = async () => {
	const seed = await createSeedClient();

	//Truncate all tables in the database
	await seed.$resetDatabase();

	const users = [
		{
			first: 'Franklin Roosvelt',
			last: '',
			email: 'franklin@gmail.com',
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
		'Neural networks',
		'Convolutional neural networks',
		'SVM',
		'Reinforcement learning',
		'The perceptron - basics',
		'Introduction to Machine Learning',
		'Clustering Techniques',
	];
	const descriptions = [
		'Beginner-friendly introduction to neural networks, covering fundamental concepts, terminology, and basic principles. Aimed at newcomers to the field, it provides clear explanations and examples to help readers grasp the core ideas behind neural network architecture and functioning. Through accessible language and illustrative diagrams, it empowers beginners to embark on their journey into understanding and applying neural networks.',
		'Explore the fundamentals of Convolutional Neural Networks (CNNs) with this curated collection of educational materials. From basic concepts to practical applications, these resources provide a structured approach to understanding CNN architecture and functionality. Ideal for learners seeking to grasp the essentials of image processing and pattern recognition using neural networks.',
		'Beginner-friendly introduction to Support Vector Machines (SVM), elucidating core concepts, terminology, and practical applications. Tailored for novices in the field, it provides straightforward explanations and illustrative examples to facilitate understanding of SVM principles and algorithms. Through clear language and intuitive illustrations, it equips beginners with the foundational knowledge needed to explore SVMs in machine learning tasks.',
		"Covering key principles, algorithms, and applications, these resources provide a comprehensive introduction to RL for learners at all levels. Explore tutorials, case studies, and interactive exercises designed to deepen your understanding and proficiency in leveraging RL for solving complex decision-making problems. Whether you're a student, researcher, or practitioner, this collection offers valuable insights to support your journey into the fascinating realm of reinforcement learning.",
		'Designed for learners seeking a foundational understanding of single-layer neural networks, this collection provides a structured approach to mastering the concepts and principles behind Perceptrons.',
		'Dive into the basics of machine learning with this introductory resource, covering essential concepts such as supervised and unsupervised learning, classification, and regression.',
		'Anomaly detection is the identification of rare events, items, or observations which are suspicious because they differ significantly from standard behaviors or patterns.',
		'Comprehensive guide, exploring techniques such as K-means, hierarchical clustering, and density-based clustering for unsupervised learning tasks.',
	];
	const tags = [
		'clustering',
		'ann',
		'regression',
		'classification',
		'datasets',
		'unsupervised learning',
		'supervised learning',
		'neural networks',
		'data mining',
		'evolutionary algorithms',
		'genetic algorithms',
		'optimization',
		'hyper-parameter tuning',
		'feature selection',
		'feature engineering',
		'ensemble learning',
		'bagging',
		'boosting',
		'random forests',
		'gradient boosting',
		'rl',
		'svm',
		'reinforcement learning',
		'perceptron',
	];

	const circuitTitles = ['Machine Learning for beginners'];

	const types = [
		MaterialType.assignment,
		MaterialType.slides,
		MaterialType.other,
		MaterialType.video,
		MaterialType.examQuestions,
		MaterialType.lectureNotes,
		MaterialType.lectureNotes
	];

	const difficulties = [
		Difficulty.easy,
		Difficulty.medium,
		Difficulty.hard,
		Difficulty.easy,
		Difficulty.medium,
		Difficulty.hard,
		Difficulty.hard,
	];

	const materialTag = [
		['ann', 'neural networks', 'supervised learning'],
		['ann', 'neural networks', 'supervised learning'],
		['svm', 'supervised learning'],
		['rl', 'reinforcement learning'],
		['perceptron', 'ann', 'neural networks'],
		['supervised learning', 'unsupervised learning'],
		['clustering', 'unsupervised learning'],
	];

	await seed.tag((x) =>
		x(tags.length, ({ index }) => ({ content: tags[index] })),
	);

	await seed.user((x) =>
		x(users.length, ({ index }) => ({
			firstName: users[index].first,
			lastName: users[index].last,
			email: users[index].email,
			id: (index + 1).toString(),
		})),
	);

	const materials = [];
	for (let i = 0; i < titles.length; i++) {
		await prisma.file.createMany({
			data: files[i],
		});
		if (coverPic[i] !== undefined)
			await prisma.file.create({
				data: coverPic[i],
			});

		const mat = await prisma.material.create({
			data: {
				copyright: false,
				encapsulatingType: types[i],
				publication: {
					create: {
						title: titles[i],
						publisherId: '1',
						description: descriptions[i],
						difficulty: difficulties[i],
						learningObjectives: [],
						prerequisites: [],
						type: PublicationType.Material,
						coverPic: {
							connect: coverPic[i],
						},
						tags: {
							connect: materialTag[i].map((tag) => ({
								content: tag,
							})),
						},
						likes: Math.round(Math.random() * 400),
					},
				},
				files: {
					connect: files[i].map((file) => ({ path: file.path })), // Connects the created files to the material
				},
			},
		});
		materials.push(mat);
	}

	await prisma.file.createMany({
		data: {
			path: 'circuit.png',
			type: 'image/png',
			title: 'circuit.png',
		},
	});

	const circuit = await prisma.circuit.create({
		data: {
			numNodes: 5,
			publication: {
				create: {
					title: circuitTitles[0],
					publisherId: '1',
					description:
						'A circuit that walks you through the basics of machine learning.',
					difficulty: Difficulty.easy,
					learningObjectives: [],
					prerequisites: [],
					type: PublicationType.Circuit,
					coverPic: {
						connect: {
							path: 'circuit.png',
							type: 'image/png',
							title: 'circuit.png',
						},
					},
					likes: Math.round(Math.random() * 4000),
				},
			},
		},
	});
	const nodes = [];

	nodes.push(await addNode(circuit.id, materials[0].publicationId, 0, 500)); // neural networks 0
	nodes.push(await addNode(circuit.id, materials[1].publicationId, 310, 500)); // cnn 1
	nodes.push(await addNode(circuit.id, materials[2].publicationId, 250, 250)); // svm 2
	nodes.push(
		await addNode(circuit.id, materials[4].publicationId, -250, 250),
	); // perceptron 3
	nodes.push(await addNode(circuit.id, materials[5].publicationId, 0, 0)); // basics 4

	const edges = [
		{
			fromId: nodes[4].publicationId,
			toId: [nodes[3].publicationId, nodes[2].publicationId],
		},
		{ fromId: nodes[2].publicationId, toId: [nodes[0].publicationId] },
		{ fromId: nodes[3].publicationId, toId: [nodes[0].publicationId] },
		{ fromId: nodes[0].publicationId, toId: [nodes[1].publicationId] },
	];
	await handleEdges(circuit.id, edges);

	process.exit();
};

main();
