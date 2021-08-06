import * as THREE from 'three';
import * as SAT from 'sat';
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
    position: THREE.Vector3;
    bottom: number;
    top: number;
    index: number;
    collider: SAT.Polygon;
}

export class Level {
    public tiles: TileData[];
    public attributes: { [key: string]: attributes.BaseAttribute };
    orm: THREE.Texture;
    normal: THREE.Texture;
    meshes: TileMesh[];

    constructor(ctx: Context) {
        const loader = new THREE.TextureLoader();
        this.orm = loader.load('/models/tile_occlusionRoughnessMetallic.png');
        this.normal = loader.load('/models/tile_normal.png');
        this.tiles = [];
        this.attributes = {
            [Attribute.FinishLine]: attributes.finish,
            [Attribute.Jump]: attributes.jump,
            [Attribute.Speedup]: attributes.speedup,
            [Attribute.Slowdown]: attributes.slowdown,
        };

        this.meshes = [];
        for (const a in Attribute) {
            this.meshes[Attribute[a]] = new TileMesh();
            this.meshes[Attribute[a]].load(ctx, Attribute[a]);
        }
    }

    public async list() {
        return new Promise<string[]>((resolve) => {
            fetch('/api/map', { method: 'GET' }).then((response) => {
                response.json().then((maps: string[]) => {
                    resolve(maps);
                });
            });
        });
    }

    public async load(ctx: Context, name: string) {
        this.clear(ctx);

        return new Promise<void>((resolve, reject) => {
            fetch(`/api/map?m=${name}`, { method: 'GET' }).then((response) => {
                if (!response.ok) {
                    reject(response.statusText);
                }

                response.json().then((tiles: Tile[]) => {
                    tiles.forEach(t => { this.setTile(t.x, t.z, t.l, t.a ?? Attribute.Default); });
                    this.show();
                    resolve();
                }, (err) => {
                    reject(err);
                });
            });
        });
    }

    public clear(ctx: Context) {
        Object.keys(this.meshes).forEach(key => {
            (this.meshes[key] as TileMesh).clear(ctx);
        });
        this.tiles = [];
    }

    public update() {
        Object.keys(this.attributes).forEach(key => {
            const a = this.attributes[key];
            if (a.update) a.update(this.meshes[key]);
        });
    }

    public getTile(x: number, z: number): TileData | null {
        const tx = x / TILE_SIZE + 3;
        const tz = (Math.abs(z - 4) - TILE_SIZE / 2) / 4;

        const result = this.tiles.filter(t => t.x === tx && t.z === tz);
        return result.length > 0 ? result[0] : null;
    }

    public setTile(x: number, z: number, l: number, a: Attribute) {
        this.deleteTile(x, z);

        if (l > 0.0) {
            const r = TILE_SIZE / 2.0;
            const top = l - 1;

            const position = new THREE.Vector3(
                (x - 3.5) * TILE_SIZE + r,
                top / 2.0 + 0.025,
                -z * TILE_SIZE + r,
            );

            const index = (this.meshes[a] as TileMesh).addTile(position, top + 0.05);
            const collider = new SAT.Box(new SAT.Vector(position.x - TILE_SIZE / 2.0, position.z - TILE_SIZE / 2.0), TILE_SIZE, TILE_SIZE).toPolygon();
            this.tiles.push({ x, z, a, l, bottom: -0.03, top, position: position, index, collider });
        }
    }

    public getTileData(): Tile[] {
        return this.tiles.map(t => ({
            x: t.x,
            z: t.z,
            l: t.l,
            a: t.a,
        } as Tile));
    }

    private deleteTile(x: number, z: number) {
        this.tiles = this.tiles.filter(t => {
            if (t.x === x && t.z === z) {
                (this.meshes[t.a] as TileMesh).removeTile(t.index);
                return false;
            }

            return true;
        });
    }

    public hide() {
        this.meshes.forEach(t => {
            t.top.visible = false;
            t.sides.visible = false;
        });
    }

    public show() {
        this.meshes.forEach(t => {
            t.top.visible = true;
            t.sides.visible = true;
        });
    }
}
