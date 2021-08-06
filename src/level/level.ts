import * as THREE from 'three';
import * as detectCollisions from 'detect-collisions';
import { Context } from 'context';
import { TileMesh } from './tile';
import * as attributes from './attributes';

const TILE_SIZE = 4.0;

export enum Attribute {
    Default = 'default',
    Jump = 'jump',
    FinishLine = 'finish',
    Speedup = 'speedup',
    Slowdown = 'slowdown'
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
    public level: THREE.Mesh;
    public attributes: { [key: string]: attributes.BaseAttribute };
    orm: THREE.Texture;
    normal: THREE.Texture;
    tiles: TileMesh[];

    constructor(ctx: Context) {
        const loader = new THREE.TextureLoader();
        this.orm = loader.load('/models/tile_occlusionRoughnessMetallic.png');
        this.normal = loader.load('/models/tile_normal.png');
        this.level = new THREE.Mesh();
        this.tiles = [];
        this.attributes = {
            [Attribute.FinishLine]: attributes.finish,
            [Attribute.Jump]: attributes.jump,
            [Attribute.Speedup]: attributes.speedup,
            [Attribute.Slowdown]: attributes.slowdown,
        };

        ctx.scene.add(this.level);
    }

    public async init() {
        for (const a in Attribute) {
            this.tiles[Attribute[a]] = new TileMesh();
            this.tiles[Attribute[a]].load(Attribute[a]);
        }
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
        this.level.clear();

        return new Promise<void>((resolve, reject) => {
            fetch(`/api/map?m=${name}`, {
                method: 'POST',
            }).then((response) => {
                if (!response.ok) {
                    reject(response.statusText);
                }

                response.json().then((tiles: Tile[]) => {
                    tiles.forEach(t => {
                        this.setTile(ctx, t.x, t.z, t.l, t.a ?? Attribute.Default);
                    });
                    resolve();
                }, (err) => {
                    reject(err);
                });
            });
        });
    }

    public clear(ctx: Context) {
        this.level.children.forEach(r => {
            ctx.collision.remove(r.userData.collision);
        });
        this.level.clear();
    }

    public update(ctx: Context) {
        this.level.children.forEach((mesh: THREE.Mesh) => {
            if (ctx.camera.position.distanceTo(mesh.position) < ctx.camera.far) {
                (mesh.material as THREE.MeshPhysicalMaterial).opacity += Math.max(0.002, (ctx.camera.far - ctx.camera.position.distanceTo(mesh.position)) / ctx.camera.far * 0.02);
            }
        });

        Object.keys(this.attributes).forEach(key => {
            const a = this.attributes[key];
            if (a.update) a.update(this.tiles[key]);
        });
    }

    public getTile(x: number, z: number): THREE.Mesh | null {
        const tx = x / TILE_SIZE + 3;
        const tz = (Math.abs(z - 4) - TILE_SIZE / 2) / 4;

        const result = this.level.children.filter(mesh => mesh.userData.x === tx && mesh.userData.z === tz);
        return result.length > 0 ? result[0] as THREE.Mesh : null;
    }

    public setTile(ctx: Context, x: number, z: number, l: number, a: Attribute) {
        this.deleteTile(ctx, x, z);

        if (l > 0.0) {
            const r = TILE_SIZE / 2.0;
            const world_x = (x - 3.5) * TILE_SIZE + r;
            const world_z = -z * TILE_SIZE + r;

            const top = l - 1;
            const mesh = this.tiles[a].createMesh(world_x, top / 2.0 + 0.025, world_z, TILE_SIZE - 0.1, top + 0.05);
            const collision = ctx.collision.createPolygon(world_x, world_z, [[-r, -r], [r, -r], [r, r], [-r, r]]);

            mesh.userData = { x, z, a, l, collision, bottom: -0.03, top };
            this.level.add(mesh);
        }
    }

    public getTileData(): Tile[] {
        return this.level.children.map(t => ({
            x: t.userData.x,
            z: t.userData.z,
            l: t.userData.l,
            a: t.userData.a,
        }));
    }

    private deleteTile(ctx: Context, x: number, z: number) {
        this.level.children.forEach((mesh) => {
            if (mesh.userData.x === x && mesh.userData.z === z) {
                this.level.remove(mesh);
                ctx.collision.remove(mesh.userData.collision);
            }
        });
    }
}
