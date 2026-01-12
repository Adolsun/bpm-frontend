<template>
    <el-card class="collection-card" :class="{ expanded: isExpanded }">
        <!-- 标题栏 -->
        <div class="collection-header">
            <h3 class="collection-title">
                {{ metadata.title }} ({{ metadata.total_episodes }}集)
            </h3>
            <div class="header-buttons">
                <el-button
                    class="delete-btn"
                    text
                    :icon="Delete"
                    @click.stop="deleteCollection(metadata.season_id)"
                />
                <el-button
                    class="refresh-btn"
                    text
                    :icon="Refresh"
                    @click.stop="refreshCollection(metadata.season_id)"
                />
                <el-button
                    class="expand-btn"
                    text
                    :icon="isExpanded ? ArrowDown : ArrowUp"
                    @click="toggleExpand"
                >
                    {{ isExpanded ? "收起" : "展开" }}
                </el-button>
            </div>
        </div>

        <!-- 展开内容区域 -->
        <div class="collection-content" :class="{ 'is-hidden': !isExpanded }">
            <div class="episodes-grid">
                <div
                    v-for="episode in metadata.videos"
                    :key="episode.bvid"
                    class="episode-item"
                    :class="{
                        'status-watched': episode.status === 'watched',
                        'status-partially-watched':
                            episode.status === 'partially_watched',
                        'status-not-watched': episode.status === 'not_watched',
                        selected: selectedEpisodesStore.isSelected(episode),
                    }"
                    :title="episode.title"
                    @click.stop="selectEpisode(episode, $event)"
                    @mousedown.prevent.stop="handleAuxClick(episode, $event)"
                    @contextmenu.prevent.stop="showContextMenu(episode, $event)"
                >
                    <div class="episode-info">
                        <span class="episode-title">{{
                            truncateTitle(episode.title, 10)
                        }}</span>
                        <span class="episode-duration">{{
                            formatSecondsToHMS(episode.duration)
                        }}</span>
                    </div>
                    <div
                        v-if="episode.status === 'watched'"
                        class="watched-count-badge"
                    >
                        {{ episode.watched_count }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 元数据信息栏 -->
        <div class="collection-meta">
            <div class="meta-left">来自：{{ metadata.up_name }}</div>
            <div class="meta-right">
                创建时间: {{ formatDate(metadata.created_at) }} | 最后修改:{{
                    formatDate(metadata.updated_at)
                }}
                | 同步时间:{{ formatDate(metadata.last_sync_at) }}
            </div>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { formatSecondsToHMS, formatDate } from "@/utils/timeUtils";
import type { Episode, SeasonInfo } from "@/types";

import { ArrowDown, ArrowUp, Refresh, Delete } from "@element-plus/icons-vue";
import { useSelectedEpisodesStore } from "@/stores/selectedEpisodes";
import { useContextMenuStore } from "@/stores/contextMenu";
import { refreshCollection, deleteCollection } from "@/utils/dataOption";

// 定义组件props
interface Props {
    metadata: Omit<SeasonInfo, "order_index">;
}

const props = defineProps<Props>();

const selectedEpisodesStore = useSelectedEpisodesStore();

// 展开/收起状态
const isExpanded = ref(false);

// 右键菜单
const contextMenuStore = useContextMenuStore();

// 触发菜单
const showContextMenu = (episode: Episode, event: MouseEvent) => {
    if (
        selectedEpisodesStore.isSameCollection(episode) &&
        selectedEpisodesStore.isSelected(episode)
    ) {
        contextMenuStore.show(event.clientX, event.clientY);
        return;
    }
    selectedEpisodesStore.singleSelect(episode);
    selectedEpisodesStore.updateLastClickedEpisode(episode);
    contextMenuStore.show(event.clientX, event.clientY);
};

// 刷新合集函数
// const refreshCollection = () => {
//     // 函数逻辑暂时略过
//     console.log("刷新合集:");
// };

// 切换展开/收起状态
const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
};

