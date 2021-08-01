import { Context } from 'context';
import * as THREE from 'three';

export class Skybox {
    private rot = 0.0;

    public async load(ctx: Context, name: string): Promise<void> {
        return new Promise((resolve) => {
            const loader = new THREE.CubeTextureLoader();
            loader.load([
                `/${name}/right.webp`,
                `/${name}/left.webp`,
                `/${name}/top.webp`,
                `/${name}/bottom.webp`,
                `/${name}/front.webp`,
                `/${name}/back.webp`,
            ], (texture) => {
                texture.mapping = THREE.CubeReflectionMapping;
                ctx.scene.background = texture;
                ctx.scene.environment = texture;
                ctx.scene.environment.encoding = THREE.LinearEncoding;
                resolve();
            });
        });
    }

    public update(ctx: Context) {
        ctx.scene.rotation.set(this.rot, this.rot, Math.sin(this.rot), 'YXZ');
        this.rot += 0.0001;
    }
}
