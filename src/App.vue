<template>
    <div class="app-shell">
        <header class="masthead">
            <div class="masthead-inner">
                <div class="brand">
                    <div class="brand-mark" aria-hidden="true">
                        <el-icon :size="18"><VideoPlay /></el-icon>
                    </div>
                    <div class="brand-copy">
                        <strong class="brand-name">BPM</strong>
                        <span class="brand-sub">B站合集进度管理</span>
                    </div>
                </div>
                <div class="masthead-stats">
                    <div class="stat">
                        <span class="stat-value mono">{{ seasonInfosNum }}</span>
                        <span class="stat-label">合集</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value mono">{{ totalEpisodes }}</span>
                        <span class="stat-label">视频</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value mono">{{ watchedEpisodes }}</span>
                        <span class="stat-label">已看完</span>
                    </div>
                    <div class="stat stat-progress">
                        <span class="stat-value mono">{{ progressPercent }}%</span>
                        <span class="stat-label">总进度</span>
                        <div class="stat-track" aria-hidden="true">
                            <i :style="{ width: progressPercent + '%' }"></i>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main class="main">
            <section class="command-deck" aria-label="创建进度">
                <div class="command-bar">
                    <span class="command-icon" aria-hidden="true">
                        <el-icon :size="18"><Link /></el-icon>
                    </span>
                    <el-input
                        v-model.trim="videoUrl"
                        placeholder="粘贴 B 站视频链接，例如 https://www.bilibili.com/video/BV12d4y1G7jT/"
                        size="large"
                        class="url-input"
                        @keyup.enter="createProgress"
                    />
                    <el-button
                        type="primary"
                        size="large"
                        class="create-btn"
                        :loading="isLoading"
                        @click="createProgress"
                    >
                        {{ isLoading ? "创建中" : "创建进度" }}
                    </el-button>
                </div>
            </section>

            <section class="queue-section" aria-label="合集队列">
                <div v-show="seasonInfosNum > 0" class="batch-toolbar queue-toolbar">
                    <div class="queue-heading">
                        <span class="queue-title">合集队列</span>
                        <span class="queue-count mono">{{ seasonInfosNum }} 个合集</span>
                    </div>
                    <div class="queue-actions">
                        <template v-if="!isBatchMode">
                            <el-button class="batch-toggle-btn" @click="toggleBatchMode">
                                批量操作
                            </el-button>
                        </template>
                        <template v-else>
                            <span class="batch-info mono">已选 {{ selectedCount }} 个</span>
                            <el-button
                                class="select-all-btn"
                                plain
                                @click="handleToggleSelectAll"
                            >
                                {{ allSelected ? "取消全选" : "全选" }}
                            </el-button>
                            <el-button
                                plain
                                type="primary"
                                :loading="batchUpdating"
                                :disabled="selectedCount === 0"
                                @click="batchRefresh"
                            >
                                批量刷新
                            </el-button>
                            <el-button
                                plain
                                type="danger"
                                :loading="batchDeleting"
                                :disabled="selectedCount === 0"
                                @click="batchDelete"
                            >
                                批量删除
                            </el-button>
                            <el-button class="batch-toggle-btn" text @click="toggleBatchMode">
                                退出
                            </el-button>
                        </template>
                    </div>
                </div>

                <draggable
                    v-model="seasonInfosStore.seasonInfos"
                    item-key="season_id"
                    ghost-class="ghost"
                    @change="handleDragChange"
                >
                    <template #item="{ element }">
                        <div
                            class="collection-wrapper"
                            :class="{
                                'batch-mode': isBatchMode,
                                'collection-selected': selectedCollectionsStore.isSelected(
                                    element.season_id
                                ),
                            }"
                            @click="handleCollectionRowClick(element.season_id)"
                        >
                            <div class="batch-checkbox-area" @click.stop>
                                <el-checkbox
                                    :model-value="selectedCollectionsStore.isSelected(
                                        element.season_id
                                    )"
                                    @change="selectedCollectionsStore.toggleSelect(
                                        element.season_id
                                    )"
                                />
                            </div>
                            <VideoCollection :metadata="element" />
                        </div>
                    </template>
                </draggable>

                <div v-if="seasonInfosStore.seasonInfosNum === 0" class="empty-placeholder">
                    <div class="empty-art" aria-hidden="true">
                        <svg viewBox="0 0 160 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect
                                x="4"
                                y="4"
                                width="152"
                                height="88"
                                rx="8"
                                stroke="currentColor"
                                stroke-opacity="0.35"
                            />
                            <path
                                d="M24 18h16v12H24zM44 18h16v12H44zM64 18h16v12H64zM84 18h16v12H84zM104 18h16v12H104z"
                                stroke="currentColor"
                                stroke-opacity="0.35"
                            />
                            <rect
                                x="18"
                                y="40"
                                width="42"
                                height="30"
                                rx="4"
                                fill="#ff5d73"
                                fill-opacity="0.16"
                                stroke="#ff5d73"
                                stroke-opacity="0.7"
                            />
                            <path d="M32 46l20 9-20 9z" fill="#ff5d73" />
                            <rect
                                x="70"
                                y="44"
                                width="10"
                                height="22"
                                rx="2"
                                fill="currentColor"
                                fill-opacity="0.22"
                            />
                            <rect
                                x="86"
                                y="44"
                                width="10"
                                height="22"
                                rx="2"
                                fill="currentColor"
                                fill-opacity="0.22"
                            />
                            <rect
                                x="102"
                                y="44"
                                width="10"
                                height="22"
                                rx="2"
                                fill="currentColor"
                                fill-opacity="0.22"
                            />
                            <rect
                                x="118"
                                y="44"
                                width="10"
                                height="22"
                                rx="2"
                                fill="currentColor"
                                fill-opacity="0.22"
                            />
                            <rect
                                x="134"
                                y="44"
                                width="10"
                                height="22"
                                rx="2"
                                fill="currentColor"
                                fill-opacity="0.22"
                            />
                        </svg>
                    </div>
                    <p class="empty-title">队列还是空的</p>
                    <p class="empty-copy">粘贴一个 B 站视频链接，创建第一个进度合集</p>
                </div>
            </section>
        </main>

        <div
            class="context-menu"
            v-show="contextMenuStore.showContextMenu"
            :style="{
                left: contextMenuStore.x + 'px',
                top: contextMenuStore.y + 'px',
            }"
        >
            <div class="context-menu-item" @click.stop="changeWatchedCount(1)">
                <el-icon :size="15"><Plus /></el-icon>
                <span>观看次数 +1</span>
            </div>
            <div class="context-menu-item" @click.stop="changeWatchedCount(2)">
                <el-icon :size="15"><Minus /></el-icon>
                <span>观看次数 -1</span>
            </div>
            <div class="context-menu-item" @click.stop="changeWatchedCount(0)">
                <el-icon :size="15"><VideoPause /></el-icon>
                <span>标记部分观看</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Link, Minus, Plus, VideoPause, VideoPlay } from "@element-plus/icons-vue";