// 选择视频
const selectEpisode = (episode: Episode, event?: MouseEvent) => {
    // 检查是否按下了Shift键
    if (event && event.shiftKey && selectedEpisodesStore.lastClickedEpisode) {
        if (selectedEpisodesStore.isSameCollection(episode)) {
            // 两个视频都在同一个合集中，执行连续选择
            handleShiftSelect(episode);
        } else {
            // 如果视频不在同一个合集中，清空已选择的视频，只选中当前点击的视频
            handleSingleSelect(episode);
        }
    } else if (event && event.ctrlKey) {
        if (selectedEpisodesStore.isSameCollection(episode)) {
            // 两个视频都在同一个合集中，执行非连续选择
            handleCtrlSelect(episode);
        } else {
            handleSingleSelect(episode);
        }
    } else {
        // 普通点击，重新选中当前点击的视频（清除其他选中状态）
        handleSingleSelect(episode);
    }
    // 更新最后点击的视频
    selectedEpisodesStore.updateLastClickedEpisode(episode);
};

// 处理Ctrl+左键单击（增加选中当前视频）
const handleCtrlSelect = (episode: Episode) => {
    // console.log(selectedEpisodesStore.isSelected(episode));
    // Ctrl+点击，增加选中当前视频（如果尚未选中）
    if (!selectedEpisodesStore.isSelected(episode)) {
        selectedEpisodesStore.addSelectedEpisode(episode);
    }
    // console.log(selectedEpisodesStore.selectedEpisodes);
    // 如果已选中，则不做任何处理
};

// 处理普通单个选择（清除其他选中状态，只选中当前视频）
const handleSingleSelect = (episode: Episode) => {
    // 清空当前选中列表，只选中当前视频
    selectedEpisodesStore.singleSelect(episode);
    // console.log(selectedEpisodesStore.selectedEpisodes);
};

// 处理Shift连续选择
const handleShiftSelect = (currentEpisode: Episode) => {
    // if (!selectedEpisodesStore.lastClickedEpisode) return;

    // 获取当前合集中的所有视频
    const allEpisodes = props.metadata.videos;

    // 找到两个视频的索引
    const lastIndex = allEpisodes.findIndex(
        (e) => e.bvid === selectedEpisodesStore.lastClickedEpisode!.bvid
    );
    const currentIndex = allEpisodes.findIndex(
        (e) => e.bvid === currentEpisode.bvid
    );

    if (lastIndex === -1 || currentIndex === -1) return;

    // 确定范围（包含边界）
    const startIndex = Math.min(lastIndex, currentIndex);
    const endIndex = Math.max(lastIndex, currentIndex);

    // 获取范围内的所有视频
    const episodesInRange = allEpisodes.slice(startIndex, endIndex + 1);

    // 清空当前选中列表，然后选中范围内的视频
    selectedEpisodesStore.multiSelect(episodesInRange);
};

// let clickTimer = null;
// 导航到视频链接
const navigateToVideo = (bvid: string) => {
    // console.log("导航到视频:", bvid);
    window.open(`https://b23.tv/${bvid}`, "_blank");
    // selectedEpisodesStore.updateLastClickedEpisode(currentEpisode);
};

// 处理鼠标中键点击事件
const handleAuxClick = (episode: Episode, event: MouseEvent) => {
    // 检查是否是中键点击 (button值为1表示中键)
    if (event.button === 1) {
        navigateToVideo(episode.bvid);
    }
};

// 截断标题函数
const truncateTitle = (title: string, maxLength: number) => {
    if (!title) return "";
    return title.length > maxLength
        ? title.substring(0, maxLength) + "..."
        : title;
};
</script>

