import * as THREE from 'three';
import { Context, GameState, KeyState } from './context';
import { Level } from './level/level';
import { Ship } from './ship/ship';

const ctx = new Context();
const fpsDisplay = document.getElementById('fps');
const stateUi = document.getElementById('state');
const stateDisplay = document.getElementById('stateDisplay');
const loadingDisplay = document.getElementById('loading');

let fps = 0;
let lastUpdate = 0;
let lastFrame = 0;

const ambient = new THREE.AmbientLight(new THREE.Color(2.0, 2.0, 2.0));
const directional = new THREE.DirectionalLight(0xffffff, 7.0);

directional.castShadow = true;
directional.shadow.mapSize.width = 2048;
directional.shadow.mapSize.height = 2048;
directional.shadow.camera.near = 0.5;
directional.shadow.camera.far = 100;

ctx.scene.add(ambient);
ctx.scene.add(directional);

ctx.camera.position.y = 4.0;
ctx.camera.position.z = 5.0;
ctx.camera.lookAt(0, 0, -10.0);

const init = async () => {

    ctx.ship = new Ship(ctx);
    await ctx.ship.load();
    ctx.level = new Level();
    await ctx.level.load(ctx, 'level-1');

    ctx.gameState = GameState.Paused;
    loadingDisplay.style.opacity = '0';
};

ctx.renderer.physicallyCorrectLights = true;
ctx.renderer.setSize(window.innerWidth, window.innerHeight);
ctx.renderer.setAnimationLoop(animation);

ctx.gameStateEvent = () => {
    switch (ctx.gameState) {
        case GameState.Completed:
            stateDisplay.innerText = 'Level Complete!';
            stateUi.style.display = 'block';
            break;
        case GameState.Crashed:
            stateDisplay.innerText = 'Crashed!';
            stateUi.style.display = 'block';
            break;
    }
};

document.body.appendChild(ctx.renderer.domElement);

init();

let frameTime = 0;
const FIXED_TIME_STEP = 1.0 / 144.0;

window.addEventListener('focus', () => {
    lastFrame = performance.now();
});

function animation(time: number) {
    frameTime += (time - lastFrame) / 1000.0;
    lastFrame = time;

    if (frameTime > 500.0) frameTime = 500.0;

    if (ctx.keys['KeyR'] === KeyState.Pressed) {
        ctx.level.reset();
        ctx.ship.reset();
        ctx.setGameState(GameState.Running);
        stateUi.style.display = 'none';
    }

    while (frameTime > 0.0) {
        if (ctx.gameState === GameState.Running) {
            ctx.ship.update(ctx, FIXED_TIME_STEP);
            ctx.collision.update();

            const z = ctx.ship ? ctx.ship.position.z : 0.0;
            const x = ctx.ship ? ctx.ship.position.x : 0.0;
            ctx.camera.position.z = z + 5.0;
            ctx.camera.position.x = x / 2.0;
            directional.position.set(x - 10.0, 10.0, z - 8.0);
            directional.target.position.set(x, 0.0, z);
            directional.target.updateMatrixWorld();

            ctx.level.update(ctx);
        }
        frameTime -= FIXED_TIME_STEP;
    }

    ctx.renderer.render(ctx.scene, ctx.camera);

    fps++;

    if (time - lastUpdate > 1000.0) {
        fpsDisplay.innerText = `FPS: ${fps}`;
        fps = 0;
        lastUpdate = time;
    }
}

if (module.hot) {
    module.hot.accept();
}
