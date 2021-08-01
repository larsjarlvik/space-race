import * as THREE from 'three';
import { Context } from 'context';

export class Camera {
    public camera: THREE.PerspectiveCamera;
    public ambient: THREE.AmbientLight;
    public directional: THREE.DirectionalLight;

    constructor(ctx: Context) {
        this.camera = new THREE.PerspectiveCamera(75.0, window.innerWidth / window.innerHeight, 0.5, 130);

        this.ambient = new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 1.2);
        this.directional = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI);

        const size = 1 << 31 - Math.clz32(Math.max(window.innerWidth, window.innerHeight));

        this.directional.castShadow = true;
        this.directional.shadow.mapSize.width = size;
        this.directional.shadow.mapSize.height = size;
        this.directional.shadow.camera.near = 10.0;
        this.directional.shadow.camera.far = 25.0;
        this.directional.shadow.camera.bottom = -1.5;
        this.directional.shadow.camera.top = 1.5;
        this.directional.shadow.camera.left = -1.5;
        this.directional.shadow.camera.right = 1.5;
        this.directional.shadow.radius = 5.0;

        this.camera.position.y = 4.0;
        this.camera.position.z = 5.0;
        this.camera.lookAt(0, 0, -10.0);

        ctx.scene.add(this.ambient);
        ctx.scene.add(this.directional);
        ctx.scene.add(this.camera);
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
    }

    get far(): number {
        return this.camera.far;
    }
}