<style scoped lang="scss">
$primary-color: #409eff;
$primary-light: #ecf5ff;
$success-color: #4caf50;
$success-light: #e8f5e9;
$warning-color: #8bc34a;
$text-primary: #303133;
$text-secondary: #909399;
$text-meta: #606266;
$border-color: #e4e7ed;
$border-light: #ebeef5;
$bg-light: #f5f5f5;
$bg-lighter: #fafafa;
$shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
$expanded-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

.collection-card {
    margin: 10px 0;
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
    width: 100%;
    box-sizing: border-box;

    &:not(.expanded) {
        box-shadow: $shadow;
    }

    &.expanded {
        box-shadow: $expanded-shadow;
    }

    .collection-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: $bg-light;
        flex-wrap: nowrap;
    }

    .collection-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .header-buttons {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .expand-btn {
        font-size: 14px;
        color: $text-secondary;

        &:focus {
            outline: none;
        }
    }

    .refresh-btn {
        font-size: 14px;
        color: $text-secondary;

        &:focus {
            outline: none;
        }
    }

    .collection-content {
        padding: 16px;
        width: 100%;
        box-sizing: border-box;
        max-height: calc(
            3 * (60px + 12px)
        ); // 3行视频的高度，每行视频约60px高，gap为12px
        overflow-y: auto; // 当内容超过最大高度时显示滚动条
        /* 始终预留滚动条空间，防止内容跳动 */
        scrollbar-gutter: stable; /* 确保滚动条空间始终预留 */
        scrollbar-width: thin; /* Firefox */

        &::-webkit-scrollbar {
            width: 12px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
        }

        &.is-hidden {
            max-height: 0;
            overflow: hidden;
            padding-top: 0;
            padding-bottom: 0;

            .episodes-grid {
                max-height: 0;
                overflow: hidden;
            }
        }
    }

    .episodes-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
    }

    .episode-item {
        padding: 12px;
        border: 1px solid $border-color;
        border-radius: 6px;
        background-color: $bg-lighter;
        transition: all 0.2s ease;
        cursor: pointer;
        position: relative;

        &:hover {
            border-color: $primary-color;
            background-color: $primary-light;
            transform: translateY(-2px);
        }

        &.status-watched {
            background-color: $success-light;
            border-color: $success-color;
        }

        &.status-partially-watched {
            background: linear-gradient(
                to right,
                $success-light 50%,
                $bg-lighter 50%
            );
            border-color: $warning-color;
        }

        &.selected {
            // border-color: #984f31 !important; /* 黄色系边框 */
            box-shadow: 0 0 10px 3px rgba(238, 121, 89, 0.6); /* 黄色系阴影 */
            position: relative;
            z-index: 1;

            // &.status-partially-watched {
            // border-color: #984f31 !important;
            // }

            // &.status-watched {
            // border-color: #984f31 !important;
            // }

            // &.status-not-watched {
            // border-color: #984f31 !important;
            // }
        }

        .episode-info {
            display: flex;
            flex-direction: column;
        }

        .episode-title {
            font-size: 14px;
            color: $text-primary;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            user-select: none;
        }

        .episode-duration {
            font-size: 12px;
            color: $text-secondary;
            user-select: none;
        }

        .watched-count-badge {
            position: absolute;
            top: 2px;
            right: 2px;
            color: $primary-color;
            font-size: 10px;
            font-weight: bold;
            z-index: 1;
            // border-radius: 8px;
            padding: 1px 4px;
            line-height: 1;
            user-select: none;
        }
    }

    .collection-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background-color: #f9f9f9;
        border: 1px solid $border-light;
        border-top: none;
        border-radius: 0 0 8px 8px;
        font-size: 12px;
        color: $text-meta;

        .meta-left {
            text-align: left;
            flex: 1 1 auto;
        }

        .meta-right {
            text-align: right;
            flex: 1 1 auto;
            user-select: none;
        }
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .episodes-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .collection-meta {
        flex-direction: column;
        gap: 4px;
        text-align: center;
    }

    .meta-left,
    .meta-right {
        text-align: center;
        width: 100%;
    }
}
</style>
