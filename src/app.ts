import { Context, GameState, KeyState, UiState } from 'context';
import * as ui from 'ui/Index';

window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
});

const ctx = new Context();
ui.init(ctx);

const isPwa = (window.matchMedia('(display-mode: fullscreen)').matches) || (window.navigator as any).standalone || document.referrer.includes('android-app://');
ctx.state.isPwa.set(isPwa);
if (isPwa) {
    ctx.state.isPwa.set(true);

    document.body.addEventListener('click', () => {
        document.body.requestFullscreen();
    });
}

let fps = 0;
let lastUpdate = 0;
let lastFrame = 0;

const init = async () => {
    await ctx.skybox.load(ctx, 'skybox');
    await ctx.ship.load(ctx);
    await ctx.level.init();

    const maps = await ctx.level.list();
    ctx.state.maps.set(maps);
    ctx.state.uiState.set(UiState.MainMenu);
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

    if (frameTime > 5.0) frameTime = 5.0;

    if (ctx.keys['KeyF'] === KeyState.Pressed) {
        ctx.toggleFullscreen();
    }
    if (ctx.keys['Escape'] === KeyState.Pressed) {
        ctx.state.gameState.set(GameState.Paused);
        ctx.state.uiState.set(UiState.MainMenu);
    }

    while (frameTime > 0.0) {
        if (ctx.state.gameState.get() !== GameState.Paused) {
            ctx.ship.update(ctx, FIXED_TIME_STEP);
            ctx.collision.update();
            ctx.camera.position = ctx.ship.position;
            ctx.camera.directional.position.set(ctx.ship.position.x - 10.0, 10.0, ctx.ship.position.z - 8.0);
            ctx.camera.directional.target = ctx.ship.model;
            ctx.level.update(ctx);
        }

        ctx.skybox.update(ctx);
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
