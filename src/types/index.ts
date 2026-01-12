// 定义视频信息类型
export interface Episode {
    bvid: string;
    title: string;
    duration: number; // 时长，单位秒
    collection_id: number;
    order_index: number;
    watched_count: number;
    status: string;
}

export interface SeasonInfo {
    total_episodes: number;
    order_index: number;
    up_name: string;
    updated_at: string;
    title: string;
    season_id: number;
    created_at: string;
    last_sync_at: string;
    videos: Episode[];
}
