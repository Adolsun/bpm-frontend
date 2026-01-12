import { createApp } from "vue";
import { createPinia } from "pinia";
import {
    ElButton,
    ElInput,
    ElCard,
    ElRow,
    ElCol,
    ElCollapse,
    ElCollapseItem,
    ElMessage,
} from "element-plus";
import "element-plus/dist/index.css";
import "./style.scss";
import App from "./App.vue";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(ElButton);
app.use(ElInput);
app.use(ElCard);
app.use(ElRow);
app.use(ElCol);
app.use(ElCollapse);
app.use(ElCollapseItem);
app.use(ElMessage);

app.mount("#app");
