# AGENTS.md - Agentic Coding Guidelines

## Project Overview

This is a Vue 3 + TypeScript + Vite project for managing Bilibili video progress. It uses:
- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Element Plus** for UI components
- **Pinia** for state management
- **SCSS** for styling

## Commands

### Development
```bash
npm run dev          # Start Vite dev server (port 5173 by default)
```

### Build
```bash
npm run build        # Run TypeScript check (vue-tsc) then build for production
npm run preview      # Preview production build locally
```

### Running a Single Test
**No test framework is currently installed.** To add tests, install Vitest:
```bash
npm install -D vitest @vue/test-utils jsdom
```

Then add to package.json scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Run a single test file:
```bash
npx vitest run src/utils/timeUtils.test.ts
```

### Linting/Type Checking
- **TypeScript**: Built into `npm run build` via `vue-tsc -b`
- **No ESLint/Prettier configured** - Consider adding if needed:
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue
```

## Code Style Guidelines

### Imports
- Use path alias `@/` for src-relative imports (e.g., `@/components/...`, `@/utils/...`)
- External imports first, then internal imports
- Vue components imported directly and registered manually in main.ts

```typescript
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import VideoCollection from "@/components/VideoCollection.vue";
import { useSeasonInfosStore } from "@/stores/seasonInfos";
```

### TypeScript
- Always use explicit types for function parameters and return types
- Use interfaces for data structures (see `src/types/index.ts`)
- Use `type` for unions, utility types
- Type assertion when error message extraction: `(error as Error).message`

```typescript
interface Episode {
    bvid: string;
    title: string;
    duration: number;
}

const fetchData = async (url: string): Promise<SeasonInfo> => { ... }
```

### Naming Conventions
- **Components**: PascalCase (`VideoCollection.vue`, `App.vue`)
- **Files/Variables**: camelCase (`seasonInfos.ts`, `videoUrl`)
- **Constants**: UPPER_SNAKE_CASE with `as const` (`API.COLLECTION.CREATE`)
- **Stores**: `useXxxStore` pattern for Pinia stores
- **CSS Classes**: kebab-case (`.context-menu-item`, `.video-title`)

### Vue Components
- Use `<script setup lang="ts">` syntax
- Import and register Element Plus components in `src/main.ts`
- Use `defineStore` with Composition API style for Pinia:

```typescript
export const useSeasonInfosStore = defineStore("seasonInfos", () => {
    const seasonInfos = ref<SeasonInfo[]>([]);
    // ... actions and getters
    return { seasonInfos, ... };
});
```

### Error Handling
- Always wrap async operations in try-catch
- Use `ElMessage.error()` for user-facing error notifications
- Extract error message safely: `(error as Error).message`

```typescript
try {
    await someAsyncOperation();
    ElMessage.success("操作成功");
} catch (error) {
    ElMessage.error(`操作失败: ${(error as Error).message}`);
}
```

### SCSS/CSS
- Use SCSS nesting for related styles
- Define variables at the top of `<style>` block
- Use `scoped` attribute on `<style>` to scope styles to component
- Prefer flexbox for layout

```scss
<style scoped lang="scss">
$primary-color: #409eff;
$text-primary: #303133;

.container {
    display: flex;
    flex-direction: column;
    
    .child-element {
        color: $text-primary;
    }
}
</style>
```

### Reactivity
- Use `ref()` for primitives and objects
- Use `computed()` for derived state
- Use `reactive()` for plain objects (less common in this codebase)

## Project Structure

```
src/
├── api/              # API endpoint definitions
│   └── index.ts
├── components/       # Vue components
│   └── VideoCollection.vue
├── stores/           # Pinia stores
│   ├── contextMenu.ts
│   ├── selectedEpisodes.ts
│   └── seasonInfos.ts
├── types/            # TypeScript interfaces
│   └── index.ts
├── utils/            # Utility functions
│   ├── bvParser.ts
│   ├── dataOption.ts
│   └── timeUtils.ts
├── assets/           # Static assets
├── App.vue           # Root component
├── main.ts           # App entry point
├── style.scss        # Global styles
└── shims-vue.d.ts    # TypeScript declarations
```

## API Proxy

The dev server proxies `/api/*` requests to `http://localhost:8001`. API paths are defined in `src/api/index.ts`.

## Common Patterns

### Adding a New Feature
1. Add types to `src/types/index.ts` if needed
2. Create store in `src/stores/` if state management needed
3. Create component in `src/components/`
4. Import and use in parent component
5. Test with `npm run dev`

### Adding Element Plus Component
1. Import in `src/main.ts`:
```typescript
import { ElButton, ElInput } from "element-plus";
app.use(ElButton);
app.use(ElInput);
```
2. Use in template: `<el-button>Text</el-button>`

## Notes for AI Agents

- This project does not have a test framework - consider adding one if making significant changes
- No ESLint/Prettier is configured - code style follows existing conventions
- Element Plus components are globally registered in main.ts
- The project uses Chinese language in some comments and UI text
- API calls go through `/api` proxy to backend at `localhost:8001`