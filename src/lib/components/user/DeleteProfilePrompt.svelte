<script lang="ts">
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';

	const modalStore = getModalStore();

	let onConfirmFn: (() => void | Promise<void>) | null = null;

	const modal: ModalSettings = {
		type: 'confirm',
		title: 'Delete your profile',
		body: `This will permanently remove your profile information and cannot be undone. Your published materials will remain but links to your profile will be removed. If you're sure, confirm below.`,
		buttonTextSubmit: 'Delete profile',
		buttonTextCancel: 'Cancel',
		response: async (confirmed: boolean) => {
			if (confirmed && onConfirmFn) {
				await onConfirmFn();
			}
			onConfirmFn = null;
		}
	};

	/**
	 * Open the delete profile prompt.
	 * params.onConfirm will be called if the user confirms.
	 */
	export function open(params?: { onConfirm?: () => void | Promise<void> }) {
		onConfirmFn = params?.onConfirm ?? null;
		modalStore.trigger(modal);
	}
</script>

<!-- This component is designed to be opened via the exported `open()` function,
	 which triggers Skeleton's modal system. For inline use, call open() from
	 a parent component and provide an `onConfirm` callback that performs the
	 deletion (e.g. submits the form or calls the API). -->