import draggable from "vuedraggable";
import {
    changeWatchedCount,
    updateCollectionOrder,
    batchDeleteCollections,
    batchUpdateCollections,
} from "@/utils/dataOption";
import VideoCollection from "@/components/VideoCollection.vue";
import { useContextMenuStore } from "@/stores/contextMenu";
import { useSelectedEpisodesStore } from "@/stores/selectedEpisodes";
import { useSelectedCollectionsStore } from "@/stores/selectedCollections";
import { useSeasonInfosStore } from "@/stores/seasonInfos";

const contextMenuStore = useContextMenuStore();
const selectedEpisodesStore = useSelectedEpisodesStore();
const selectedCollectionsStore = useSelectedCollectionsStore();
const seasonInfosStore = useSeasonInfosStore();

const seasonInfosNum = computed(() => seasonInfosStore.seasonInfosNum);
const selectedCount = computed(() => selectedCollectionsStore.selectedCount);
const isBatchMode = computed(() => selectedCollectionsStore.isBatchMode);
const allSelected = computed(() => {
    const ids = seasonInfosStore.seasonInfos.map((s) => s.season_id);
    return selectedCollectionsStore.isAllSelected(ids);
});

const totalEpisodes = computed(() =>
    seasonInfosStore.seasonInfos.reduce((sum, item) => sum + item.videos.length, 0)
);
const watchedEpisodes = computed(() =>
    seasonInfosStore.seasonInfos.reduce(
        (sum, item) =>
            sum + item.videos.filter((video) => video.status === "watched").length,
        0
    )
);
const progressPercent = computed(() =>
    totalEpisodes.value === 0
        ? 0
        : Math.round((watchedEpisodes.value / totalEpisodes.value) * 100)
);

