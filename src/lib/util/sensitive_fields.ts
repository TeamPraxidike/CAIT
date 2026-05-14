/**
 * Returns the fields to be returned for a user, depending on whether sensitive fields should be returned or not.
 * Mainly used in pages that a user can visit without being logged in
 * @param return_sensitive_fields
 */
export const sensitive_fields_user_json = {
	email: false,
	institutionId: false,
	platformId: false,
}

export function sensitive_fields_user(return_sensitive_fields: boolean) {
	// everything plus the profile pic
	let user_fields: any = {
		include: {profilePic: true}
	};

	// profile pic plus some minimal data that is needed to display the user
	if (!return_sensitive_fields) user_fields = {
		select: {
			profilePic: true,
			id: true,
			firstName: true,
			lastName: true,
			username: true,
			reputation: true,
			...sensitive_fields_user_json
		}
	};
	return user_fields;
}