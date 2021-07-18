import * as THREE from 'three';
import { Context } from '../context';

const PARTICLE_SPREAD = 0.16;
const PARTICLE_X = 0.15;
const PARTICLE_Y = 0.25;
const PARTICLE_Z = 0.78;
const PARTICLE_COUNT = 3000;

export class Exhaust {
    private particles: THREE.Points;

    constructor() {
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

        this.particles = new THREE.Points(geometry, material);
        this.particles.frustumCulled = false;
    }

    public update(position: THREE.Vector3, rotation: THREE.Euler, speed: number, time: number) {
        const geom = this.particles.geometry;

        for (let i = 0, l = PARTICLE_COUNT; i < l; i++) {
            if (this.particles.geometry.getAttribute('startTime').getX(i) < performance.now() - geom.getAttribute('lifeTime').getX(i)) {
                const rand = Math.random() < 0.5;
                const angle = Math.random() * Math.PI * 2;

                const vec = new THREE.Vector3(
                    (rand ? PARTICLE_X : -PARTICLE_X) + (Math.cos(angle) * (PARTICLE_SPREAD / 2.0) * Math.random()),
                    PARTICLE_Y + (Math.sin(angle) * (PARTICLE_SPREAD / 2.0) * Math.random()),
                    PARTICLE_Z,
                );

                const dist = PARTICLE_SPREAD - Math.sqrt(vec.x * vec.x + vec.y * vec.y);
                vec.applyEuler(rotation);

                this.particles.geometry.attributes.position.setXYZ(i, position.x + vec.x, position.y + vec.y, position.z + vec.z);
                geom.getAttribute('startTime').setX(i, performance.now());
                geom.getAttribute('velocity').setX(i, Math.random() * Math.max(0.0, speed) * 3000.0 * dist);
            }

            geom.attributes.position.setZ(i, geom.attributes.position.getZ(i) - geom.getAttribute('velocity').getX(i) * time);
        }

        geom.getAttribute('startTime').needsUpdate = true;
        geom.getAttribute('velocity').needsUpdate = true;
        geom.attributes.position.needsUpdate = true;
    }

    public add(ctx: Context) {
        ctx.scene.add(this.particles);
    }

    public remove(ctx: Context) {
        ctx.scene.remove(this.particles);
    }
}
