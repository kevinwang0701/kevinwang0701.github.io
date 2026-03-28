/**
 * UpgradeShop.js — 升級商店 UI
 *
 * 波次之間顯示，玩家可用分數購買升級。
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { pointInRect } from '../utils/CollisionUtils.js?v=2';

export class UpgradeShop {
    constructor(game) {
        this.game = game;
        this.cards = [];
        this.scrollOffset = 0;

        this.continueButton = {
            x: CANVAS_WIDTH / 2 - 140,
            y: CANVAS_HEIGHT - 100,
            width: 280,
            height: 55,
            text: '▶️ 繼續下一波',
            isHovered: false,
        };

        this._feedbackText = '';
        this._feedbackTimer = 0;
        this._feedbackColor = '#fff';
    }

    init() {}

    refresh() {
        if (!this.game.upgradeSystem) return;
        this.cards = this.game.upgradeSystem.getUpgradeList().map((upgrade, i) => ({
            ...upgrade,
            x: 120 + (i % 3) * 570,
            y: 200 + Math.floor(i / 3) * 200,
            width: 520,
            height: 160,
            isHovered: false,
        }));
    }

    update(deltaTime) {
        const cursor = this.game.input.cursorPosition;

        // 更新卡片 hover
        for (const card of this.cards) {
            card.isHovered = pointInRect(cursor.x, cursor.y, card.x, card.y, card.width, card.height);
        }

        // 繼續按鈕 hover
        this.continueButton.isHovered = pointInRect(
            cursor.x, cursor.y,
            this.continueButton.x, this.continueButton.y,
            this.continueButton.width, this.continueButton.height
        );

        // 反饋文字計時
        if (this._feedbackTimer > 0) {
            this._feedbackTimer -= deltaTime;
        }
    }

    render(renderer) {
        // 半透明背景
        renderer.setAlpha(0.85);
        renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0a0a1e');
        renderer.resetAlpha();

        // 標題
        renderer.drawTextWithStroke(
            '🛒 升級商店',
            CANVAS_WIDTH / 2, 80,
            '#ffcc00', '#000',
            'bold 48px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            5, 'center', 'middle'
        );

        // 目前分數
        renderer.drawTextWithStroke(
            `💰 分數：${this.game.player.score.toLocaleString()}`,
            CANVAS_WIDTH / 2, 140,
            '#ffd700', '#000',
            'bold 28px "Segoe UI", Arial, sans-serif',
            3, 'center', 'middle'
        );

        // 商品卡片
        for (const card of this.cards) {
            this._renderCard(card, renderer);
        }

        // 繼續按鈕
        const btn = this.continueButton;
        const btnColor = btn.isHovered ? '#44aa44' : '#338833';
        renderer.drawRoundRect(btn.x, btn.y, btn.width, btn.height, 10, btnColor);
        renderer.drawRoundRectStroke(btn.x, btn.y, btn.width, btn.height, 10, '#66cc66', 2);
        renderer.drawTextWithStroke(
            btn.text,
            btn.x + btn.width / 2, btn.y + btn.height / 2,
            '#fff', '#000',
            'bold 24px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            3, 'center', 'middle'
        );

        // 反饋文字
        if (this._feedbackTimer > 0) {
            renderer.setAlpha(this._feedbackTimer);
            renderer.drawTextWithStroke(
                this._feedbackText,
                CANVAS_WIDTH / 2, CANVAS_HEIGHT - 160,
                this._feedbackColor, '#000',
                'bold 26px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
                3, 'center', 'middle'
            );
            renderer.resetAlpha();
        }
    }

    /** @private */
    _renderCard(card, renderer) {
        const affordable = card.canPurchase && this.game.player.score >= card.cost;
        const maxed = card.level >= card.maxLevel;

        // 卡片背景
        let bgColor;
        if (maxed) {
            bgColor = 'rgba(60, 60, 80, 0.6)';
        } else if (card.isHovered && affordable) {
            bgColor = 'rgba(80, 100, 60, 0.7)';
        } else {
            bgColor = 'rgba(40, 40, 60, 0.7)';
        }

        renderer.drawRoundRect(card.x, card.y, card.width, card.height, 10, bgColor);

        const borderColor = maxed ? '#555' : affordable ? '#88cc44' : '#666';
        renderer.drawRoundRectStroke(card.x, card.y, card.width, card.height, 10, borderColor, 2);

        // 圖示
        renderer.drawText(
            card.icon, card.x + 30, card.y + 30,
            '#fff', '36px Arial', 'left', 'top'
        );

        // 名稱
        renderer.drawTextWithStroke(
            card.name, card.x + 80, card.y + 35,
            '#fff', '#000',
            'bold 24px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            2, 'left', 'top'
        );

        // 描述
        renderer.drawText(
            card.description, card.x + 80, card.y + 70,
            'rgba(255,255,255,0.6)',
            '16px "Segoe UI", "Microsoft JhengHei", Arial, sans-serif',
            'left', 'top'
        );

        // 等級
        const levelText = maxed ? 'MAX' : `Lv.${card.level}/${card.maxLevel}`;
        const levelColor = maxed ? '#ffcc00' : '#88aacc';
        renderer.drawText(
            levelText, card.x + card.width - 20, card.y + 30,
            levelColor,
            'bold 18px "Segoe UI", Arial, sans-serif',
            'right', 'top'
        );

        // 等級進度條
        const barX = card.x + 80;
        const barY = card.y + 100;
        const barW = card.width - 110;
        const barH = 8;
        renderer.drawRoundRect(barX, barY, barW, barH, 4, 'rgba(0,0,0,0.4)');
        if (card.level > 0) {
            const fillW = barW * (card.level / card.maxLevel);
            if (fillW > 0) {
                renderer.drawRoundRect(barX, barY, fillW, barH, 4, '#88cc44');
            }
        }

        // 費用
        if (!maxed) {
            const costColor = affordable ? '#ffd700' : '#ff6666';
            renderer.drawTextWithStroke(
                `💰 ${card.cost}`,
                card.x + 80, card.y + 125,
                costColor, '#000',
                'bold 20px "Segoe UI", Arial, sans-serif',
                2, 'left', 'top'
            );
        }
    }

    handleClick(x, y) {
        // 繼續按鈕
        const btn = this.continueButton;
        if (pointInRect(x, y, btn.x, btn.y, btn.width, btn.height)) {
            return 'continue';
        }

        // 商品卡片
        for (const card of this.cards) {
            if (pointInRect(x, y, card.x, card.y, card.width, card.height)) {
                if (card.level >= card.maxLevel) {
                    this._showFeedback('已達最高等級！', '#ffaa44');
                    return null;
                }
                if (this.game.player.score < card.cost) {
                    this._showFeedback('分數不足！', '#ff4444');
                    return null;
                }

                const success = this.game.upgradeSystem.purchase(
                    card.id, this.game.player, this.game
                );
                if (success) {
                    this._showFeedback(`✅ 已購買 ${card.name}！`, '#44ff44');
                    this.refresh();
                }
                return null;
            }
        }

        return null;
    }

    /** @private */
    _showFeedback(text, color) {
        this._feedbackText = text;
        this._feedbackColor = color;
        this._feedbackTimer = 1.5;
    }
}
