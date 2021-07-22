import { Context, GameState, KeyState } from 'context';
import * as ui from 'ui/Index';

const ctx = new Context();
ui.init(ctx);

let fps = 0;
let lastUpdate = 0;
let lastFrame = 0;

const init = async () => {
    await ctx.skybox.load(ctx, 'skybox');
    await ctx.ship.load();
    await ctx.level.load(ctx, 'level-1');

    ctx.state.gameState.set(GameState.Paused);
};


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
            ctx.ship.update(ctx, FIXED_TIME_STEP);
            ctx.collision.update();
            ctx.camera.position = ctx.ship.position;
            ctx.camera.directional.position.set(ctx.ship.position.x - 10.0, 10.0, ctx.ship.position.z - 8.0);
            ctx.camera.directional.target = ctx.ship.model;
            ctx.level.update(ctx);
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

    ctx.skybox.update(ctx);
    ctx.update();
}

if (module.hot) {
    module.hot.accept();
}
