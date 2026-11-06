export const SEED_MATERIALS = [
    '[SEED] Gradient Descent by Hand',
    '[SEED] Decision Trees and Information Gain',
    '[SEED] Attention and the Transformer Block',
] as const;

export const SEED_CIRCUITS = [
    '[SEED] From Optimisation to Transformers',
    '[SEED] Deep Learning Shortcut',
] as const;

export const SEED_COURSES = [
    '[SEED] Foundations of Machine Learning',
    '[SEED] Deep Learning for Sequences',
] as const;

// Convenience singles for specs that only touch the first of a kind.
export const SEED_MATERIAL = SEED_MATERIALS[0];
export const SEED_CIRCUIT = SEED_CIRCUITS[0];
export const SEED_COURSE = SEED_COURSES[0];

// The members of SEED_CIRCUIT ("[SEED] From Optimisation to Transformers") are
// all three seed materials, in order - see TEST_CIRCUITS[0].members in
// scripts/seedTestData.ts.
export const CIRCUIT_MEMBERS = SEED_MATERIALS;