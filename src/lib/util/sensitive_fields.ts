/**
 * Returns the fields to be returned for a user, depending on whether sensitive fields should be returned or not.
 * Mainly used in pages that a user can visit without being logged in
 * @param return_sensitive_fields
 */
export function sensitive_fields_user(return_sensitive_fields: boolean) {
	let user_fields: any = {
		include: {profilePic: true}
	};
	if (!return_sensitive_fields) user_fields = {
		select: {
			profilePic: true,
			id: true,
			firstName: true,
			lastName: true,
			username: true,
			reputation: true,
			email: false,
			institutionId: false,
			platformId: false,
		}
	};
	return user_fields;
}