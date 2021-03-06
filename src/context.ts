import * as THREE from 'three';
import { Level } from 'level/level';
import { Ship } from 'ship/ship';
import { Camera } from 'camera';
import { Skybox } from 'skybox';
import { createState, State as StateWrapper } from '@hookstate/core';
import * as nipple from 'nipplejs';

export enum GameState {
    Paused,
    Running,
    MapMaking,
}

export enum UiState {
    None,
    Loading,
    MainMenu,
    GameEnd,
    MapSelector,
    MapBuilder,
}

export interface State {
    gameState: GameState;
    uiState: UiState;
    scrollMap: boolean;
    maps: string[];
    fps: number;
    gameEndMessage?: string;
    menuIndex: number;
}

export enum KeyState {
    Pressed = 1 << 0,
    Repeat = 1 << 1,
}

export class Context {
    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public camera: Camera;
    public skybox: Skybox;
    public keys: { [key: string]: KeyState | undefined };

    public ship: Ship;
    public level: Level;
    public state: StateWrapper<State>;
    public nipple: nipple.JoystickManager;
    public nippleId: number;
    nippleArea: HTMLElement;
    jumpArea: HTMLElement;

    constructor() {
        this.scene = new THREE.Scene;

        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.outputEncoding = THREE.LinearEncoding;

        this.camera = new Camera(this);
        this.skybox = new Skybox();
        this.ship = new Ship();
        this.level = new Level(this);

        this.nippleArea = document.getElementById('nipple')!;
        this.jumpArea = document.getElementById('jump')!;

        this.keys = {};
        this.state = createState({
            gameState: GameState.Paused,
            uiState: UiState.Loading,
            fps: 0,
            menuIndex: 0,
        } as State);

        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('keydown', this.keyDown.bind(this));
        window.addEventListener('keyup', this.keyUp.bind(this));

        this.jumpArea.addEventListener('touchstart', () => {
            this.keys['Space'] = KeyState.Pressed;
        });
        this.jumpArea.addEventListener('touchend', () => {
            this.keys['Space'] = undefined;
        });

        this.nipple = nipple.create({
            zone: this.nippleArea,
            mode: 'dynamic',
            color: 'white',
        });

        this.nipple.on('start', (data) => {
            this.nippleId = data.target.nipples[0].identifier;
        });
    }

    public setGameState(gameState: GameState, force = false) {
        if (!force && gameState === this.state.gameState.get()) return;

        if (gameState === GameState.Running || gameState === GameState.MapMaking) {
            this.ship.reset();
            this.ship.visible = true;
            this.nippleArea.classList.add('show');
            this.jumpArea.classList.add('show');
            this.state.gameEndMessage.set(undefined);
            document.getElementById('ui')?.classList.add('running');
        } else {
            this.ship.visible = false;
            this.nippleArea.classList.remove('show');
            this.jumpArea.classList.remove('show');
            document.getElementById('ui')?.classList.remove('running');
        }

        this.state.gameState.set(gameState);
    }

    public update() {
        Object.keys(this.keys).filter(k => this.keys[k] === KeyState.Pressed).forEach(k => {
            this.keys[k] = KeyState.Repeat;
        });
    }

    public toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.body.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    public endLevel(ctx: Context, message: string) {
        if (ctx.state.gameState.get() === GameState.Running) {
            ctx.state.gameEndMessage.set(message);
            ctx.setGameState(GameState.Paused);
            ctx.state.uiState.set(UiState.GameEnd);
        } else {
            ctx.setGameState(GameState.MapMaking, true);
        }
    }

    private resize() {
        this.camera.resize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    private keyDown(e: KeyboardEvent) {
        if (!this.keys[e.code]) {
            this.keys[e.code] = KeyState.Pressed;
        }
    }

    private keyUp(e: KeyboardEvent) {
        this.keys[e.code] = undefined;
    }
}
