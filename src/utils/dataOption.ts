import { extractBVFromUrl } from "./bvParser";
import { API } from "@/api";
import { type SeasonInfo } from "@/types";
import { ElMessageBox } from "element-plus";
import { runWithFeedback } from "./feedback";
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
    const selectedEpisodesStore = useSelectedEpisodesStore();
    const seasonInfosStore = useSeasonInfosStore();
    const contextMenuStore = useContextMenuStore();

    const successMessages: Record<number, string> = {
        1: "观看次数 +1 成功",
        2: "观看次数 -1 成功",
        0: "已标记为部分观看",
    };

    await runWithFeedback(
        async () => {
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
            if (!response.ok) {
                throw new Error(responseData.detail);
            }
            const collection = responseData.data;
            seasonInfosStore.updateSeasonInfo(collection);
            contextMenuStore.hide();
            selectedEpisodesStore.clearSelectedEpisodes();
        },
        {
            success: successMessages[Number(option)],
            error: "更新观看次数失败",
            rethrow: false,
        }
    );
}

export async function refreshCollection(season_id: number): Promise<void> {
    const seasonInfosStore = useSeasonInfosStore();

    await runWithFeedback(
        async () => {
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
            if (!response.ok) {
                throw new Error(responseData.detail);
            }
            const collection = responseData.data;
            seasonInfosStore.updateSeasonInfo(collection);
        },
        {
            success: "合集刷新成功",
            error: "刷新合集失败",
            rethrow: false,
        }
    );
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
        await runWithFeedback(
            async () => {
                const seasonInfosStore = useSeasonInfosStore();
                const apiUrl = `${API.COLLECTION.DELETE}/${season_id}`;
                const response = await fetch(apiUrl.toString(), {
                    method: "DELETE",
                });
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.detail);
                }
                seasonInfosStore.deleteSeasonInfo(season_id);
            },
            {
                success: "删除成功",
                error: "删除失败",
                rethrow: false,
            }
        );
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
        await runWithFeedback(
            async () => {
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
            },
            {
                success: "批量删除成功",
                error: "删除失败",
                rethrow: false,
            }
        );
    } catch (error) {}
}

export async function batchUpdateCollections(
    season_ids: number[]
): Promise<BatchUpdateResult> {
    const seasonInfosStore = useSeasonInfosStore();
    let result: BatchUpdateResult | undefined;

    await runWithFeedback(
        async () => {
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
            const data = responseData.data as BatchUpdateResult;
            result = data;
            data.succeeded.forEach((item: { data: SeasonInfo }) => {
                seasonInfosStore.updateSeasonInfo(item.data);
            });
        },
        {
            error: "批量刷新失败",
        }
    );

    return result as BatchUpdateResult;
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
    let message = "";

    await runWithFeedback(
        async () => {
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
            message = responseData.message;
        },
        {
            error: "同步排序失败",
        }
    );

    return message;
}
