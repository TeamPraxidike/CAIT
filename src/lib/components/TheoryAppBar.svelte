<script lang="ts">
    import Icon from "@iconify/svelte";
    //import { writable } from 'svelte/store';
    import {afterUpdate, onMount} from "svelte";

    export let value: number = 0.5;
    export let editable: boolean = false;
    let divElement:HTMLDivElement;
    let slider: DOMRect
    const clamp = (x: number): number => Math.min(1, Math.max(0, x));





    onMount(() => {
        let isDragging = false;
        slider = divElement.getBoundingClientRect();


        const handleOnMove = (e: MouseEvent) => {

            if (!isDragging || !editable) {
                return;
            }
            value = Number(clamp(slider ? (e.clientX - slider.left) / slider.width : 0).toFixed(2));
        }

        const handleOnMoveTouch = (e: TouchEvent) => {

            if (!isDragging || !editable) {
                return;
            }
            value = Number(clamp(slider ? (e.touches[0].clientX - slider.left) / slider.width : 0).toFixed(2));
        }

        document.onmousedown = e => {
            slider = divElement.getBoundingClientRect();
                if (e.clientX >= slider.left && e.clientX <= slider.right && e.clientY >= slider.top && e.clientY <= slider.bottom) {
                    isDragging = true;
                    handleOnMove(e);
                }
            }
        document.ontouchstart = e => {
            slider = divElement.getBoundingClientRect();

            if (e.touches[0].clientX >= slider.left && e.touches[0].clientX <= slider.right && e.touches[0].clientY >= slider.top && e.touches[0].clientY <= slider.bottom) {
                isDragging = true;
                handleOnMoveTouch(e);
            }
        }


        document.onmousemove = e => handleOnMove(e);
        document.ontouchmove = e => handleOnMoveTouch(e);


        document.onmouseup = () => {
            isDragging = false;
        }
        document.ontouchend= () => {
            isDragging = false;
        }
    });

</script>
<div class = "flex items-center justify-center items-center ">
    <div class = "bg-primary-500 flex-col items-center justify-center p-1 rounded-md border border-surface-600">
        <div class = "flex justify-center text-xl text-surface-50">
            <Icon icon="solar:notebook-bold"/>
        </div>
        <p class = "text-surface-50 self-center hidden md:block md:text-xs">Theory</p>
    </div>
    <div bind:this={divElement} >
        <div class = "relative flex items-center items-center w-24 md:w-36 xl:w-44 h-4 md:h-6 xl:h-8 border-y border-surface-600">
            <div class = "bg-primary-500 h-4 md:h-6 xl:h-8 flex items-center border-y  border-surface-600 " style="width: {value*100}%"/>
            <div class = "bg-surface-50 flex-grow h-4 md:h-6 xl:h-8 justify-self-end flex  items-center border-y border-l border-surface-600"/>
            <p class = "absolute left-1 text-surface-100 text-xs"> {Math.round(value*100)}%</p>
            <p class = "absolute right-1 text-primary-600 text-xs">{Math.round((1-value)*100)}%</p>
        </div>
    </div>
    <div class = "bg-surface-50 p-1 rounded-md border border-surface-600">
        <div  class = "flex justify-center text-xl text-primary-500">
        <Icon icon="ci:window-code-block" />
        </div>
        <p class = "text-primary-500 text-xs hidden md:block">Practice</p>
    </div>

</div>
