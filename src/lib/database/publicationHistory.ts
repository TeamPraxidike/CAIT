export interface ChangeLogPayload {
	// The main comment for the entire update
	globalComment: string;

	// Comment per file
	fileComments: Record<string, string>;
}

// The structure of the JSON file change log
export interface FileChangeLog {
	fileName: string;
	action: 'CREATED' | 'UPDATED' | 'DELETED';
	comment?: string;
}

export interface ActorSnapshot {
	name: string;
	email: string;
	id: string;
}

export interface HistoryMeta {
	actorSnapshot: ActorSnapshot;
	fileChanges: FileChangeLog[];
}

export function createActorSnapshot(user: any): ActorSnapshot {
	if (!user) {
		return {
			name: 'unknown',
			email: 'unknown',
			id: 'unknown',
		};
	}

	const metadata = user.user_metadata || {};

	return {
		name: `${metadata.firstName} ${metadata.lastName}`.trim(),
		email: metadata.email,
		id: user.id,
	};
}
