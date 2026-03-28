/**
 * UpgradeSystem.js — 升級系統
 *
 * 管理所有可購買的升級項目。玩家使用分數購買。
 */

export class UpgradeSystem {
    constructor() {
        this.upgrades = [];
    }

    init() {
        this.upgrades = [
            {
                id: 'swatter_range',
                name: '拍面擴大',
                description: '蒼蠅拍攻擊範圍 +15%',
                icon: '🪰',
                baseCost: 80,
                costMultiplier: 1.5,
                level: 0,
                maxLevel: 5,
                effect: (game) => {
                    game.swatter.range *= 1.15;
                },
            },
            {
                id: 'electric_capacity',
                name: '電池升級',
                description: '電蚊拍電量上限 +20%',
                icon: '🔋',
                baseCost: 120,
                costMultiplier: 1.6,
                level: 0,
                maxLevel: 5,
                effect: (game) => {
                    if (game.electricSwatter) {
                        game.electricSwatter.maxCharge *= 1.2;
                        game.electricSwatter.charge = game.electricSwatter.maxCharge;
                    }
                },
            },
            {
                id: 'insecticide_extra',
                name: '殺蟲劑補充',
                description: '殺蟲劑使用次數 +1',
                icon: '💨',
                baseCost: 200,
                costMultiplier: 1.8,
                level: 0,
                maxLevel: 3,
                effect: (game) => {
                    if (game.insecticide) {
                        game.insecticide.addUses(1);
                    }
                },
            },
            {
                id: 'max_hp_up',
                name: '生命強化',
                description: 'HP 上限 +20',
                icon: '❤️',
                baseCost: 100,
                costMultiplier: 1.5,
                level: 0,
                maxLevel: 5,
                effect: (game) => {
                    game.player.maxHp += 20;
                    game.player.heal(20);
                },
            },
            {
                id: 'combo_boost',
                name: 'Combo 加速',
                description: 'Combo 倍率增長 +50%',
                icon: '🔥',
                baseCost: 150,
                costMultiplier: 1.7,
                level: 0,
                maxLevel: 3,
                effect: (game) => {
                    // 增加COMBO_CONFIG 的 MULTIPLIER_STEP（動態修改）
                    game.comboSystem._multiplierStep = (game.comboSystem._multiplierStep || 0.1) * 1.5;
                },
            },
            {
                id: 'hp_regen',
                name: '自然回復',
                description: '每秒回復 0.5 HP',
                icon: '💚',
                baseCost: 180,
                costMultiplier: 2.0,
                level: 0,
                maxLevel: 3,
                effect: (game) => {
                    game.player._hpRegen = (game.player._hpRegen || 0) + 0.5;
                },
            },
        ];
    }

    /**
     * 取得升級的目前費用
     */
    getCost(upgrade) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    }

    /**
     * 嘗試購買升級
     * @returns {boolean}
     */
    purchase(upgradeId, playerState, game) {
        const upgrade = this.upgrades.find(u => u.id === upgradeId);
        if (!upgrade) return false;
        if (upgrade.level >= upgrade.maxLevel) return false;

        const cost = this.getCost(upgrade);
        if (playerState.score < cost) return false;

        playerState.score -= cost;
        upgrade.level++;
        upgrade.effect(game);

        return true;
    }

    getUpgradeList() {
        return this.upgrades.map(u => ({
            ...u,
            cost: this.getCost(u),
            canPurchase: u.level < u.maxLevel,
        }));
    }

    reset() {
        for (const u of this.upgrades) {
            u.level = 0;
        }
    }
}
