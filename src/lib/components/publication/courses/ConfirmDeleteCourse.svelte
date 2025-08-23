<script lang="ts">
    import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';

    const modalStore = getModalStore();

    let currentCourseId: number | null = null;
    let onConfirmFn: ((courseId: number) => void | Promise<void>) | null = null;

    const modal: ModalSettings = {
        type: 'confirm',
        title: 'Are you sure you want to delete this course?',
        body: 'It will be removed from all publications that are associated with it. Their metadata will remain the same.',
        response: async (confirmed: boolean) => {
            if (confirmed && currentCourseId !== null && onConfirmFn) {
                await onConfirmFn(currentCourseId);
            }
            currentCourseId = null;
            onConfirmFn = null;
        }
    };

    export function open(params: { courseId: number; onConfirm: (courseId: number) => void | Promise<void> }) {
        currentCourseId = params.courseId;
        onConfirmFn = params.onConfirm;
        modalStore.trigger(modal);
    }
</script>


