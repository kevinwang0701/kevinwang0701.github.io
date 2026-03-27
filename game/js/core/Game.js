/**
 * Game.js — 遊戲主控類別
 *
 * 遊戲最頂層管理者：狀態機、子系統協調、update/render 流程。
 */

import { GAME_STATES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/Constants.js?v=2';
import { GameLoop } from './GameLoop.js?v=2';
import { InputHandler } from './InputHandler.js?v=2';
import { Renderer } from './Renderer.js?v=2';
import { PlayerState } from '../entities/PlayerState.js?v=2';
import { ComboSystem } from '../systems/ComboSystem.js?v=2';
import { WaveManager } from '../systems/WaveManager.js?v=2';
import { Swatter } from '../weapons/Swatter.js?v=2';
import { HUD } from '../ui/HUD.js?v=2';
import { MenuScreen } from '../ui/MenuScreen.js?v=2';
import { PauseScreen } from '../ui/PauseScreen.js?v=2';
import { GameOverScreen } from '../ui/GameOverScreen.js?v=2';

export class Game {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        // ── 核心 ──
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.input = new InputHandler(canvas);
        this.gameLoop = new GameLoop(
            (dt) => this.update(dt),
            () => this.render()
        );

        // ── 遊戲狀態 ──
        this.state = GAME_STATES.MENU;

        // ── 遊戲時間（秒） ──
        this.gameTime = 0;

        // ── 玩家 ──
        this.player = new PlayerState();

        // ── 武器 ──
        this.swatter = new Swatter();
        this.currentWeapon = this.swatter;

        // ── 系統 ──
        this.comboSystem = new ComboSystem();
        this.waveManager = new WaveManager(this);

        // ── UI ──
        this.hud = new HUD(this);
        this.menuScreen = new MenuScreen(this);
        this.pauseScreen = new PauseScreen(this);
        this.gameOverScreen = new GameOverScreen(this);

        // ── 實體 ──
        this.enemies = [];

        // ── 背景星星（氛圍） ──
        this._bgStars = [];
        for (let i = 0; i < 60; i++) {
            this._bgStars.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
                speed: Math.random() * 0.5 + 0.1,
            });
        }

        // 鍵盤事件（暫停鍵）
        this._onKeyDown = this._onKeyDown.bind(this);
    }

    /** 初始化並啟動 */
    init() {
        this.input.init();
        this.menuScreen.init();
        this.pauseScreen.init();
        this.gameOverScreen.init();

        document.addEventListener('keydown', this._onKeyDown);

        this.gameLoop.start();
        console.log('🦟 Game initialized and running!');
    }

    /**
     * 每幀更新
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.gameTime += deltaTime;

        switch (this.state) {
            case GAME_STATES.MENU:
                this._updateMenu(deltaTime);
                break;
            case GAME_STATES.PLAYING:
                this._updatePlaying(deltaTime);
                break;
            case GAME_STATES.PAUSED:
                this._updatePaused(deltaTime);
                break;
            case GAME_STATES.GAME_OVER:
                this._updateGameOver(deltaTime);
                break;
        }

        this.input.resetFrameState();
    }

    /** 每幀繪圖 */
    render() {
        this.renderer.clear();

        switch (this.state) {
            case GAME_STATES.MENU:
                this.menuScreen.render(this.renderer);
                break;
            case GAME_STATES.PLAYING:
                this._renderPlaying();
                break;
            case GAME_STATES.PAUSED:
                this._renderPlaying(); // 先畫遊戲畫面
                this.pauseScreen.render(this.renderer);
                break;
            case GAME_STATES.GAME_OVER:
                this._renderPlaying(); // 先畫遊戲畫面
                this.gameOverScreen.render(this.renderer);
                break;
        }
    }

    /** ─── 狀態更新方法 ─── */

    /** @private */
    _updateMenu(deltaTime) {
        this.menuScreen.update(deltaTime);

        if (this.input.justPressed) {
            const action = this.menuScreen.handleClick(
                this.input.cursorPosition.x,
                this.input.cursorPosition.y
            );
            if (action === 'start') {
                this.startNewGame();
            }
        }
    }

    /** @private */
    _updatePlaying(deltaTime) {
        // 更新玩家狀態計時器
        this.player.update(deltaTime);

        // 更新 Combo 動畫
        this.comboSystem.update(deltaTime);

        // 更新武器
        this.currentWeapon.update(deltaTime);

        // 更新波次管理
        this.waveManager.update(deltaTime);

        // 更新所有敵人
        for (const enemy of this.enemies) {
            enemy.update(deltaTime);
        }

        // 蚊子吸血（每幀對玩家造成傷害）
        for (const enemy of this.enemies) {
            if (enemy.isAlive && enemy.getBloodDrain) {
                const drain = enemy.getBloodDrain() * deltaTime;
                if (drain > 0) {
                    this.player.takeDamage(drain);
                }
            }
        }

        // 處理點擊攻擊
        if (this.input.justPressed && !this.player.isStunned) {
            this._handleAttack();
        }

        // 清理死亡/逃走的敵人
        this._cleanupEnemies();

        // 更新 HUD
        this.hud.update(deltaTime);

        // 檢查玩家是否死亡
        if (this.player.isDead()) {
            this.changeState(GAME_STATES.GAME_OVER);
        }
    }

    /** @private */
    _updatePaused(deltaTime) {
        this.pauseScreen.update(deltaTime);

        if (this.input.justPressed) {
            const action = this.pauseScreen.handleClick(
                this.input.cursorPosition.x,
                this.input.cursorPosition.y
            );
            if (action === 'resume') {
                this.changeState(GAME_STATES.PLAYING);
            } else if (action === 'menu') {
                this.changeState(GAME_STATES.MENU);
            }
        }
    }

    /** @private */
    _updateGameOver(deltaTime) {
        this.gameOverScreen.update(deltaTime);

        if (this.input.justPressed) {
            const action = this.gameOverScreen.handleClick(
                this.input.cursorPosition.x,
                this.input.cursorPosition.y
            );
            if (action === 'retry') {
                this.startNewGame();
            } else if (action === 'menu') {
                this.changeState(GAME_STATES.MENU);
            }
        }
    }

    /** ─── 繪圖方法 ─── */

    /** @private */
    _renderPlaying() {
        // 背景
        this._drawGameBackground();

        // 敵人
        for (const enemy of this.enemies) {
            enemy.render(this.renderer);
        }

        // 武器效果
        this.currentWeapon.render(
            this.renderer,
            this.input.cursorPosition.x,
            this.input.cursorPosition.y
        );

        // 僵直效果
        if (this.player.isStunned) {
            this.renderer.setAlpha(0.15 + Math.sin(this.gameTime * 20) * 0.1);
            this.renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#ff0000');
            this.renderer.resetAlpha();
        }

        // HUD
        this.hud.render(this.renderer);
    }

    /** @private */
    _drawGameBackground() {
        // 深色漸層背景
        const ctx = this.renderer.ctx;
        const gradient = ctx.createRadialGradient(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 100,
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7
        );
        gradient.addColorStop(0, '#1e2040');
        gradient.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 閃爍星星
        for (const star of this._bgStars) {
            const twinkle = Math.sin(this.gameTime * star.speed * 3 + star.x) * 0.3 + 0.7;
            this.renderer.setAlpha(star.alpha * twinkle);
            this.renderer.drawCircle(star.x, star.y, star.size, '#fff');
        }
        this.renderer.resetAlpha();

        // 微妙的網格（房間感）
        this.renderer.setAlpha(0.03);
        const gridSize = 80;
        ctx.strokeStyle = '#446';
        ctx.lineWidth = 1;
        for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }
        this.renderer.resetAlpha();
    }

    /** ─── 遊戲邏輯 ─── */

    /** 處理攻擊 @private */
    _handleAttack() {
        const { x, y } = this.input.cursorPosition;
        const hitEnemies = this.currentWeapon.attack(x, y, this.enemies, this.gameTime);

        if (hitEnemies.length > 0) {
            // 命中！
            for (const enemy of hitEnemies) {
                const killed = enemy.takeDamage(this.currentWeapon.damage);
                if (killed) {
                    const multiplier = this.comboSystem.onHit();
                    const score = enemy.calculateScore ? enemy.calculateScore() : 10;
                    const finalScore = Math.floor(score * multiplier);
                    this.player.addScore(finalScore);
                    this.player.enemiesKilled++;

                    // 浮動得分
                    const center = enemy.getCenter();
                    this.hud.showFloatingScore(finalScore, center.x, center.y);
                } else {
                    // 命中但未殺死（裝甲蚊等）
                    this.comboSystem.onHit();
                }
            }
        } else {
            // 揮空！
            const stunDuration = this.comboSystem.onMiss();
            this.player.applyStun(stunDuration);
        }
    }

    /** 清理死亡/逃走的敵人 @private */
    _cleanupEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive) {
                // 逃走的蚊子扣玩家血
                if (enemy.hasEscaped && enemy.hasEscaped()) {
                    const drain = enemy.feedingTime * enemy.bloodDrainRate * 2;
                    this.player.takeDamage(Math.max(drain, 3));
                    this.hud.triggerDamageFlash();
                }

                this.waveManager.onEnemyKilled();
                this.enemies.splice(i, 1);
            }
        }
    }

    /** 切換狀態 */
    changeState(newState) {
        const oldState = this.state;
        this.state = newState;

        // 切換游標顯示
        if (newState === GAME_STATES.PLAYING) {
            this.canvas.classList.add('playing');
        } else {
            this.canvas.classList.remove('playing');
        }

        // 進入 GameOver
        if (newState === GAME_STATES.GAME_OVER) {
            this.gameOverScreen.setStats({
                finalScore: this.player.score,
                maxCombo: this.comboSystem.maxCombo,
                wavesCleared: this.waveManager.currentWave,
                enemiesKilled: this.player.enemiesKilled,
            });
        }
    }

    /** 開始新遊戲 */
    startNewGame() {
        this.player.reset();
        this.comboSystem.reset();
        this.waveManager.reset();
        this.enemies = [];
        this.currentWeapon = new Swatter();
        this.hud = new HUD(this);
        this.gameTime = 0;

        this.state = GAME_STATES.PLAYING;
        this.canvas.classList.add('playing');
        this.waveManager.isActive = true;
        this.waveManager.startNextWave();
    }

    /** 新增敵人到場上 */
    spawnEnemy(enemy) {
        this.enemies.push(enemy);
    }

    /** 鍵盤事件 @private */
    _onKeyDown(e) {
        // Escape / P 鍵暫停
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
            if (this.state === GAME_STATES.PLAYING) {
                this.changeState(GAME_STATES.PAUSED);
            } else if (this.state === GAME_STATES.PAUSED) {
                this.changeState(GAME_STATES.PLAYING);
            }
        }
    }
}
