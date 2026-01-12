/**
 * API端点配置
 */
export const API = {
    // 合集相关API
    COLLECTION: {
        CREATE: "/api/collection", // 创建一个合集
        DELETE: "/api/collection", // 删除一个合集
        UPDATE: "/api/collection/update", // 更新一个合集
        GET: "/api/collection", // 获取所有合集
    },
    VIDEO: {
        PATCH: "/api/video", // 更新一组视频
    },
} as const;
