import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type Episode } from "@/types";

export const useSelectedEpisodesStore = defineStore("selectedEpisodes", () => {
    const currentSeasonId = ref(0);
    const selectedEpisodes = ref<Episode[]>([]);
    const selectedEpisodesNum = computed(() => selectedEpisodes.value.length);
    const clearSelectedEpisodes = () => {
        if (selectedEpisodesNum.value) {
            selectedEpisodes.value = [];
            lastClickedEpisode.value = null;
        }
    };
    const lastClickedEpisode = ref<Episode | null>(null);
    const isSameCollection = (episode: Episode) => {
        return episode.collection_id === currentSeasonId.value;
    };
    const updateLastClickedEpisode = (episode: Episode) => {
        lastClickedEpisode.value = episode;
        currentSeasonId.value = episode.collection_id;
    };
    const isSelected = (episode: Episode) => {
        return selectedEpisodes.value.some((e) => e.bvid === episode.bvid);
    };
    const addSelectedEpisode = (episode: Episode) => {
        selectedEpisodes.value.push(episode);
    };
    const singleSelect = (episode: Episode) => {
        selectedEpisodes.value = [episode];
    };
    const multiSelect = (episodes: Episode[]) => {
        selectedEpisodes.value = episodes;
    };
    return {
        selectedEpisodes,
        currentSeasonId,
        selectedEpisodesNum,
        lastClickedEpisode,
        isSameCollection,
        clearSelectedEpisodes,
        updateLastClickedEpisode,
        isSelected,
        addSelectedEpisode,
        singleSelect,
        multiSelect,
    };
});
