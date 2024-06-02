<script lang="ts">
    import Icon from '@iconify/svelte';

    export let value: number = 0.5;
    export let editable: boolean = true;
    let divElement: HTMLDivElement;
    let slider: DOMRect;
    let isDragging = false;

    //Clamp the value between 1 and 100
    const clamp = (x: number): number => Math.min(1, Math.max(0, x));
    const handleOnMove = (e: MouseEvent) => {
        //If we are not dragging or the element is simply not editable(e.g. view page) we ignore the movement
        if (!isDragging || !editable) {
            return;
        }

        // check the width and assign the percentage value
        value = Number(clamp(slider ? (e.clientX - slider.left) / slider.width : 0).toFixed(2));
    }

    const handleOnMoveTouch = (e: TouchEvent) => {

        if (!isDragging || !editable) {
            return;
        }
        value = Number(clamp(slider ? (e.touches[0].clientX - slider.left) / slider.width : 0).toFixed(2));
    }


    // Start the dragging process and update the slider property
    const start = () => {
        //update the slider element in case the window has been resized
        slider = divElement.getBoundingClientRect()

        //initiate the dragging sequence by setting the isDragging to true
        isDragging = true;
    }

    //Finish the dragging process
    const finsih = () => {
        isDragging = false;
    };


</script>

<div class="flex flex-col gap-2">
    <p>Theory to application ratio</p>
    <div class="flex justify-center items-center ">
        <div class="bg-primary-500 flex-col items-center justify-center p-1 rounded-md border border-surface-600">
            <div class="flex justify-center text-xl text-surface-50">
                <Icon icon="solar:notebook-bold"/>
            </div>
            <p class="text-surface-50 self-center hidden md:block md:text-xs">Theory</p>
        </div>
        <div tabindex="0" role="button" bind:this={divElement} on:mousemove={handleOnMove} on:touchmove={handleOnMoveTouch}
             on:mousedown={start} on:mouseup={finsih} on:touchstart={start} on:touchend={finsih}>
            <div
                    class="relative flex items-center w-24 md:w-36 xl:w-44 h-4 md:h-6 xl:h-8 border-y border-surface-600">
                <div class="bg-primary-500 h-4 md:h-6 xl:h-8 flex items-center border-y  border-surface-600 "
                     style="width: {value*100}%" />
                <div
                        class="bg-surface-50 flex-grow h-4 md:h-6 xl:h-8 justify-self-end flex  items-center border-y border-l border-surface-600" />
                <p class="absolute left-1 text-surface-100 text-xs"> {Math.round(value * 100)}%</p>
                <p class="absolute right-1 text-primary-600 text-xs">{Math.round((1 - value) * 100)}%</p>
            </div>
        </div>
        <div class="bg-surface-50 p-1 rounded-md border border-surface-600">
            <div class="flex justify-center text-xl text-primary-500">
                <Icon icon="ci:window-code-block" />
            </div>
            <p class="text-primary-500 text-xs hidden md:block">Practice</p>
        </div>

    </div>
</div>

