import * as THREE from 'three';
import * as detectCollisions from 'detect-collisions';
import { Context, GameState } from 'context';

const TILE_SIZE = 4.0;

export enum Attribute {
    None,
    FinishLine,
}

export interface RawTile {
    top: number;
    bottom: number;
    mesh: THREE.Mesh,
    collision: detectCollisions.Body,
}

export interface Tile {
    x: number;
    z: number;
    l: number;
    a: Attribute;
}

export class Level {
    public tiles: Tile[] = [];
    raw: RawTile[] = [];
    orm: THREE.Texture;
    normal: THREE.Texture;

    constructor() {
        const loader = new THREE.TextureLoader();
        this.orm = loader.load('/models/tile_occlusionRoughnessMetallic.png');
        this.normal = loader.load('/models/tile_normal.png');
    }

    public async list() {
        return new Promise<string[]>((resolve) => {
            fetch(`/api/map`, {
                method: 'GET',
            }).then((response) => {
                response.json().then((maps: string[]) => {
                    resolve(maps);
                });
            });
        });
    }

    public async load(ctx: Context, name: string) {
        return new Promise<void>((resolve) => {
            fetch(`/api/map?m=${name}`, {
                method: 'POST',
            }).then((response) => {
                response.json().then((tiles: Tile[]) => {
                    tiles.forEach(t => {
                        this.setTile(ctx, t.x, t.z, t.l, t.a);
                    });
                    resolve();
                });
            });
        });
    }

    public clear(ctx: Context) {
        this.deleteTile(ctx, this.tiles[0].x, this.tiles[0].z);
        if (this.tiles.length > 0) this.clear(ctx);
    }

    public update(ctx: Context) {
        this.raw.forEach(raw => {
            if (ctx.camera.position.distanceTo(raw.mesh.position) < ctx.camera.far) {
                (raw.mesh.material as THREE.MeshPhysicalMaterial).opacity += Math.max(0.002, (ctx.camera.far - ctx.camera.position.distanceTo(raw.mesh.position)) / ctx.camera.far * 0.02);
            }
        });
    }

    public show(ctx: Context) {
        this.raw.forEach(raw => {
            ctx.scene.add(raw.mesh);
            (raw.mesh.material as THREE.MeshPhysicalMaterial).opacity = 0.0;
        });
    }

    public reset(ctx: Context) {
        this.raw.forEach(raw => {
            if (raw) {
                ctx.scene.remove(raw.mesh);
            }
        });
        this.tiles = [];
        this.raw = [];
    }

    public getTile(x: number, z: number) {
        const tx = x / TILE_SIZE + 3;
        const tz = (Math.abs(z - 4) - TILE_SIZE / 2) / 4;

        const i = this.tiles.findIndex(t => t && t.x === tx && t.z === tz);
        if (i < 0) return null;

        return { tile: this.tiles[i], raw: this.raw[i] };
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

            this.tiles.push({
                x, z, a, l,
            });
            this.raw.push({
                bottom: -0.03,
                top,
                mesh,
                collision,
            });

            if (ctx.state.gameState.get() === GameState.Running) {
                ctx.scene.add(mesh);
            }
        }
    }

    private deleteTile = (ctx: Context, x: number, z: number) => {
        this.tiles.forEach((td, i) => {
            if (td.x === x && td.z === z) {
                if (this.raw[i]) {
                    ctx.scene.remove(this.raw[i].mesh);
                    ctx.collision.remove(this.raw[i].collision);
                    this.tiles.splice(i, 1);
                }
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
