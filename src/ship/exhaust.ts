import * as THREE from 'three';

const PARTICLE_SPREAD = 0.16;
const PARTICLE_X = 0.15;
const PARTICLE_Y = 0.25;
const PARTICLE_Z = 0.78;
const PARTICLE_COUNT = 1000;
const PARTICLE_LIFETIME = 20;

export class Exhaust {
    public particles: THREE.Points;

    constructor() {
        const geometry = new THREE.BufferGeometry();
        const textureLoader = new THREE.TextureLoader();
        const sprite = textureLoader.load('/models/ship/exhaust.png');

        const vertices: number[] = [];
        const startTime: number[] = [];
        const lifeTime: number[] = [];
        const velocity: number[] = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const x = Math.random() * PARTICLE_SPREAD - (PARTICLE_SPREAD / 2.0);
            const y = Math.random() * PARTICLE_SPREAD - (PARTICLE_SPREAD / 2.0);
            const z = 0.0;

            velocity.push(0.0, 0.0, 0.0);
            vertices.push(x, y, z);
            startTime.push(performance.now());
            lifeTime.push(Math.random() * PARTICLE_LIFETIME);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('startTime', new THREE.Float32BufferAttribute(startTime, 1));
        geometry.setAttribute('lifeTime', new THREE.Float32BufferAttribute(lifeTime, 1));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocity, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            map: sprite,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            color: new THREE.Color(0.066, 0.39, 0.75),
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.frustumCulled = false;
        this.particles.visible = false;
    }

    public update(position: THREE.Vector3, rotation: THREE.Euler, speed: number) {
        const geom = this.particles.geometry;

        for (let i = 0, l = PARTICLE_COUNT; i < l; i++) {
            geom.attributes.position.setX(i, geom.attributes.position.getX(i) - geom.attributes.velocity.getX(i));
            geom.attributes.position.setY(i, geom.attributes.position.getY(i) - geom.attributes.velocity.getY(i));
            geom.attributes.position.setZ(i, Math.max(position.z + PARTICLE_Z, geom.attributes.position.getZ(i) + geom.attributes.velocity.getZ(i)));

            if (geom.attributes.startTime.getX(i) < performance.now() - geom.attributes.lifeTime.getX(i)) {
                const rand = Math.random() < 0.5;
                const angle = Math.random() * Math.PI * 2;

                const vec = new THREE.Vector3(
                    (rand ? PARTICLE_X : -PARTICLE_X) + (Math.cos(angle) * (PARTICLE_SPREAD / 2.0) * Math.random()),
                    PARTICLE_Y + (Math.sin(angle) * (PARTICLE_SPREAD / 2.0) * Math.random()),
                    PARTICLE_Z,
                );

                const dist = PARTICLE_SPREAD - Math.sqrt(vec.x * vec.x + vec.y * vec.y);
                vec.applyEuler(rotation);

                this.particles.geometry.attributes.position.setXYZ(i, position.x + vec.x, position.y + vec.y, position.z + vec.z + (Math.random() - 0.1) * speed * 2.0);

                const v = new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, Math.random() * 0.15 * dist);
                v.applyEuler(rotation);

                geom.attributes.velocity.setX(i, v.x);
                geom.attributes.velocity.setY(i, v.y);
                geom.attributes.velocity.setZ(i, v.z);
                geom.attributes.startTime.setX(i, performance.now());
                geom.attributes.lifeTime.setX(i, Math.random() * PARTICLE_LIFETIME);
                geom.attributes.position.needsUpdate = true;
                geom.attributes.velocity.needsUpdate = true;
                geom.attributes.lifeTime.needsUpdate = true;
            }
        }

        geom.getAttribute('startTime').needsUpdate = true;
        geom.attributes.startTime.needsUpdate = true;
    }
}
