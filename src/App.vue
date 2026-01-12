<template>
    <div class="container">
        <div class="input-section">
            <h1>B站视频进度管理</h1>
            <div class="input-group">
                <el-input
                    v-model.trim="videoUrl"
                    placeholder="请输入B站视频链接，例如：https://www.bilibili.com/video/BV12d4y1G7jT/"
                    size="large"
                    class="url-input"
                    @keyup.enter="createProgress"
                />
                <el-button
                    type="primary"
                    size="large"
                    @click="createProgress"
                    :loading="isLoading"
                    class="create-btn"
                >
                    {{ isLoading ? "加载中..." : "创建进度" }}
                </el-button>
            </div>
        </div>

        <div class="collections-container">
            <!-- 视频合集列表 -->
            <div
                v-for="collection in seasonInfosStore.seasonInfos"
                :key="collection.season_id"
                class="collection-wrapper"
            >
                <VideoCollection :metadata="collection" />
            </div>

            <!-- 当没有合集时的提示 -->
            <div
                v-if="seasonInfosStore.seasonInfosNum === 0"
                class="empty-placeholder"
            >
                <p>暂无视频合集，请在上方输入B站视频链接创建进度</p>
            </div>
        </div>
    </div>
    <div
        class="context-menu"
        v-show="contextMenuStore.showContextMenu"
        :style="{
            left: contextMenuStore.x + 'px',
            top: contextMenuStore.y + 'px',
        }"
    >
        <div class="context-menu-item" @click.stop="changeWatchedCount(1)">
            观看次数+1
        </div>
        <div class="context-menu-item" @click.stop="changeWatchedCount(2)">
            观看次数-1
        </div>
        <div class="context-menu-item" @click.stop="changeWatchedCount(0)">
            部分观看
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { changeWatchedCount } from "@/utils/dataOption";
import VideoCollection from "@/components/VideoCollection.vue";
import { useContextMenuStore } from "@/stores/contextMenu";
import { useSelectedEpisodesStore } from "@/stores/selectedEpisodes";
import { useSeasonInfosStore } from "@/stores/seasonInfos";

// 右键菜单
const contextMenuStore = useContextMenuStore();

const selectedEpisodesStore = useSelectedEpisodesStore();
const seasonInfosStore = useSeasonInfosStore();

onMounted(async () => {
    try {
        // console.log("开始获取视频信息...");
        seasonInfosStore.getAllSessonInfos();
    } catch (error) {
        ElMessage.error(`获取视频信息失败: ${(error as Error).message}`);
    }
});

// 输入的视频链接
const videoUrl = ref("");

// 添加加载状态
const isLoading = ref(false);

// 创建进度（获取视频信息并添加到列表）
const createProgress = async () => {
    if (!videoUrl.value) {
        ElMessage.error("请输入视频链接");
        return;
    }

    isLoading.value = true;

    try {
        await seasonInfosStore.addOneSeasonInfo(videoUrl.value);

        ElMessage.success("视频信息获取成功！");
    } catch (error) {
        ElMessage.error(`获取视频信息失败: ${(error as Error).message}`);
    } finally {
        videoUrl.value = "";
        isLoading.value = false;
    }
};

// 处理页面点击事件（用于取消选中）
const handlePageClick = (event: MouseEvent) => {
    // 检查右键菜单是否显示
    if (contextMenuStore.showContextMenu) {
        // 如果菜单显示且点击在菜单外部，则只隐藏菜单，阻止事件继续传播
        const contextMenu = document.querySelector(".context-menu");
        if (contextMenu && !contextMenu.contains(event.target as Node)) {
            contextMenuStore.hide();
            event.stopImmediatePropagation(); // 阻止事件继续传播到其他监听器
        }
        return; // 如果菜单显示，不执行后续的取消选中逻辑
    }
    // console.log("页面点击:");

    // 检查点击的元素是否是视频项目或其子元素
    const isClickOnEpisodeItem = (event.target as Element).closest(
        ".episode-item"
    );

    // 如果点击的不是视频项目，则清除选中状态
    if (!isClickOnEpisodeItem) {
        selectedEpisodesStore.clearSelectedEpisodes();
    }
};

const handlePageScroll = () => {
    if (contextMenuStore.showContextMenu) {
        contextMenuStore.hide();
    }
};

// 组件挂载时添加全局事件监听器
onMounted(() => {
    document.addEventListener("click", handlePageClick, true);
    document.addEventListener("scroll", handlePageScroll, true);
});

// 组件卸载时移除全局事件监听器
onUnmounted(() => {
    document.removeEventListener("click", handlePageClick, true);
    document.removeEventListener("scroll", handlePageScroll, true);
});
</script>

<style scoped lang="scss">
// 定义SCSS变量
$primary-color: #409eff;
$primary-light: #ecf5ff;
$text-primary: #303133;
$text-secondary: #909399;
$text-meta: #606266;
$border-color: #e4e7ed;
$border-light: #ebeef5;
$bg-light: #f5f5f5;
$bg-lighter: #fafafa;
$shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
$expanded-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

.container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px 40px; /* 减少两边留白，增加内容区域 */
    min-height: calc(
        100vh - 120px
    ); /* 减去上下padding和其他元素高度，让内容自然撑开 */
    flex: 1;
    display: flex;
    flex-direction: column;
    // overflow-y: scroll;
}

.input-section {
    text-align: center;
    margin-bottom: 30px;

    h1 {
        color: $text-primary;
        margin-bottom: 24px;
    }
}

.input-group {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}

.url-input {
    width: 600px;
    max-width: 100%;
}

.create-btn {
    min-width: 120px;
}

.collections-container {
    width: 100%;
    min-height: 0; /* 允许容器在flex布局中收缩 */
    flex: 1;
    display: flex;
    flex-direction: column;
}

.collection-wrapper {
    margin-bottom: 20px;
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

    &.meta-left {
        text-align: left;
        flex: 1;
    }

    &.meta-right {
        text-align: right;
        flex: 1;
    }
}

.meta-left {
    text-align: left;
    flex: 1;
}

.meta-right {
    text-align: right;
    flex: 1;
}

.empty-placeholder {
    text-align: center;
    padding: 40px;
    color: $text-secondary;
    font-size: 16px;
}

.context-menu {
    position: fixed;
    z-index: 9999;
    background-color: #2c3e50;
    border: 1px solid #34495e;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    min-width: 140px;
    max-width: 200px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    animation: slideIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    .context-menu-item {
        padding: 10px 16px;
        line-height: 1.4;
        text-align: left;
        user-select: none;
        cursor: pointer;
        color: #ecf0f1;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 100%
        );

        &:hover {
            background: linear-gradient(to right, #3498db, #2980b9);
            color: #ffffff;
        }

        &:not(:last-child) {
            border-bottom: 1px solid #3d566e;
        }
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: scale(0.8) translateY(-10px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .input-group {
        flex-direction: column;
    }

    .url-input {
        width: 100%;
    }

    .collection-meta {
        flex-direction: column;
        gap: 4px;
        text-align: center;

        .meta-left,
        .meta-right {
            text-align: center;
            width: 100%;
        }
    }

    .meta-left,
    .meta-right {
        text-align: center;
        width: 100%;
    }
}
</style>
