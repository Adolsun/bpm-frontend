import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type SeasonInfo } from "@/types";
import { fetchAllSeasonInfo, fetchSeasonInfo } from "@/utils/dataOption";

export const useSeasonInfosStore = defineStore("seasonInfos", () => {
    const seasonInfos = ref<SeasonInfo[]>([]);

    // 后端部分接口返回的视频顺序不稳定，统一按 order_index 规范化
    const normalizeSeasonInfo = (info: SeasonInfo): SeasonInfo => ({
        ...info,
        videos: [...info.videos].sort((a, b) => a.order_index - b.order_index),
    });

    const getAllSessonInfos = async () => {
        seasonInfos.value = (await fetchAllSeasonInfo()).map(normalizeSeasonInfo);
    };
    const seasonInfosNum = computed(() => seasonInfos.value.length);
    const addOneSeasonInfo = async (videoUrl: string) => {
        const seasonInfo = await fetchSeasonInfo(videoUrl);
        // 添加到列表的最前面（最新创建的在最上方）
        seasonInfos.value.unshift(normalizeSeasonInfo(seasonInfo));
    };
    const updateSeasonInfo = (updatedSeasonInfo: SeasonInfo) => {
        const index = seasonInfos.value.findIndex(
            (item) => item.season_id === updatedSeasonInfo.season_id
        );
        seasonInfos.value[index] = normalizeSeasonInfo(updatedSeasonInfo);
    };
    const deleteSeasonInfo = (season_id: number) => {
        seasonInfos.value = seasonInfos.value.filter(
            (item) => item.season_id !== season_id
        );
    };
    const reorderSeasonInfos = (newOrder: SeasonInfo[]) => {
        seasonInfos.value = newOrder;
    };
    return {
        seasonInfos,
        seasonInfosNum,
        getAllSessonInfos,
        addOneSeasonInfo,
        updateSeasonInfo,
        deleteSeasonInfo,
        reorderSeasonInfos,
    };
});