const toggleBatchMode = () => {
    selectedCollectionsStore.toggleBatchMode();
};

const handleToggleSelectAll = () => {
    const ids = seasonInfosStore.seasonInfos.map((s) => s.season_id);
    selectedCollectionsStore.toggleSelectAll(ids);
};

const handleCollectionRowClick = (seasonId: number) => {
    if (isBatchMode.value) {
        selectedCollectionsStore.toggleSelect(seasonId);
    }
};

const handleDragChange = async (evt: {
    moved?: { oldIndex: number; newIndex: number };
}) => {
    if (!evt.moved) return;

    const { oldIndex, newIndex } = evt.moved;
    const infos = seasonInfosStore.seasonInfos;

    const minIndex = Math.min(oldIndex, newIndex);
    const maxIndex = Math.max(oldIndex, newIndex);

    const updates = infos.slice(minIndex, maxIndex + 1).map((item, idx) => ({
        season_id: item.season_id,
        order_index: minIndex + idx,
    }));

    try {
        const message = await updateCollectionOrder(updates);
        ElMessage.success(message);
    } catch (error) {
        ElMessage.error(`同步排序失败: ${(error as Error).message}`);
        await seasonInfosStore.getAllSessonInfos();
    }
};

onMounted(async () => {
    try {
        seasonInfosStore.getAllSessonInfos();
    } catch (error) {
        ElMessage.error(`获取视频信息失败: ${(error as Error).message}`);
    }

    document.addEventListener("click", handlePageClick, true);
    document.addEventListener("scroll", handlePageScroll, true);
});

const videoUrl = ref("");
const isLoading = ref(false);

const createProgress = async () => {
    if (!videoUrl.value) {
        ElMessage.error("请输入视频链接");
        return;
    }

    isLoading.value = true;

    try {
        await seasonInfosStore.addOneSeasonInfo(videoUrl.value);
        ElMessage.success("视频信息获取成功");
    } catch (error) {
        ElMessage.error(`获取视频信息失败: ${(error as Error).message}`);
    } finally {
        videoUrl.value = "";
        isLoading.value = false;
    }
};

const batchUpdating = ref(false);
const batchDeleting = ref(false);

const batchRefresh = async () => {
    const ids = Array.from(selectedCollectionsStore.selectedIds);
    batchUpdating.value = true;
    try {
        const result = await batchUpdateCollections(ids);
        ElMessage.success(
            `批量刷新完成：成功 ${result.succeeded.length} 个，失败 ${result.failed.length} 个`
        );
    } catch (error) {
        ElMessage.error(`批量刷新失败: ${(error as Error).message}`);
    } finally {
        batchUpdating.value = false;
        selectedCollectionsStore.clearSelection();
    }
};

const batchDelete = async () => {
    const ids = Array.from(selectedCollectionsStore.selectedIds);
    batchDeleting.value = true;
    try {
        await batchDeleteCollections(ids);
    } catch (error) {
        ElMessage.error(`批量删除失败: ${(error as Error).message}`);
    } finally {
        batchDeleting.value = false;
        selectedCollectionsStore.clearSelection();
    }
};

