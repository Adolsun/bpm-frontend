import { ElMessage } from "element-plus";

interface FeedbackOptions {
    success?: string;
    error?: string;
    rethrow?: boolean;
}

/**
 * Wraps a user-triggered async action with consistent success/error toasts.
 * Rethrows by default so callers that need to react to failures still can.
 */
export async function runWithFeedback<T>(
    action: () => Promise<T>,
    options: FeedbackOptions = {}
): Promise<T | undefined> {
    try {
        const result = await action();
        if (options.success) {
            ElMessage.success(options.success);
        }
        return result;
    } catch (error) {
        const detail = (error as Error).message || "未知错误";
        ElMessage.error(
            options.error ? `${options.error}: ${detail}` : `操作失败: ${detail}`
        );
        if (options.rethrow !== false) {
            throw error;
        }
        return undefined;
    }
}
