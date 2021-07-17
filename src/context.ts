import { Collisions } from 'detect-collisions';
import * as THREE from 'three';
import { MapData } from './map';
import { Ship } from './ship';

export enum GameState {
    Loading,
    Running,
    Crashed,
    Completed,
}

export interface Context {
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    collision: Collisions,
    keys: { [key: string]: boolean },
    gameState: GameState,
    gameStateEvent?: () => void;
    ship?: Ship,
    map?: MapData,
}

export const createContext = (): Context => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return {
        renderer,
        camera: new THREE.PerspectiveCamera(90.0, window.innerWidth / window.innerHeight, 0.5, 100),
        scene: new THREE.Scene(),
        collision: new Collisions(),
        keys: {},
        gameState: GameState.Loading,
    }
};

export const setGameState = (ctx: Context, gameState: GameState) => {
    if (gameState === ctx.gameState) return;

    if (gameState === GameState.Running) {
        ctx.scene.add(ctx.ship.model);
        ctx.scene.add(ctx.ship.particles);
    } else {
        ctx.scene.remove(ctx.ship.model);
        ctx.scene.remove(ctx.ship.particles);
    }

    ctx.gameState = gameState;
    ctx.gameStateEvent && ctx.gameStateEvent();
};