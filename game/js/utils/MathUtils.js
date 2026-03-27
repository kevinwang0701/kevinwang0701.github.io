/**
 * MathUtils.js — 數學工具函式庫
 */

/**
 * 計算兩點之間的距離
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 計算兩點之間的角度（弧度）
 */
export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 產生指定範圍內的隨機數（浮點數）
 */
export function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * 產生指定範圍內的隨機整數
 */
export function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * 線性插值 (Lerp)
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * 將值限制在指定範圍內 (Clamp)
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * 角度轉弧度
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * 弧度轉角度
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * 緩動函式：ease-out cubic
 */
export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * 緩動函式：ease-in-out quad
 */
export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
