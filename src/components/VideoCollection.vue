<template>
    <section
        class="collection-card"
        :class="{
            expanded: isExpanded,
        }"
    >
        <header class="collection-header">
            <div class="header-left">
                <el-icon class="drag-handle" :size="18"><Rank /></el-icon>
                <div class="title-block">
                    <h3 class="collection-title" :title="metadata.title">
                        {{ metadata.title }}
                    </h3>
                    <div class="title-meta">
                        <span class="chip">
                            <el-icon :size="12"><VideoPlay /></el-icon>
                            {{ metadata.total_episodes }} 集
                        </span>
                        <span class="chip chip-up">{{ metadata.up_name }}</span>
                    </div>
                </div>
            </div>
            <div class="header-buttons">
                    <el-button
                        class="refresh-btn"
                        text
                        :icon="Refresh"
                        aria-label="刷新合集"
                        @click.stop="refreshCollection(metadata.season_id)"
                    />
                    <el-button
                        class="delete-btn"
                        text
                        :icon="Delete"
                        aria-label="删除合集"
                        @click.stop="deleteCollection(metadata.season_id)"
                    />
                <el-button
                    class="expand-btn"
                    text
                    :icon="isExpanded ? ArrowUp : ArrowDown"
                    @click="toggleExpand"
                >
                    {{ isExpanded ? "收起" : "展开" }}
                </el-button>
            </div>
        </header>

        <div class="ledger-row">
            <div class="ledger" :title="`已看 ${watchedCount} / ${totalVideos}`">
                <span
                    v-for="(tick, index) in ledgerTicks"
                    :key="index"
                    class="ledger-tick"
                    :class="`tick-${tick}`"
                ></span>
            </div>
            <div class="ledger-readout">
                <span class="ledger-percent mono">{{ watchedPercent }}%</span>
                <span class="ledger-caption">已看 {{ watchedCount }} / {{ totalVideos }}</span>
            </div>
        </div>

        <div class="collection-content" :class="{ 'is-hidden': !isExpanded }">
            <div class="episodes-grid">
                <div
                    v-for="(episode, index) in metadata.videos"
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
                    <div class="episode-top">
                        <span class="episode-index mono">{{
                            String(index + 1).padStart(2, "0")
                        }}</span>
                        <span
                            v-if="episode.watched_count > 0"
                            class="watched-count-badge mono"
                        >
                            ×{{ episode.watched_count }}
                        </span>
                    </div>
                    <p class="episode-title">{{ episode.title }}</p>
                    <div class="episode-foot">
                        <span class="episode-duration mono">{{
                            formatSecondsToHMS(episode.duration)
                        }}</span>
                        <span class="episode-status">{{ statusLabel(episode.status) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <footer class="collection-meta">
            <div class="meta-left">来自 <strong>{{ metadata.up_name }}</strong></div>
            <div class="meta-right mono">
                创建 {{ formatDate(metadata.created_at) }} · 更新 {{
                    formatDate(metadata.updated_at)
                }} · 同步 {{ formatDate(metadata.last_sync_at) }}
            </div>
        </footer>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { formatSecondsToHMS, formatDate } from "@/utils/timeUtils";
import type { Episode, SeasonInfo } from "@/types";

import {
    ArrowDown,
    ArrowUp,
    Refresh,
    Delete,
    Rank,
    VideoPlay,
} from "@element-plus/icons-vue";
import { useSelectedEpisodesStore } from "@/stores/selectedEpisodes";
import { useContextMenuStore } from "@/stores/contextMenu";
import { refreshCollection, deleteCollection } from "@/utils/dataOption";

interface Props {
    metadata: Omit<SeasonInfo, "order_index">;
}

const props = defineProps<Props>();

const selectedEpisodesStore = useSelectedEpisodesStore();

const isExpanded = ref(false);

const contextMenuStore = useContextMenuStore();

const totalVideos = computed(() => props.metadata.videos.length);
const watchedCount = computed(
    () =>
        props.metadata.videos.filter((video) => video.status === "watched").length
);
const watchedPercent = computed(() =>
    totalVideos.value === 0
        ? 0
        : Math.round((watchedCount.value / totalVideos.value) * 100)
);
const ledgerTicks = computed<string[]>(() => {
    const videos = props.metadata.videos;
    const maxTicks = 128;

    if (videos.length <= maxTicks) {
        return videos.map((video) => video.status);
    }

    const chunkSize = Math.ceil(videos.length / maxTicks);
    const ticks: string[] = [];

    for (let i = 0; i < videos.length; i += chunkSize) {
        const chunk = videos.slice(i, i + chunkSize);
        const watched = chunk.filter(
            (video) => video.status === "watched"
        ).length;
        const partial = chunk.filter(
            (video) => video.status === "partially_watched"
        ).length;
        let status = "not_watched";
        if (watched === chunk.length) {
            status = "watched";
        } else if (watched > 0 || partial > 0) {
            status = "partially_watched";
        }
        ticks.push(status);
    }

    return ticks;
});

const statusLabel = (status: string): string => {
    if (status === "watched") return "已看完";
    if (status === "partially_watched") return "部分观看";
    return "未观看";
};

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

const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
};

const selectEpisode = (episode: Episode, event?: MouseEvent) => {
    if (event && event.shiftKey && selectedEpisodesStore.lastClickedEpisode) {
        if (selectedEpisodesStore.isSameCollection(episode)) {
            handleShiftSelect(episode);
        } else {
            handleSingleSelect(episode);
        }
    } else if (event && event.ctrlKey) {
        if (selectedEpisodesStore.isSameCollection(episode)) {
            handleCtrlSelect(episode);
        } else {
            handleSingleSelect(episode);
        }
    } else {
        handleSingleSelect(episode);
    }
    selectedEpisodesStore.updateLastClickedEpisode(episode);
};

const handleCtrlSelect = (episode: Episode) => {
    if (!selectedEpisodesStore.isSelected(episode)) {
        selectedEpisodesStore.addSelectedEpisode(episode);
    }
};

const handleSingleSelect = (episode: Episode) => {
    selectedEpisodesStore.singleSelect(episode);
};

const handleShiftSelect = (currentEpisode: Episode) => {
    const allEpisodes = props.metadata.videos;

    const lastIndex = allEpisodes.findIndex(
        (e) => e.bvid === selectedEpisodesStore.lastClickedEpisode!.bvid
    );
    const currentIndex = allEpisodes.findIndex(
        (e) => e.bvid === currentEpisode.bvid
    );

    if (lastIndex === -1 || currentIndex === -1) return;

    const startIndex = Math.min(lastIndex, currentIndex);
    const endIndex = Math.max(lastIndex, currentIndex);

    const episodesInRange = allEpisodes.slice(startIndex, endIndex + 1);

    selectedEpisodesStore.multiSelect(episodesInRange);
};

const navigateToVideo = (bvid: string) => {
    window.open(`https://b23.tv/${bvid}`, "_blank");
};

const handleAuxClick = (episode: Episode, event: MouseEvent) => {
    if (event.button === 1) {
        navigateToVideo(episode.bvid);
    }
};
</script>

<style scoped lang="scss">
$bg-panel: var(--bpm-panel);
$line: var(--bpm-line);
$line-strong: var(--bpm-line-strong);
$text-hi: var(--bpm-text-hi);
$text-mid: var(--bpm-text-mid);
$text-low: var(--bpm-text-low);
$coral: var(--bpm-coral);
$coral-deep: var(--bpm-coral-deep);
$amber: var(--bpm-amber);
$green: var(--bpm-green);

.collection-card {
    width: 100%;
    box-sizing: border-box;
    background: $bg-panel;
    border: 1px solid $line;
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.22s ease, box-shadow 0.22s ease;

    &:not(.expanded) {
        box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
    }

    &.expanded {
        box-shadow:
            0 22px 60px rgba(15, 23, 42, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
        border-color: $line-strong;
    }

    .collection-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        border-bottom: 1px solid $line;
        background: rgba(15, 23, 42, 0.015);
        flex-wrap: nowrap;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
    }

    .drag-handle {
        cursor: grab;
        color: $text-low;
        font-size: 18px;
        flex-shrink: 0;
        transition: color 0.16s ease;

        &:hover {
            color: $coral-deep;
        }
    }

    .title-block {
        min-width: 0;
        flex: 1;
    }

    .collection-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: $text-hi;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.4;
    }

    .title-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        flex-wrap: wrap;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 7px;
        border-radius: 6px;
        font-size: 11px;
        color: $text-mid;
        background: rgba(15, 23, 42, 0.045);
        border: 1px solid rgba(15, 23, 42, 0.08);
        line-height: 1.5;

        .el-icon {
            color: $coral-deep;
        }
    }

    .chip-up {
        color: $text-low;
    }

    .header-buttons {
        display: flex;
        gap: 2px;
        align-items: center;
        flex-shrink: 0;
    }

    .refresh-btn,
    .delete-btn {
        font-size: 16px;
        color: $text-low;
        padding: 8px;

        &:hover {
            color: $coral-deep;
        }
    }

    .delete-btn:hover {
        color: #d63a52;
    }

    .expand-btn {
        font-size: 13px;
        color: $text-mid;
        font-weight: 600;
        padding: 8px 10px;

        &:hover {
            color: $text-hi;
        }
    }

    .ledger-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        border-bottom: 1px solid $line;
    }

    .ledger {
        flex: 1;
        min-width: 0;
        height: 8px;
        display: flex;
        gap: 2px;
        align-items: stretch;
    }

    .ledger-tick {
        flex: 1 1 0;
        min-width: 1px;
        border-radius: 1.5px;
        background: rgba(15, 23, 42, 0.1);
        transition: filter 0.16s ease, background 0.16s ease;

        &.tick-watched {
            background: $green;
        }

        &.tick-partially_watched {
            background: $amber;
        }

        &:hover {
            filter: brightness(1.15);
        }
    }

    .ledger-readout {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-shrink: 0;
    }

    .ledger-percent {
        font-size: 15px;
        font-weight: 700;
        color: $coral-deep;
    }

    .ledger-caption {
        font-size: 11px;
        color: $text-low;
        white-space: nowrap;
    }

    .collection-content {
        padding: 16px;
        width: 100%;
        box-sizing: border-box;
        max-height: calc(3 * (116px + 10px));
        overflow-y: auto;
        scrollbar-gutter: stable;
        scrollbar-width: thin;
        transition: max-height 0.28s ease, padding 0.28s ease;

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
        grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
    }

    .episode-item {
        position: relative;
        padding: 12px;
        border: 1px solid rgba(15, 23, 42, 0.12);
        border-radius: 8px;
        background: #f8fafd;
        cursor: pointer;
        transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease,
            box-shadow 0.18s ease;

        &:hover {
            transform: translateY(-2px);
            border-color: rgba(15, 23, 42, 0.28);
        }

        &.status-watched {
            background: rgba(35, 154, 107, 0.08);
            border-color: rgba(35, 154, 107, 0.38);

            &:hover {
                border-color: rgba(35, 154, 107, 0.68);
            }
        }

        &.status-partially-watched {
            background: rgba(227, 154, 43, 0.1);
            border-color: rgba(227, 154, 43, 0.42);

            &:hover {
                border-color: rgba(227, 154, 43, 0.72);
            }
        }

        &.selected {
            border-color: $coral;
            box-shadow:
                0 0 0 2px rgba(255, 93, 115, 0.22),
                0 10px 24px rgba(15, 23, 42, 0.08);
            z-index: 1;
        }
    }

    .episode-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .episode-index {
        font-size: 11px;
        color: $text-low;
        user-select: none;
    }

    .watched-count-badge {
        color: $coral-deep;
        font-size: 11px;
        font-weight: 700;
        user-select: none;
    }

    .episode-title {
        margin: 8px 0 10px;
        font-size: 13px;
        line-height: 1.45;
        color: $text-hi;
        min-height: 2.9em;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        user-select: none;
    }

    .episode-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .episode-duration {
        font-size: 11px;
        color: $text-low;
        user-select: none;
    }

    .episode-status {
        font-size: 11px;
        font-weight: 600;
        color: $text-low;
        user-select: none;
    }

    .status-watched .episode-status {
        color: $green;
    }

    .status-partially-watched .episode-status {
        color: #b97b14;
    }

    .collection-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        padding: 10px 16px;
        background: rgba(15, 23, 42, 0.02);
        border-top: 1px solid $line;
        font-size: 11px;
        color: $text-low;

        strong {
            color: $text-mid;
            font-weight: 600;
        }
    }

    .meta-left {
        text-align: left;
        flex: 1 1 auto;
    }

    .meta-right {
        text-align: right;
        flex: 1 1 auto;
        user-select: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

@media (max-width: 900px) {
    .episodes-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
}

@media (max-width: 720px) {
    .collection-header {
        flex-wrap: wrap;
        align-items: flex-start;
    }

    .header-buttons {
        margin-left: auto;
    }

    .episodes-grid {
        grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
        gap: 8px;
    }

    .ledger-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .ledger-readout {
        justify-content: space-between;
    }

    .collection-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .meta-left,
    .meta-right {
        text-align: left;
        width: 100%;
    }
}
</style>
