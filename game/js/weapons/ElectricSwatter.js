/**
 * ElectricSwatter.js — 電蚊拍
 * 
 * 繼承自 Weapon，特點：
 * - 拖曳操作：按住滑鼠拖動畫出傷害軌跡
 * - 軌跡經過的敵人受到傷害
 * - 消耗電量槽，鬆開後自動回充
 * - 可升級電量上限
 */

import { Weapon } from './Weapon.js?v=2';
import { WEAPON_CONFIG } from '../utils/Constants.js?v=2';

export class ElectricSwatter extends Weapon {
    constructor() {
        super('electric_swatter', '電蚊拍');

        const config = WEAPON_CONFIG.ELECTRIC_SWATTER;
        this.damage = config.DAMAGE;

        /** @type {number} 軌跡寬度（判定碰撞用） */
        this.trailWidth = config.TRAIL_WIDTH;

        /** @type {number} 目前電量 */
        this.charge = config.MAX_CHARGE;

        /** @type {number} 最大電量 */
        this.maxCharge = config.MAX_CHARGE;

        /** @type {number} 每幀消耗電量 */
        this.drainRate = config.DRAIN_RATE;

        /** @type {number} 每幀回充電量 */
        this.rechargeRate = config.RECHARGE_RATE;

        /** @type {boolean} 是否正在使用中（拖曳中） */
        this.isActive = false;

        /** @type {Array<{x: number, y: number}>} 電擊軌跡點 */
        this.trail = [];
    }

    /**
     * 電蚊拍攻擊：根據拖曳軌跡判定碰撞
     * @param {number} x - 當前拖曳位置 X
     * @param {number} y - 當前拖曳位置 Y
     * @param {Array<Entity>} enemies - 場上敵人
     * @returns {Array<Entity>} 被命中的敵人
     */
    attack(x, y, enemies) {
        // TODO:
        // 1. 檢查電量是否足夠
        // 2. 將 (x, y) 加入軌跡
        // 3. 用線段與圓形碰撞檢測軌跡是否碰觸敵人
        // 4. 消耗電量
    }

    /**
     * 每幀更新：電量管理
     * @param {number} deltaTime
     */
    update(deltaTime) {
        // TODO:
        // 若正在使用：消耗電量
        // 若未使用：回充電量
        // 電量耗盡時強制停止
    }

    /**
     * 繪製電蚊拍與電擊軌跡
     * @param {Renderer} renderer
     */
    render(renderer) {
        // TODO:
        // 1. 繪製電蚊拍游標
        // 2. 繪製電擊軌跡（帶有閃電效果的線條）
        // 3. 繪製電量條 UI
    }

    /**
     * 開始使用電蚊拍（按下拖曳時）
     */
    startUse() {
        // TODO: isActive = true, 清空軌跡
    }

    /**
     * 停止使用電蚊拍（放開時）
     */
    stopUse() {
        // TODO: isActive = false, 清空軌跡
    }
}
