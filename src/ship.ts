import * as THREE from 'three';
import * as context from './context';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Circle } from 'detect-collisions';
import { Attribute } from './map';

// Meter per second
const ACCELERATION = 0.3;
const GRAVITY = 0.3;
const HOVER = 0.1;

export interface Ship {
    speed: THREE.Vector3;
    model: THREE.Object3D;
    boundingBox: Circle;
}

const load = async (ctx: context.Context): Promise<void> => {
    return new Promise((resolve) => {
        const loader = new GLTFLoader();

        loader.load(
            '/models/ship.gltf',
            function (gltf) {
                const model = gltf.scene.getObjectByName('ship');
                model.castShadow = true;
                model.traverse((o: any) => {
                    if (o.material) {
                        console.log(o.material);
                    }
                });

                ctx.scene.add(model);
                ctx.ship = {
                    model,
                    speed: new THREE.Vector3(),
                    boundingBox: ctx.collision.createCircle(0, 0, 0.885),
                };
                reset(ctx);
                resolve();
            }
        );
    });
};

const update = (ctx: context.Context, time: number) => {
    if (!ctx.ship || !ctx.map) return;

    if (ctx.keys['KeyW']) {
        ctx.ship.speed.z += clamp(ctx.ship.speed.z, 1.0, 5.0) * 0.5 * ACCELERATION * time;
    }
    if (ctx.keys['KeyS']) {
        ctx.ship.speed.z -= clamp(ctx.ship.speed.z, 1.0, 5.0) * 0.3 * ACCELERATION * time;
    }

    if (ctx.keys['KeyD']) {
        ctx.ship.speed.x += ACCELERATION * time;
    }
    if (ctx.keys['KeyA']) {
        ctx.ship.speed.x -= ACCELERATION * time;
    }

    ctx.ship.speed.x = clamp(ctx.ship.speed.x, -0.5, 0.5);
    ctx.ship.speed.z = clamp(ctx.ship.speed.z, -2.0, 2.0);
    ctx.ship.speed.x /= 1.02;
    ctx.ship.speed.z /= 1.005;

    ctx.ship.model.position.x += ctx.ship.speed.x;
    ctx.ship.model.position.z -= ctx.ship.speed.z;
    ctx.ship.boundingBox.x = ctx.ship.model.position.x;
    ctx.ship.boundingBox.y = ctx.ship.model.position.z;
    ctx.collision.update();

    const potentials = ctx.ship.boundingBox.potentials();
    const result = ctx.collision.createResult();

    let ground = -1000.0;
    for (const blocks of potentials) {
        if (ctx.ship.boundingBox.collides(blocks, result)) {
            const collider = ctx.map[result.b.x] && ctx.map[result.b.x][result.b.y];
            if (collider) {
                if (collider.attribute === Attribute.FinishLine && result.overlap > 1.8) {
                    context.setGameState(ctx, context.GameState.Completed);
                } else if (collider.height > ctx.ship.model.position.y - 0.5) {
                    ground = Math.max(ground, collider.height);
                }
            }
        }
    }

    if (ctx.keys['Space'] && ctx.ship.model.position.y <= ground + HOVER) {
        ctx.ship.speed.y = 0.1;
    }
    ctx.ship.speed.y -= GRAVITY * time;
    ctx.ship.model.position.y += ctx.ship.speed.y;

    if (ctx.ship.model.position.y <= ground + HOVER) {
        if (ground - ctx.ship.model.position.y > 0.2) {
            context.setGameState(ctx, context.GameState.Crashed);
            ctx.gameStateEvent();
        } else {
            ctx.ship.model.position.y = ground + HOVER;
            ctx.ship.speed.y = Math.max(ctx.ship.speed.y, 0.0);
        }
    }

    if (ctx.ship.model.position.y < -20.0) {
        context.setGameState(ctx, context.GameState.Crashed);
    }
}

const reset = (ctx: context.Context) => {
    ctx.ship.model.position.x = 0.0;
    ctx.ship.model.position.y = 3.0;
    ctx.ship.model.position.z = 2.5;


    ctx.ship.speed.x = 0.0;
    ctx.ship.speed.y = 0.0;
    ctx.ship.speed.z = 0.0;
    ctx.ship.boundingBox.x = ctx.ship.model.position.x;
    ctx.ship.boundingBox.y = ctx.ship.model.position.z;
}


const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export {
    load,
    update,
    reset,
}