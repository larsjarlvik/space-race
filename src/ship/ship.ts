import * as THREE from 'three';
import * as SAT from 'sat';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Context } from 'context';
import { Exhaust } from './exhaust';

const ACCELERATION = 0.3;
const GRAVITY = 0.3;
const HOVER = 0.1;
const MAX_SPEED_X = 0.5;
const MAX_SPEED_Z = 0.5;
const DECEL_X = 1.02;
const DECEL_Z = 1.004;
const COLLIDER_Z_PAD = 1.0;
const LEAN = 4.0;
const SENSITIVITY = 1.5;

export class Ship {
    public speed: THREE.Vector3;
    public model: THREE.Object3D;
    private exhaust: Exhaust;

    constructor() {
        this.speed = new THREE.Vector3();
        this.exhaust = new Exhaust();
    }

    public async load(ctx: Context): Promise<void> {
        return new Promise((resolve) => {
            const loader = new GLTFLoader();

            loader.load('/models/ship/ship.glb', (gltf) => {
                this.model = gltf.scene.getObjectByName('ship')!;
                this.model.castShadow = true;
                this.model.visible = false;
                this.model.traverse((child: any) => {
                    child.material.map.encoding = THREE.LinearEncoding;
                    child.material.metalness = 0.5;
                    child.material.roughness = 0.5;
                });

                ctx.scene.add(this.model);
                ctx.scene.add(this.exhaust.particles);
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
    }

    public update(ctx: Context, time: number) {
        const joystick = ctx.nipple.get(ctx.nippleId);
        if (joystick && joystick.frontPosition) {
            const pos = { x: clamp(joystick.frontPosition.x / 50.0 * SENSITIVITY, -1.0, 1.0), z: clamp(-joystick.frontPosition.y / 50.0 * SENSITIVITY, -1.0, 1.0) };


            this.speed.z += clamp(this.speed.z, 1.0, 5.0) * 0.5 * ACCELERATION * pos.z * time;
            this.speed.x += ACCELERATION * pos.x * time;
        } else {
            if (ctx.keys['KeyW'] || ctx.keys['ArrowUp']) {
                this.speed.z += clamp(this.speed.z, 1.0, 8.0) * 0.5 * ACCELERATION * time;
            }
            if (ctx.keys['KeyS'] || ctx.keys['ArrowDown']) {
                this.speed.z -= clamp(this.speed.z, 1.0, 8.0) * 0.3 * ACCELERATION * time;
            }

            if (ctx.keys['KeyD'] || ctx.keys['ArrowRight']) {
                this.speed.x += ACCELERATION * time;
            }
            if (ctx.keys['KeyA'] || ctx.keys['ArrowLeft']) {
                this.speed.x -= ACCELERATION * time;
            }
        }


        this.speed.x = clamp(this.speed.x, -MAX_SPEED_X, MAX_SPEED_X);
        this.speed.z = clamp(this.speed.z, -MAX_SPEED_Z, MAX_SPEED_Z);
        this.speed.x /= DECEL_X;
        this.speed.z /= DECEL_Z;

        this.model.position.x += this.speed.x;
        this.model.position.z -= this.speed.z;

        let ground = -1000.0;
        const collider = new SAT.Circle(new SAT.Vector(this.position.x, this.position.z), 0.885);
        for (const tile of ctx.level.tiles) {
            const response = new SAT.Response();
            if (SAT.testCirclePolygon(collider, tile.collider, response)) {
                if (tile) {
                    if (tile.top > this.model.position.y - COLLIDER_Z_PAD && tile.bottom < this.model.position.y + COLLIDER_Z_PAD) {
                        ground = Math.max(ground, tile.top);

                        const action = ctx.level.attributes[tile.a];
                        if (action) action.interact(ctx, response.overlap);
                    }
                }
            }
        }

        if (this.model.position.y <= ground + HOVER) {
            if (ctx.keys['Space'] && this.model.position.y <= ground + HOVER) {
                this.speed.y = 0.1;
            }
        }

        this.speed.y -= GRAVITY * time;
        this.model.position.y += this.speed.y;

        if (this.model.position.y <= ground + HOVER) {
            if (ground - this.model.position.y > 0.2) {
                ctx.endLevel(ctx, 'Crashed!');
            } else {
                this.model.position.y = ground + HOVER;
                this.speed.y = Math.max(this.speed.y, 0.0);
            }
        }

        if (this.model.position.y < -20.0) {
            ctx.endLevel(ctx, 'Crashed!');
        }

        this.model.rotation.x = this.speed.y * LEAN;
        this.model.rotation.z = -this.speed.x * LEAN * 0.7;
        this.model.rotation.y = -this.speed.x * LEAN;

        this.exhaust.update(this.model.position, this.model.rotation, Math.max(Math.abs(this.speed.x * 0.3), this.speed.z));
    }


    get visible(): boolean {
        return this.model.visible;
    }

    set visible(visible: boolean) {
        this.exhaust.particles.visible = visible;
        this.model.visible = visible;
    }

    get position(): THREE.Vector3 {
        return this.model ? this.model.position : new THREE.Vector3();
    }
}

// TODO: utils
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