const handlePageClick = (event: MouseEvent) => {
    if (contextMenuStore.showContextMenu) {
        const contextMenu = document.querySelector(".context-menu");
        if (contextMenu && !contextMenu.contains(event.target as Node)) {
            contextMenuStore.hide();
            event.stopImmediatePropagation();
        }
        return;
    }

    const isClickOnEpisodeItem = (event.target as Element).closest(".episode-item");

    if (!isClickOnEpisodeItem) {
        selectedEpisodesStore.clearSelectedEpisodes();
    }

    const isClickOnCollectionCard = (event.target as Element).closest(
        ".collection-card"
    );
    const isClickOnBatchToolbar = (event.target as Element).closest(
        ".batch-toolbar"
    );
    const isClickOnCollectionWrapper = (event.target as Element).closest(
        ".collection-wrapper"
    );
    if (
        !isClickOnCollectionCard &&
        !isClickOnBatchToolbar &&
        !isClickOnCollectionWrapper
    ) {
        if (!selectedCollectionsStore.isBatchMode) {
            selectedCollectionsStore.clearSelection();
        }
    }
};

const handlePageScroll = () => {
    if (contextMenuStore.showContextMenu) {
        contextMenuStore.hide();
    }
};

onUnmounted(() => {
    document.removeEventListener("click", handlePageClick, true);
    document.removeEventListener("scroll", handlePageScroll, true);
});
</script>

<style scoped lang="scss">
$bg-deep: var(--bpm-bg);
$bg-panel: var(--bpm-panel);
$bg-panel-2: var(--bpm-panel-2);
$line: var(--bpm-line);
$line-strong: var(--bpm-line-strong);
$text-hi: var(--bpm-text-hi);
$text-mid: var(--bpm-text-mid);
$text-low: var(--bpm-text-low);
$coral: var(--bpm-coral);
$coral-deep: var(--bpm-coral-deep);
$amber: var(--bpm-amber);

.app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main {
    flex: 1;
}

.masthead {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255, 255, 255, 0.86);
    backdrop-filter: blur(16px) saturate(1.2);
    -webkit-backdrop-filter: blur(16px) saturate(1.2);
    border-bottom: 1px solid $line;

    .masthead-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
    }

    .brand-mark {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        color: #14090c;
        background: linear-gradient(135deg, $coral, #ff8b6b);
        box-shadow: 0 6px 18px rgba(255, 93, 115, 0.35);
        flex-shrink: 0;
    }

    .brand-copy {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
    }

    .brand-name {
        font-size: 15px;
        font-weight: 800;
        color: $text-hi;
    }

    .brand-sub {
        font-size: 11px;
        color: $text-low;
    }

    .masthead-stats {
        display: flex;
        align-items: stretch;
        gap: 26px;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        min-width: 44px;
    }

    .stat-value {
        font-size: 17px;
        font-weight: 700;
        color: $text-hi;
        line-height: 1.1;
    }

    .stat-label {
        font-size: 11px;
        color: $text-low;
        margin-top: 3px;
    }

    .stat-progress {
        position: relative;
    }

    .stat-track {
        width: 64px;
        height: 3px;
        border-radius: 2px;
        background: rgba(15, 23, 42, 0.08);
        margin-top: 8px;
        overflow: hidden;

        i {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, $coral, $amber);
        }
    }
}

.command-deck {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 30px 24px 6px;
    box-sizing: border-box;
}

.command-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 8px 8px 16px;
    background: $bg-panel;
    border: 1px solid $line-strong;
    border-radius: 14px;
    box-shadow:
        0 18px 50px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus-within {
        border-color: rgba(255, 93, 115, 0.55);
        box-shadow:
            0 18px 50px rgba(15, 23, 42, 0.08),
            0 0 0 3px rgba(255, 93, 115, 0.12);
    }

    .command-icon {
        color: $coral-deep;
        display: grid;
        place-items: center;
        flex-shrink: 0;
    }

    .url-input {
        flex: 1;
        min-width: 0;

        :deep(.el-input__wrapper) {
            background: transparent;
            box-shadow: none;
            padding: 0;
        }

        :deep(.el-input__inner) {
            font-size: 15px;
            height: 42px;
        }
    }

    .create-btn {
        min-width: 132px;
        height: 44px;
        border-radius: 10px;
    }
}

