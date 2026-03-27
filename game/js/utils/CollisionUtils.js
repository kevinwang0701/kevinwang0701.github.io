/**
 * CollisionUtils.js — 碰撞偵測工具
 */

/**
 * 點與圓形的碰撞偵測
 */
export function pointInCircle(px, py, cx, cy, radius) {
    const dx = px - cx;
    const dy = py - cy;
    return (dx * dx + dy * dy) <= (radius * radius);
}

/**
 * 點與矩形的碰撞偵測
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * 圓形與圓形的碰撞偵測
 */
export function circleIntersect(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distSq = dx * dx + dy * dy;
    const radiusSum = r1 + r2;
    return distSq <= (radiusSum * radiusSum);
}

/**
 * 線段與圓形的碰撞偵測
 * 用於電蚊拍拖曳軌跡判定
 */
export function lineIntersectCircle(lx1, ly1, lx2, ly2, cx, cy, radius) {
    // 線段向量
    const dx = lx2 - lx1;
    const dy = ly2 - ly1;
    // 線段起點到圓心向量
    const fx = lx1 - cx;
    const fy = ly1 - cy;

    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;

    let discriminant = b * b - 4 * a * c;

    if (discriminant < 0) return false;

    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);

    // 檢查 t 是否在 [0, 1] 範圍內（線段上）
    if (t1 >= 0 && t1 <= 1) return true;
    if (t2 >= 0 && t2 <= 1) return true;

    // 也檢查圓心是否在線段內部
    return false;
}
