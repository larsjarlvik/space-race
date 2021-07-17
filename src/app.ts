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
    ctx.gameState = context.GameState.Loading;
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
        stateUi.style.display = 'none';
        context.setGameState(ctx, context.GameState.Running);
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

    const z = ctx.ship ? ctx.ship.model.position.z : 0.0;


    if (ctx.gameState === context.GameState.Running) {
        ship.update(ctx, frameTime);
        ctx.collision.update();
    }

    ctx.camera.position.z = z + 5.0;
    directional.position.set(10.0, 10.0, z - 8.0);
    directional.target.position.set(0.0, 0.0, z);
    directional.target.updateMatrixWorld();

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
