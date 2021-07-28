import * as THREE from 'three';
import * as detectCollisions from 'detect-collisions';
import { Context } from 'context';

const TILE_SIZE = 4.0;

export enum Attribute {
    None,
    FinishLine,
}

export interface Tile {
    x: number;
    z: number;
    l: number;
    a: Attribute;
}

export interface TileData extends Tile {
    collision: detectCollisions.Body;
    bottom: number;
    top: number;
}

export class Level {
    public tiles: THREE.Group;
    orm: THREE.Texture;
    normal: THREE.Texture;

    constructor(ctx: Context) {
        const loader = new THREE.TextureLoader();
        this.orm = loader.load('/models/tile_occlusionRoughnessMetallic.png');
        this.normal = loader.load('/models/tile_normal.png');
        this.tiles = new THREE.Group();
        ctx.scene.add(this.tiles);
    }

    public async list() {
        return new Promise<string[]>((resolve) => {
            fetch('/api/map', {
                method: 'GET',
            }).then((response) => {
                response.json().then((maps: string[]) => {
                    resolve(maps);
                });
            });
        });
    }

    public async load(ctx: Context, name: string) {
        this.tiles.clear();

        return new Promise<void>((resolve, reject) => {
            fetch(`/api/map?m=${name}`, {
                method: 'POST',
            }).then((response) => {
                if (!response.ok) {
                    reject(response.statusText);
                }

                response.json().then((tiles: Tile[]) => {
                    tiles.forEach(t => {
                        this.setTile(ctx, t.x, t.z, t.l, t.a);
                    });
                    resolve();
                }, (err) => {
                    reject(err);
                });
            });
        });
    }

    public clear(ctx: Context) {
        this.tiles.children.forEach(r => {
            ctx.collision.remove(r.userData.collision);
        });
        this.tiles.clear();
    }

    public update(ctx: Context) {
        this.tiles.children.forEach((mesh: THREE.Mesh) => {
            if (ctx.camera.position.distanceTo(mesh.position) < ctx.camera.far) {
                (mesh.material as THREE.MeshPhysicalMaterial).opacity += Math.max(0.002, (ctx.camera.far - ctx.camera.position.distanceTo(mesh.position)) / ctx.camera.far * 0.02);
            }
        });
    }

    public getTile(x: number, z: number): THREE.Mesh | null {
        const tx = x / TILE_SIZE + 3;
        const tz = (Math.abs(z - 4) - TILE_SIZE / 2) / 4;

        const result = this.tiles.children.filter(mesh => mesh.userData.x === tx && mesh.userData.z === tz);
        return result.length > 0 ? result[0] as THREE.Mesh : null;
    }

    public setTile(ctx: Context, x: number, z: number, l: number, a: Attribute) {
        this.deleteTile(ctx, x, z);

        if (l > 0.0) {
            const r = TILE_SIZE / 2.0;
            const world_x = (x - 3.5) * TILE_SIZE + r;
            const world_z = -z * TILE_SIZE + r;

            const material = new THREE.MeshPhysicalMaterial({
                aoMap: this.orm,
                roughnessMap: this.orm,
                metalnessMap: this.orm,
                normalMap: this.normal,
                color: a === Attribute.FinishLine ? new THREE.Color(0.8, 0.0, 0.0) : new THREE.Color(0.8, 0.8, 0.8),
                transparent: true,
                opacity: 0
            });

            const top = l - 1;
            const mesh = this.createMesh(world_x, top / 2.0 + 0.025, world_z, TILE_SIZE - 0.1, top + 0.05, TILE_SIZE - 0.1, material);
            const collision = ctx.collision.createPolygon(world_x, world_z, [[-r, -r], [r, -r], [r, r], [-r, r]]);

            mesh.userData = { x, z, a, l, collision, bottom: -0.03, top };
            this.tiles.add(mesh);
        }
    }

    public getTileData(): Tile[] {
        return this.tiles.children.map(t => ({
            x: t.userData.x,
            z: t.userData.z,
            l: t.userData.l,
            a: t.userData.a,
        }));
    }

    private deleteTile(ctx: Context, x: number, z: number) {
        this.tiles.children.forEach((mesh) => {
            if (mesh.userData.x === x && mesh.userData.z === z) {
                this.tiles.remove(mesh);
                ctx.collision.remove(mesh.userData.collision);
            }
        });
    }

    private createMesh(x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(w, h, d);
        geometry.computeTangents();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.position.set(x, y, z);
        mesh.renderOrder = -1;

        return mesh;
    }
}
