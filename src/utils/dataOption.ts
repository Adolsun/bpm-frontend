import { extractBVFromUrl } from "./bvParser";
import { API } from "@/api";
import { type SeasonInfo } from "@/types";
import { ElMessageBox, ElMessage } from "element-plus";
import { useSelectedEpisodesStore } from "@/stores/selectedEpisodes";
import { useSeasonInfosStore } from "@/stores/seasonInfos";
import { useContextMenuStore } from "@/stores/contextMenu";

export async function fetchSeasonInfo(url: string): Promise<SeasonInfo> {
    // 提取BV号
    const bvid = extractBVFromUrl(url);
    if (!bvid) {
        throw new Error("提取BV号失败，请输入正确的链接");
    }

    try {
        const apiUrl = new URL(API.COLLECTION.CREATE, location.origin);

        const response = await fetch(apiUrl.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                bvid,
            }),
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.detail);
        }
        const collection = responseData.data;
        return collection;
    } catch (error) {
        throw error;
    }
}

export async function fetchAllSeasonInfo(): Promise<SeasonInfo[]> {
    try {
        const apiUrl = new URL(API.COLLECTION.GET, location.origin);
        const response = await fetch(apiUrl.toString(), {
            method: "GET",
        });
        const responseData = await response.json();
        const collections = responseData.data;
        return collections;
    } catch (error) {
        throw error;
    }
}

export async function changeWatchedCount(option: Number): Promise<void> {
    try {
        const selectedEpisodesStore = useSelectedEpisodesStore();
        const seasonInfosStore = useSeasonInfosStore();
        const contextMenuStore = useContextMenuStore();

        const apiUrl = new URL(API.VIDEO.PATCH, location.origin);
        const response = await fetch(apiUrl.toString(), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                season_id: selectedEpisodesStore.currentSeasonId,
                videos: selectedEpisodesStore.selectedEpisodes,
                option,
            }),
        });
        const responseData = await response.json();
        const collection = responseData.data; // 一个SeasonInfo
        // console.log(collection);
        seasonInfosStore.updateSeasonInfo(collection);
        contextMenuStore.hide();
        selectedEpisodesStore.clearSelectedEpisodes();
    } catch (error) {
        throw error;
    }
}

export async function refreshCollection(season_id: number): Promise<void> {
    try {
        const seasonInfosStore = useSeasonInfosStore();
        const apiUrl = new URL(API.COLLECTION.UPDATE, location.origin);
        const response = await fetch(apiUrl.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                season_id,
            }),
        });

        const responseData = await response.json();
        const collection = responseData.data; // 一个SeasonInfo
        seasonInfosStore.updateSeasonInfo(collection);
    } catch (error) {
        throw error;
    }
}

export async function deleteCollection(season_id: number): Promise<void> {
    try {
        await ElMessageBox.confirm(
            "将永久删除该合集, 确认删除?", // 确认框内容
            "提示",
            {
                autofocus: false,
                cancelButtonText: "取消",
                confirmButtonText: "确定",
            }
        );
        try {
            const seasonInfosStore = useSeasonInfosStore();
            const apiUrl = `${API.COLLECTION.DELETE}/${season_id}`;
            const response = await fetch(apiUrl.toString(), {
                method: "DELETE",
            });
            const responseData = await response.json();
            // 添加成功失败判断
            if (!response.ok) {
                throw new Error(responseData.detail);
            }
            seasonInfosStore.deleteSeasonInfo(season_id);
        } catch (error) {
            ElMessage.error(`删除失败: ${(error as Error).message}`);
        }
    } catch (error) {}
}

export interface BatchUpdateResult {
    succeeded: Array<{
        season_id: number;
        status: string;
        data: SeasonInfo;
    }>;
    failed: Array<{
        season_id: number;
        status: string;
        error: string;
    }>;
}

export async function batchDeleteCollections(
    season_ids: number[]
): Promise<void> {
    try {
        await ElMessageBox.confirm(
            `将永久删除 ${season_ids.length} 个合集, 确认删除?`,
            "提示",
            {
                autofocus: false,
                cancelButtonText: "取消",
                confirmButtonText: "确定",
            }
        );
        try {
            const seasonInfosStore = useSeasonInfosStore();
            const apiUrl = new URL(API.COLLECTION.BATCH_DELETE, location.origin);
            const response = await fetch(apiUrl.toString(), {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ season_ids }),
            });
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.detail);
            }
            season_ids.forEach((id) => {
                seasonInfosStore.deleteSeasonInfo(id);
            });
            ElMessage.success("批量删除成功");
        } catch (error) {
            ElMessage.error(`删除失败: ${(error as Error).message}`);
        }
    } catch (error) {}
}

export async function batchUpdateCollections(
    season_ids: number[]
): Promise<BatchUpdateResult> {
    const seasonInfosStore = useSeasonInfosStore();
    const apiUrl = new URL(API.COLLECTION.BATCH_UPDATE, location.origin);
    const response = await fetch(apiUrl.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ season_ids }),
    });
    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.detail);
    }
    const result = responseData.data;
    result.succeeded.forEach((item: { data: SeasonInfo }) => {
        seasonInfosStore.updateSeasonInfo(item.data);
    });
    return result;
}

export interface OrderUpdate {
    season_id: number;
    order_index: number;
}

interface ApiResponse {
    status: string;
    code: number;
    message: string;
    data: unknown;
    detail?: string;
}

export async function updateCollectionOrder(
    updates: OrderUpdate[]
): Promise<string> {
    const apiUrl = new URL(API.COLLECTION.UPDATE_ORDER, location.origin);
    const response = await fetch(apiUrl.toString(), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
    });
    const responseData: ApiResponse = await response.json();
    if (!response.ok) {
        throw new Error(responseData.detail);
    }
    return responseData.message;
}
