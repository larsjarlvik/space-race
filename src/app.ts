import * as THREE from 'three';
import * as context from './context';
import * as map from './map';
import * as ship from './ship';
import * as skybox from './skybox';

let ctx = context.createContext();
let fps = 0;
let lastUpdate = 0;
let lastFrame = 0;
const fpsDisplay = document.getElementById('fps');
const stateUi = document.getElementById('state');
const stateDisplay = document.getElementById('stateDisplay');
const loadingDisplay = document.getElementById('loading');

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
skybox.create(ctx);

const init = async () => {
    await map.generateMap(ctx);
    const s = await ship.load(ctx);
    ctx.gameState = context.GameState.Paused;
    loadingDisplay.style.opacity = '0';
};

ctx.renderer.physicallyCorrectLights = true;
ctx.renderer.setSize(window.innerWidth, window.innerHeight);
ctx.renderer.setAnimationLoop(animation);

ctx.gameStateEvent = () => {
    switch (ctx.gameState) {
        case context.GameState.Completed:
            stateDisplay.innerText = 'Level Complete!';
            stateUi.style.display = 'block';
            break;
        case context.GameState.Crashed:
            stateDisplay.innerText = 'Crashed!';
            stateUi.style.display = 'block';
            break;
    }
};

document.body.appendChild(ctx.renderer.domElement);
window.addEventListener('resize', () => {
    ctx.renderer.setSize(window.innerWidth, window.innerHeight);
    ctx.camera.aspect = window.innerWidth / window.innerHeight;
    ctx.camera.updateProjectionMatrix();
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') {
        ship.reset(ctx);
        map.reset(ctx);
        stateUi.style.display = 'none';
        context.setGameState(ctx, context.GameState.Running);
    }

    if (ctx.keys[e.code]) {
        ctx.keys[e.code] |= context.KeyState.Repeat;
    } else {
        ctx.keys[e.code] = context.KeyState.Pressed;
    }
});

window.addEventListener('keyup', (e) => {
    ctx.keys[e.code] = undefined;
});

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

    while (frameTime > 0.0) {
        if (ctx.gameState === context.GameState.Running) {
            ship.update(ctx, FIXED_TIME_STEP);
            ctx.collision.update();

            const z = ctx.ship ? ctx.ship.model.position.z : 0.0;
            const x = ctx.ship ? ctx.ship.model.position.x : 0.0;
            ctx.camera.position.z = z + 5.0;
            ctx.camera.position.x = x / 2.0;
            directional.position.set(x - 10.0, 10.0, z - 8.0);
            directional.target.position.set(x, 0.0, z);
            directional.target.updateMatrixWorld();

            map.update(ctx);
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
