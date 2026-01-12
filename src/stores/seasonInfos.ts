import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type SeasonInfo } from "@/types";
import { fetchAllSeasonInfo, fetchSeasonInfo } from "@/utils/dataOption";

export const useSeasonInfosStore = defineStore("seasonInfos", () => {
    const seasonInfos = ref<SeasonInfo[]>([]);
    const getAllSessonInfos = async () => {
        seasonInfos.value = await fetchAllSeasonInfo();
    };
    const seasonInfosNum = computed(() => seasonInfos.value.length);
    const addOneSeasonInfo = async (videoUrl: string) => {
        const seasonInfo = await fetchSeasonInfo(videoUrl);
        // 添加到列表的最前面（最新创建的在最上方）
        seasonInfos.value.unshift(seasonInfo);
    };
    const updateSeasonInfo = (updatedSeasonInfo: SeasonInfo) => {
        const index = seasonInfos.value.findIndex(
            (item) => item.season_id === updatedSeasonInfo.season_id
        );
        seasonInfos.value[index] = updatedSeasonInfo;
    };
    const deleteSeasonInfo = (season_id: number) => {
        seasonInfos.value = seasonInfos.value.filter(
            (item) => item.season_id !== season_id
        );
    };
    return {
        seasonInfos,
        seasonInfosNum,
        getAllSessonInfos,
        addOneSeasonInfo,
        updateSeasonInfo,
        deleteSeasonInfo,
    };
});
