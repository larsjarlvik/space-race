import * as THREE from 'three';
import * as context from './context';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Circle } from 'detect-collisions';
import { Attribute } from './map';

// Meter per second
const ACCELERATION = 0.3;
const GRAVITY = 0.3;
const HOVER = 0.1;
const PARTICLE_SPREAD = 0.16;
const PARTICLE_X = 0.15;
const PARTICLE_Y = 0.25;
const PARTICLE_Z = 0.78;
const PARTICLE_COUNT = 3000;

export interface Ship {
    speed: THREE.Vector3;
    model: THREE.Object3D;
    boundingBox: Circle;
    particles?: THREE.Points;
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

                ctx.ship = {
                    model,
                    speed: new THREE.Vector3(),
                    boundingBox: ctx.collision.createCircle(0, 0, 0.885),
                };
                reset(ctx);
                exhaust(ctx);
                resolve();
            }
        );
    });
};


const exhaust = (ctx: context.Context) => {
    const geometry = new THREE.BufferGeometry();
    const textureLoader = new THREE.TextureLoader();
    const sprite = textureLoader.load('/models/exhaust.png');

    const vertices = [];
    const startTime = [];
    const lifeTime = [];
    const velocity = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const x = Math.random() * PARTICLE_SPREAD - (PARTICLE_SPREAD / 2.0);
        const y = Math.random() * PARTICLE_SPREAD - (PARTICLE_SPREAD / 2.0);
        const z = 0.0;

        velocity.push(Math.random() * 5.0);
        vertices.push(x, y, z);
        startTime.push(performance.now());
        lifeTime.push(Math.random());
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('startTime', new THREE.Float32BufferAttribute(startTime, 1));
    geometry.setAttribute('lifeTime', new THREE.Float32BufferAttribute(lifeTime, 1));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocity, 1));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        map: sprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        color: new THREE.Color(0.066, 0.39, 0.75),
    });

    const particles = new THREE.Points(geometry, material);
    particles.frustumCulled = false;
    ctx.ship.particles = particles;
};

const updateExhaust = (ctx: context.Context, time: number) => {
    const sp = ctx.ship.model.position;
    const p = ctx.ship.particles;

    for (let i = 0, l = PARTICLE_COUNT; i < l; i++) {
        if (p.geometry.getAttribute('startTime').getX(i) < performance.now() - p.geometry.getAttribute('lifeTime').getX(i)) {
            const rand = Math.random() < 0.5;

            const angle = Math.random() * Math.PI * 2;

            const vec = new THREE.Vector3(
                (rand ? PARTICLE_X : -PARTICLE_X) + (Math.cos(angle) * (PARTICLE_SPREAD / 2.0) * Math.random()),
                PARTICLE_Y + (Math.sin(angle) * (PARTICLE_SPREAD / 2.0) * Math.random()),
                PARTICLE_Z,
            );

            const dist = PARTICLE_SPREAD - Math.sqrt(vec.x * vec.x + vec.y * vec.y);
            vec.applyEuler(ctx.ship.model.rotation);

            p.geometry.attributes.position.setXYZ(i, sp.x + vec.x, sp.y + vec.y, sp.z + vec.z);
            p.geometry.getAttribute('startTime').setX(i, performance.now());
            p.geometry.getAttribute('velocity').setX(i, Math.random() * Math.max(0.0, ctx.ship.speed.z) * 3000.0 * dist);
        }

        p.geometry.attributes.position.setZ(i, p.geometry.attributes.position.getZ(i) - p.geometry.getAttribute('velocity').getX(i) * time);
    }

    p.geometry.getAttribute('startTime').needsUpdate = true;
    p.geometry.getAttribute('velocity').needsUpdate = true;
    p.geometry.attributes.position.needsUpdate = true;
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
                if (collider.attribute === Attribute.FinishLine && result.overlap > 1.2) {
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

    ctx.ship.model.rotation.x = ctx.ship.speed.y * 4.0;
    ctx.ship.model.rotation.z = -ctx.ship.speed.x * 3.0;
    ctx.ship.model.rotation.y = -ctx.ship.speed.x * 3.0;

    updateExhaust(ctx, time);
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