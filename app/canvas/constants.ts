// Core canvas constants — Section 2.1 of FRONTEND-ARCHITECTURE.md
export const GAME_WIDTH = 320; // game pixels
export const GAME_HEIGHT = 240; // game pixels
export const PIXEL_SCALE = 3; // 1 game pixel = 3 CSS pixels
export const CANVAS_CSS_WIDTH = GAME_WIDTH * PIXEL_SCALE; // 960
export const CANVAS_CSS_HEIGHT = GAME_HEIGHT * PIXEL_SCALE; // 720
export const TARGET_FPS = 30;
export const FRAME_BUDGET_MS = 1000 / TARGET_FPS; // ~33.3ms
