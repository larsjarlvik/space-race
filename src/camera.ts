import * as THREE from 'three';
import { Context } from 'context';

export class Camera {
    public camera: THREE.PerspectiveCamera;
    private ambient: THREE.AmbientLight;
    private directional: THREE.DirectionalLight;

    constructor(ctx: Context) {
        this.camera = new THREE.PerspectiveCamera(90.0, window.innerWidth / window.innerHeight, 0.5, 150);

        this.ambient = new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 0.5);
        this.directional = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI);

        this.directional.castShadow = true;
        this.directional.shadow.mapSize.width = 4096;
        this.directional.shadow.mapSize.height = 4096;
        this.directional.shadow.camera.near = 0.5;
        this.directional.shadow.camera.far = 100;

        this.camera.position.y = 4.0;
        this.camera.position.z = 5.0;
        this.camera.lookAt(0, 0, -10.0);

        ctx.scene.add(this.ambient);
        ctx.scene.add(this.directional);
    }

    public resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    get position(): THREE.Vector3 {
        return this.camera.position;
    }

    set position(p: THREE.Vector3) {
        this.camera.position.z = p.z + 5.0;
        this.camera.position.x = p.x / 2.0;
        this.directional.position.set(p.x - 10.0, 10.0, p.z - 8.0);
        this.directional.target.position.set(p.x, 0.0, p.z);
        this.directional.target.updateMatrixWorld();
    }

    get far(): number {
        return this.camera.far;
    }
}