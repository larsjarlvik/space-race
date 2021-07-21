import * as THREE from 'three';
import { Collisions } from 'detect-collisions';
import { Level } from 'level/level';
import { Ship } from 'ship/ship';
import { Camera } from 'camera';
import { createState, State as StateWrapper } from '@hookstate/core';

export enum GameState {
    Loading,
    Paused,
    Running,
    Crashed,
    Completed,
}

export interface State {
    gameState: GameState;
    mapMaking: boolean;
    fps: number;
}

export enum KeyState {
    Pressed = 1 << 0,
    Repeat = 1 << 1,
}

export class Context {
    public renderer: THREE.WebGLRenderer;
    public pmremGenerator: THREE.PMREMGenerator;
    public scene: THREE.Scene;
    public camera: Camera;
    public collision: Collisions;
    public keys: { [key: string]: KeyState | undefined };

    public ship?: Ship;
    public level?: Level;
    public state: StateWrapper<State>;

    constructor() {
        this.scene = new THREE.Scene;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.physicallyCorrectLights = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMappingExposure = 1;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.pmremGenerator.compileEquirectangularShader();

        this.camera = new Camera(this);
        this.collision = new Collisions();
        this.keys = {};
        this.state = createState({
            gameState: GameState.Loading,
            fps: 0,
            mapMaking: false,
        } as State);

        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('keydown', this.keyDown.bind(this));
        window.addEventListener('keyup', this.keyUp.bind(this));
    }

    public setGameState(gameState: GameState, force = false) {
        if (!force && gameState === this.state.gameState.get()) return;

        if (gameState === GameState.Running) {
            if (this.level) this.level.reset();
            if (this.ship) this.ship.add(this);
        } else {
            if (this.ship) this.ship.remove(this);
        }

        this.state.gameState.set(gameState);
    }

    public update() {
        Object.keys(this.keys).filter(k => this.keys[k] === KeyState.Pressed).forEach(k => {
            this.keys[k] = KeyState.Repeat;
        });
    }

    private resize() {
        this.camera.resize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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
