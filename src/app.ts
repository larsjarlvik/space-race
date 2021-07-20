import * as THREE from 'three';
import { Context, GameState, KeyState } from 'context';
import { Level } from 'level/level';
import { Ship } from 'ship/ship';
import * as ui from 'ui/Index';

const ctx = new Context();
ui.init(ctx);

let fps = 0;
let lastUpdate = 0;
let lastFrame = 0;

const init = async () => {
    ctx.ship = new Ship(ctx);
    await ctx.ship.load();

    ctx.level = new Level();
    await ctx.level.load(ctx, 'level-1');

    ctx.state.gameState.set(GameState.Paused);
};

ctx.renderer.physicallyCorrectLights = true;
ctx.renderer.setSize(window.innerWidth, window.innerHeight);
ctx.renderer.setAnimationLoop(animation);

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
        ctx.setGameState(GameState.Running, true);
    }
    if (ctx.keys['KeyM'] === KeyState.Pressed) {
        ctx.state.mapMaking.set(!ctx.state.mapMaking.get());
    }

    while (frameTime > 0.0) {
        if (ctx.state.gameState.get() === GameState.Running) {
            ctx.ship!.update(ctx, FIXED_TIME_STEP);
            ctx.collision.update();
            ctx.camera.position = ctx.ship ? ctx.ship.position : new THREE.Vector3();
            ctx.level!.update(ctx);
        }
        frameTime -= FIXED_TIME_STEP;
    }

    ctx.renderer.render(ctx.scene, ctx.camera.camera);

    fps++;
    if (time - lastUpdate > 1000.0) {
        ctx.state.fps.set(fps);
        fps = 0;
        lastUpdate = time;
    }

    ctx.update();
}

if (module.hot) {
    module.hot.accept();
}