.queue-section {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 24px 24px 56px;
    box-sizing: border-box;
}

.batch-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-bottom: 14px;
    margin-bottom: 16px;
    border-bottom: 1px solid $line;
    flex-wrap: wrap;

    .queue-heading {
        display: flex;
        align-items: baseline;
        gap: 10px;
    }

    .queue-title {
        font-size: 18px;
        font-weight: 800;
        color: $text-hi;
    }

    .queue-count {
        font-size: 12px;
        color: $text-low;
    }

    .queue-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .batch-info {
        font-size: 12px;
        color: $coral-deep;
        font-weight: 600;
        padding: 0 4px;
    }
}

.collection-wrapper {
    position: relative;
    margin-bottom: 14px;
    animation: riseIn 0.32s ease both;
    transition: transform 0.2s ease, opacity 0.2s ease;

    &.ghost {
        opacity: 0.45;

        :deep(.collection-card) {
            border-style: dashed;
            border-color: $coral;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
        }
    }

    &.batch-mode {
        cursor: pointer;

        :deep(.drag-handle) {
            display: none;
        }

        :deep(.collection-header) {
            padding-left: 54px;
        }
    }

    &.collection-selected {
        :deep(.collection-card) {
            border-color: $coral;
            box-shadow:
                0 0 0 1px rgba(255, 93, 115, 0.5),
                0 16px 44px rgba(255, 93, 115, 0.12);
        }
    }
}

.batch-checkbox-area {
    position: absolute;
    left: 14px;
    top: 13px;
    z-index: 6;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: #ffffff;
    border: 1px solid $line-strong;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    visibility: hidden;
    opacity: 0;
    transform: translateY(-4px) scale(0.92);
    transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
}

.collection-wrapper.batch-mode .batch-checkbox-area {
    visibility: visible;
    opacity: 1;
    transform: translateY(0) scale(1);
}

.empty-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 72px 24px 96px;
    border: 1px dashed $line-strong;
    border-radius: 14px;
    background: #ffffff;

    .empty-art {
        width: 150px;
        height: 96px;
        color: $text-low;
        margin-bottom: 22px;

        svg {
            width: 100%;
            height: 100%;
        }
    }

    .empty-title {
        font-size: 17px;
        font-weight: 700;
        color: $text-mid;
        margin: 0 0 8px;
    }

    .empty-copy {
        font-size: 13px;
        color: $text-low;
        margin: 0;
    }
}

.context-menu {
    position: fixed;
    z-index: 9999;
    min-width: 196px;
    padding: 6px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid $line-strong;
    border-radius: 12px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    animation: popIn 0.16s ease both;

    .context-menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        color: $text-mid;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s ease, color 0.15s ease;

        &:hover {
            background: rgba(255, 93, 115, 0.12);
            color: $text-hi;
        }

        &:not(:last-child) {
            margin-bottom: 2px;
        }
    }
}

@keyframes riseIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.96) translateY(-4px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@media (max-width: 900px) {
    .masthead-stats {
        gap: 18px;
    }

    .stat-progress {
        display: none;
    }
}

@media (max-width: 720px) {
    .masthead-inner {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        padding: 12px 16px;
    }

    .masthead-stats {
        justify-content: space-between;
        gap: 10px;
    }

    .stat {
        align-items: flex-start;
        min-width: 0;
    }

    .command-deck {
        padding: 20px 16px 4px;
    }

    .command-bar {
        flex-direction: column;
        align-items: stretch;
        padding: 12px;
        gap: 12px;
    }

    .create-btn {
        width: 100%;
    }

    .queue-section {
        padding: 18px 16px 40px;
    }

    .queue-toolbar {
        flex-direction: column;
        align-items: flex-start;
    }

    .queue-actions {
        width: 100%;
    }
}
</style>
