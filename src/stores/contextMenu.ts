import { defineStore } from "pinia";
import { ref } from "vue";

export const useContextMenuStore = defineStore("contextMenu", () => {
    const showContextMenu = ref<boolean>(false);
    const x = ref<number>(0);
    const y = ref<number>(0);

    const show = (xPos: number, yPos: number) => {
        x.value = xPos;
        y.value = yPos;
        showContextMenu.value = true;
    };

    const hide = () => {
        showContextMenu.value = false;
    };

    return { showContextMenu, x, y, show, hide };
});
