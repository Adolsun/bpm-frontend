import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true, // 监听所有网卡（IPv4 + IPv6），避免 127.0.0.1 连不上
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8001", // 替换为你的后端地址（用 127.0.0.1 强制 IPv4，否则 Node 走 ::1 连不上后端）
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
