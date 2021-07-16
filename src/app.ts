import * as THREE from 'three';
import * as context from './context';
import * as map from './map';
import * as ship from './ship';

let ctx = context.createContext();
let fps = 0;
let lastUpdate = 0;
let lastFrame = 0;
const fpsDisplay = document.getElementById('fps');
const stateUi = document.getElementById('state');
const stateDisplay = document.getElementById('stateDisplay');

const init = async () => {
    ctx.camera.position.y = 4.0;
    ctx.camera.position.z = 5.0;
    ctx.camera.lookAt(0, 0, -10.0);

    await map.generateMap(ctx);
    const s = await ship.load(ctx);

    const ambient = new THREE.AmbientLight(0x666666);
    const directional = new THREE.DirectionalLight(0xffffff, 3.0);
    directional.position.set(-1.0, 2.0, 1.0);
    directional.target.position.set(0.0, 0.0, 0.0);

    ctx.scene.add(ambient);
    ctx.scene.add(directional);

    ctx.gameState = context.GameState.Loading;
};


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
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') {
        ship.reset(ctx);
        stateUi.style.display = 'none';
        ctx.gameState = context.GameState.Running;
    }

    ctx.keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    ctx.keys[e.code] = false;
});

init();

let frameTime = 0;
function animation(time: number) {
    frameTime = (time - lastFrame) / 1000.0;
    lastFrame = time;

    if (ctx.gameState === context.GameState.Running) {
        ship.update(ctx, frameTime);
        ctx.renderer.render(ctx.scene, ctx.camera);
        ctx.collision.update();
    }

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
