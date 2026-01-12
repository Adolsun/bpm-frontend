/**
 * 从B站视频链接中提取BV号
 * @param url - B站视频链接
 * @returns BV号，如果无法提取则返回null
 */
export function extractBVFromUrl(url: string): string | null {
    // 支持多种B站链接格式
    const pattern = /video\/(BV[A-Za-z0-9]{10})/; // /video/BV号格式

    const match = url.match(pattern);
    if (match) {
        // 如果匹配到的是完整的BV号（包含BV前缀），直接返回
        if (match[1]?.startsWith("BV")) {
            return match[1];
        } else {
            return null;
        }
    }

    return null;
}
