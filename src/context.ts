import * as THREE from 'three';
import { Collisions } from 'detect-collisions';
import { Level } from 'level/level';
import { Ship } from 'ship/ship';
import { Camera } from 'camera';

export enum GameState {
    Paused,
    Running,
    Crashed,
    Completed,
}

export enum KeyState {
    Pressed = 1 << 0,
    Repeat = 1 << 1,
}

export class Context {
    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public camera: Camera;
    public collision: Collisions;
    public keys: { [key: string]: KeyState };
    public gameState: GameState;
    public gameStateEvent?: () => void;

    public ship?: Ship;
    public level?: Level;

    constructor() {
        this.scene = new THREE.Scene;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera = new Camera(this);
        this.collision = new Collisions();
        this.gameState = GameState.Paused;
        this.keys = {};

        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('keydown', this.keyDown.bind(this));
        window.addEventListener('keyup', this.keyUp.bind(this));
    }

    public setGameState(gameState: GameState) {
        if (gameState === this.gameState) return;

        if (gameState === GameState.Running) {
            this.ship.add(this);
        } else {
            this.ship.remove(this);
        }

        this.gameState = gameState;
        this.gameStateEvent && this.gameStateEvent();
    }

    private resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private keyDown(e: KeyboardEvent) {
        if (this.keys[e.code]) {
            this.keys[e.code] |= KeyState.Repeat;
        } else {
            this.keys[e.code] = KeyState.Pressed;
        }
    }

    private keyUp(e: KeyboardEvent) {
        this.keys[e.code] = undefined;
    }
}
