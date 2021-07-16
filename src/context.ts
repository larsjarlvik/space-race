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

export const createContext = (): Context => ({
    camera: new THREE.PerspectiveCamera(90.0, window.innerWidth / window.innerHeight, 0.5, 100),
    renderer: new THREE.WebGLRenderer({ antialias: true }),
    scene: new THREE.Scene(),
    collision: new Collisions(),
    keys: {},
    gameState: GameState.Loading,
});

export const setGameState = (ctx: Context, gameState: GameState) => {
    if (gameState === ctx.gameState) return;
    ctx.gameState = gameState;
    ctx.gameStateEvent && ctx.gameStateEvent();
};