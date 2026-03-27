/**
 * Constants.js — 全域常數定義
 * 
 * 集中管理所有遊戲參數，方便統一調整與平衡性調校。
 */

// ── Canvas 邏輯解析度 ──
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

// ── 遊戲狀態列舉 ──
export const GAME_STATES = Object.freeze({
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    UPGRADE: 'upgrade',
    GAME_OVER: 'gameOver',
    BOSS: 'boss',
});

// ── 玩家初始參數 ──
export const PLAYER_DEFAULTS = Object.freeze({
    MAX_HP: 100,
    STARTING_SCORE: 0,
    STARTING_COMBO: 0,
});

// ── Combo 系統參數 ──
export const COMBO_CONFIG = Object.freeze({
    MULTIPLIER_STEP: 0.1,      // 每次連擊增加的倍率
    MAX_MULTIPLIER: 5.0,       // 最大倍率上限
    FRENZY_THRESHOLD: 50,      // 觸發狂熱時間所需的 Combo 數
    MISS_STUN_DURATION: 500,   // 揮空僵直時間（毫秒）
});

// ── 武器參數 ──
export const WEAPON_CONFIG = Object.freeze({
    SWATTER: {
        DAMAGE: 1,
        RANGE: 40,          // 點擊半徑（邏輯像素）
        COOLDOWN: 100,      // 攻擊冷卻（毫秒）
    },
    ELECTRIC_SWATTER: {
        DAMAGE: 1,
        TRAIL_WIDTH: 30,    // 軌跡寬度
        MAX_CHARGE: 100,    // 電量上限
        DRAIN_RATE: 2,      // 每幀消耗電量
        RECHARGE_RATE: 0.5, // 每幀回充電量
    },
    INSECTICIDE: {
        DAMAGE: 999,        // 秒殺
        MAX_USES: 3,        // 最大使用次數
    },
});

// ── 敵人參數 ──
export const ENEMY_CONFIG = Object.freeze({
    MOSQUITO: {
        HP: 1,
        SPEED: 2,
        SCORE: 10,
        BLOOD_DRAIN_RATE: 0.5,  // 每秒吸血量
    },
    AGILE_MOSQUITO: {
        HP: 1,
        SPEED: 4,
        SCORE: 25,
        BLOOD_DRAIN_RATE: 0.3,
    },
    ARMORED_MOSQUITO: {
        HP: 3,
        SPEED: 1.5,
        SCORE: 50,
        BLOOD_DRAIN_RATE: 0.8,
    },
    STEALTH_MOSQUITO: {
        HP: 1,
        SPEED: 2,
        SCORE: 30,
        BLOOD_DRAIN_RATE: 0.5,
    },
    TRAP_BEE: {
        HP: 1,
        SPEED: 3,
        PENALTY_HP: 10,       // 誤擊扣血量
        STUN_DURATION: 1000,  // 麻痺時間（毫秒）
    },
});

// ── Boss 參數 ──
export const BOSS_CONFIG = Object.freeze({
    HP: 100,
    SCORE: 500,
    MINION_SPAWN_INTERVAL: 3000,  // 小怪生成間隔（毫秒）
    VENOM_DURATION: 3000,          // 毒液效果持續時間（毫秒）
});
