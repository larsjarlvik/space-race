import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Circle } from 'detect-collisions';
import { Attribute } from '../level/level';
import { Exhaust } from './exhaust';
import { Context, GameState, KeyState } from '../context';

const ACCELERATION = 0.3;
const GRAVITY = 0.3;
const HOVER = 0.1;
const MAX_SPEED_X = 0.5;
const MAX_SPEED_Z = 0.5;
const DECEL_X = 1.02;
const DECEL_Z = 1.005;
const COLLIDER_Z_PAD = 0.5;
const LEAN = 4.0;

export class Ship {
    private speed: THREE.Vector3;
    private model: THREE.Object3D;
    private boundingBox: Circle;
    private exhaust: Exhaust;

    constructor(ctx: Context) {
        this.speed = new THREE.Vector3();
        this.exhaust = new Exhaust();
        this.boundingBox = ctx.collision.createCircle(0, 0, 0.885);
    }

    public async load(): Promise<void> {
        return new Promise((resolve) => {
            const loader = new GLTFLoader();

            loader.load('/models/ship.gltf', (gltf) => {
                this.model = gltf.scene.getObjectByName('ship');
                this.model.castShadow = true;
                resolve();
            });
        });
    }

    public reset() {
        this.model.position.x = 0.0;
        this.model.position.y = 3.0;
        this.model.position.z = 2.5;
        this.speed.x = 0.0;
        this.speed.y = 0.0;
        this.speed.z = 0.0;
        this.boundingBox.x = this.model.position.x;
        this.boundingBox.y = this.model.position.z;
    }

    public update(ctx: Context, time: number) {
        if (!this || !ctx.level) return;

        if (ctx.keys['KeyW']) {
            this.speed.z += clamp(this.speed.z, 1.0, 5.0) * 0.5 * ACCELERATION * time;
        }
        if (ctx.keys['KeyS']) {
            this.speed.z -= clamp(this.speed.z, 1.0, 5.0) * 0.3 * ACCELERATION * time;
        }

        if (ctx.keys['KeyD']) {
            this.speed.x += ACCELERATION * time;
        }
        if (ctx.keys['KeyA']) {
            this.speed.x -= ACCELERATION * time;
        }

        this.speed.x = clamp(this.speed.x, -MAX_SPEED_X, MAX_SPEED_X);
        this.speed.z = clamp(this.speed.z, -MAX_SPEED_Z, MAX_SPEED_Z);
        this.speed.x /= DECEL_X;
        this.speed.z /= DECEL_Z;

        this.model.position.x += this.speed.x;
        this.model.position.z -= this.speed.z;
        this.boundingBox.x = this.model.position.x;
        this.boundingBox.y = this.model.position.z;
        ctx.collision.update();

        const potentials = this.boundingBox.potentials();
        const result = ctx.collision.createResult();

        let ground = -1000.0;
        for (const blocks of potentials) {
            if (this.boundingBox.collides(blocks, result)) {
                const collider = ctx.level.getTile(result.b.x, result.b.y);
                if (collider) {
                    if (collider.attribute === Attribute.FinishLine && result.overlap > 1.2) {
                        ctx.setGameState(GameState.Completed);
                    } else if (collider.top > this.model.position.y - COLLIDER_Z_PAD && collider.bottom < this.model.position.y + COLLIDER_Z_PAD) {
                        ground = Math.max(ground, collider.top);
                    }
                }
            }
        }

        if (ctx.keys['Space'] === KeyState.Pressed && this.model.position.y <= ground + HOVER) {
            this.speed.y = 0.1;
        }
        this.speed.y -= GRAVITY * time;
        this.model.position.y += this.speed.y;

        if (this.model.position.y <= ground + HOVER) {
            if (ground - this.model.position.y > 0.2) {
                ctx.setGameState(GameState.Crashed);
                ctx.gameStateEvent();
            } else {
                this.model.position.y = ground + HOVER;
                this.speed.y = Math.max(this.speed.y, 0.0);
            }
        }

        if (this.model.position.y < -20.0) {
            ctx.setGameState(GameState.Crashed);
        }

        this.model.rotation.x = this.speed.y * LEAN;
        this.model.rotation.z = -this.speed.x * LEAN * 0.7;
        this.model.rotation.y = -this.speed.x * LEAN;

        this.exhaust.update(this.model.position, this.model.rotation, this.speed.z, time);
    }

    public add(ctx: Context) {
        ctx.scene.add(this.model);
        this.exhaust.add(ctx);
    }

    public remove(ctx: Context) {
        ctx.scene.add(ctx.ship.model);
        this.exhaust.remove(ctx);
    }

    get position(): THREE.Vector3 {
        return this.model.position;
    }
}

// TODO: utils
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
