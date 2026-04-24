/**
 * InputHandler.js — 輸入處理器
 *
 * 統一管理滑鼠與觸控事件，螢幕座標 → Canvas 邏輯座標轉換。
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=3';

export class InputHandler {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;

        /** 目前游標在邏輯座標系中的位置 */
        this.cursorPosition = { x: 0, y: 0 };

        /** 滑鼠/觸控是否按下中 */
        this.isPressed = false;

        /** 本幀是否剛按下 */
        this.justPressed = false;

        /** 本幀是否剛放開 */
        this.justReleased = false;

        /** 拖曳軌跡（電蚊拍用） */
        this.dragTrail = [];

        /** 是否正在拖曳 */
        this.isDragging = false;

        // 綁定事件處理器（保留引用以便移除）
        this._boundHandlers = {};
    }

    /** 註冊所有事件監聽器 */
    init() {
        const h = this._boundHandlers;

        // 滑鼠事件
        h.mousedown = (e) => {
            e.preventDefault();
            const pos = this._convertCoordinates(e.clientX, e.clientY);
            this._onPointerDown(pos.x, pos.y);
        };
        h.mousemove = (e) => {
            const pos = this._convertCoordinates(e.clientX, e.clientY);
            this._onPointerMove(pos.x, pos.y);
        };
        h.mouseup = (e) => {
            const pos = this._convertCoordinates(e.clientX, e.clientY);
            this._onPointerUp(pos.x, pos.y);
        };

        // 觸控事件
        h.touchstart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const pos = this._convertCoordinates(touch.clientX, touch.clientY);
            this._onPointerDown(pos.x, pos.y);
        };
        h.touchmove = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const pos = this._convertCoordinates(touch.clientX, touch.clientY);
            this._onPointerMove(pos.x, pos.y);
        };
        h.touchend = (e) => {
            e.preventDefault();
            this._onPointerUp(this.cursorPosition.x, this.cursorPosition.y);
        };

        // 右鍵選單禁止
        h.contextmenu = (e) => e.preventDefault();

        this.canvas.addEventListener('mousedown', h.mousedown);
        this.canvas.addEventListener('mousemove', h.mousemove);
        this.canvas.addEventListener('mouseup', h.mouseup);
        this.canvas.addEventListener('mouseleave', h.mouseup);
        this.canvas.addEventListener('touchstart', h.touchstart, { passive: false });
        this.canvas.addEventListener('touchmove', h.touchmove, { passive: false });
        this.canvas.addEventListener('touchend', h.touchend, { passive: false });
        this.canvas.addEventListener('contextmenu', h.contextmenu);
    }

    /** 每幀結束時重置單次觸發旗標 */
    resetFrameState() {
        this.justPressed = false;
        this.justReleased = false;
    }

    /**
     * 螢幕座標 → Canvas 邏輯座標
     * @private
     */
    _convertCoordinates(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        return {
            x: (screenX - rect.left) * scaleX,
            y: (screenY - rect.top) * scaleY,
        };
    }

    /** @private */
    _onPointerDown(x, y) {
        this.isPressed = true;
        this.justPressed = true;
        this.isDragging = true;
        this.cursorPosition.x = x;
        this.cursorPosition.y = y;
        this.dragTrail = [{ x, y }];
    }

    /** @private */
    _onPointerMove(x, y) {
        this.cursorPosition.x = x;
        this.cursorPosition.y = y;
        if (this.isDragging) {
            this.dragTrail.push({ x, y });
            // 限制軌跡長度避免記憶體問題
            if (this.dragTrail.length > 100) {
                this.dragTrail.shift();
            }
        }
    }

    /** @private */
    _onPointerUp(x, y) {
        this.isPressed = false;
        this.justReleased = true;
        this.isDragging = false;
        this.cursorPosition.x = x;
        this.cursorPosition.y = y;
    }

    /** 清除拖曳軌跡 */
    clearDragTrail() {
        this.dragTrail = [];
    }

    /** 銷毀：移除所有事件監聽器 */
    destroy() {
        const h = this._boundHandlers;
        this.canvas.removeEventListener('mousedown', h.mousedown);
        this.canvas.removeEventListener('mousemove', h.mousemove);
        this.canvas.removeEventListener('mouseup', h.mouseup);
        this.canvas.removeEventListener('mouseleave', h.mouseup);
        this.canvas.removeEventListener('touchstart', h.touchstart);
        this.canvas.removeEventListener('touchmove', h.touchmove);
        this.canvas.removeEventListener('touchend', h.touchend);
        this.canvas.removeEventListener('contextmenu', h.contextmenu);
    }
}
