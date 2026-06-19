import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSelectedCollectionsStore = defineStore("selectedCollections", () => {
    const selectedIds = ref<Set<number>>(new Set());
    const isBatchMode = ref(false);

    const selectedCount = computed(() => selectedIds.value.size);

    const isSelected = (seasonId: number) => {
        return selectedIds.value.has(seasonId);
    };

    const toggleSelect = (seasonId: number) => {
        const newSet = new Set(selectedIds.value);
        if (newSet.has(seasonId)) {
            newSet.delete(seasonId);
        } else {
            newSet.add(seasonId);
        }
        selectedIds.value = newSet;
    };

    const selectAll = (ids: number[]) => {
        selectedIds.value = new Set(ids);
    };

    const clearSelection = () => {
        selectedIds.value = new Set();
    };

    const toggleBatchMode = () => {
        isBatchMode.value = !isBatchMode.value;
        if (!isBatchMode.value) {
            clearSelection();
        }
    };

    const isAllSelected = (ids: number[]) => {
        return ids.length > 0 && ids.every((id) => selectedIds.value.has(id));
    };

    const toggleSelectAll = (ids: number[]) => {
        if (isAllSelected(ids)) {
            clearSelection();
        } else {
            selectAll(ids);
        }
    };

    return {
        selectedIds,
        selectedCount,
        isBatchMode,
        isSelected,
        toggleSelect,
        selectAll,
        clearSelection,
        toggleBatchMode,
        isAllSelected,
        toggleSelectAll,
    };
});
