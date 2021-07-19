import * as THREE from 'three';
import { Context } from 'context';

const TILE_SIZE = 4.0;

export enum Attribute {
    FinishLine,
}

export interface Tile {
    x: number;
    z: number;
    l: number;
    a?: Attribute;
}

export interface RawTile {
    top: number;
    bottom: number;
    attribute?: Attribute;
    mesh: THREE.Mesh,
}

export type RawTiles = Array<Array<RawTile>>;

export class Level {
    private data: RawTiles;
    public tiles: Tile[];

    public async load(ctx: Context, name: string) {
        await this.setSkyBox(ctx);

        const mapString = await this.downloadMap(name);
        const rows = mapString.split('\n');
        this.tiles = [];

        rows.forEach((row, z) => {
            for (let x = 0; x < row.length; x++) {
                const l = parseInt(row[x]);
                if (!isNaN(l) && l > 0.0) {
                    this.tiles.push({ x, z, l });
                } else if (row[x] === 'F') {
                    this.tiles.push({ x, z, l: 1, a: Attribute.FinishLine });
                }
            }
        });

        this.tiles.forEach(t => {
            this.addTile(ctx, t);
        });
        debugger;
    }

    public clear(ctx: Context) {
        this.data.forEach(t => {
            t.forEach(t => {
                ctx.scene.remove(t.mesh);
            });
        });
    }

    public update(ctx: Context) {
        if (!this.data) return;

        for (let z = 0; z < this.data.length; z++) {
            for (let x = 0; x < 7; x++) {
                if (this.data[z] && this.data[z][x] && this.data[z][x].mesh) {
                    if (ctx.camera.position.distanceTo(this.data[z][x].mesh.position) < ctx.camera.far) {
                        (this.data[z][x].mesh.material as THREE.MeshPhongMaterial).opacity += Math.max(0.002, (ctx.camera.far - ctx.camera.position.distanceTo(this.data[z][x].mesh.position)) / ctx.camera.far * 0.02);
                    }
                }
            }
        }
    }

    public reset() {
        for (let z = 0; z < this.data.length; z++) {
            for (let x = 0; x < 7; x++) {
                if (this.data[z] && this.data[z][x] && this.data[z][x].mesh) {
                    (this.data[z][x].mesh.material as THREE.MeshPhongMaterial).opacity = 0.0;
                }
            }
        }
    }

    public getTile(x: number, z: number) {
        const tx = x / TILE_SIZE + 3;
        const tz = (Math.abs(z - 4) - TILE_SIZE / 2) / 4;

        if (this.data[tz] && this.data[tz][tx]) {
            return this.data[tz][tx];
        }

        return null;
    }

    public addTile(ctx: Context, t: Tile) {
        const r = TILE_SIZE / 2.0;

        const x = (t.x - 3.5) * TILE_SIZE + r;
        const z = -t.z * TILE_SIZE + r;

        this.deleteTile(ctx, t.z, t.x);

        if (t.l > 0.0) {
            const material = new THREE.MeshPhongMaterial({
                color: t.a === Attribute.FinishLine ? new THREE.Color(0.8, 0.0, 0.0) : new THREE.Color(0.3, 0.3, 0.3),
                transparent: true,
                opacity: 0
            });
            const h = t.l - 1;
            const mesh = this.createMesh(x, h / 2.0 + 0.025, z, TILE_SIZE - 0.1, h + 0.05, TILE_SIZE - 0.1, material);
            ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
            this.createTile(t.z, t.x, {
                bottom: -0.03,
                top: h,
                mesh,
                attribute: t.a,
            });
            ctx.scene.add(mesh);
        }
    }

    private createTile = (z: number, x: number, data: RawTile) => {
        if (!this.data) this.data = [];
        if (!this.data[z]) this.data[z] = [];
        this.data[z][x] = data;
    }

    private deleteTile = (ctx: Context, z: number, x: number) => {
        if (!this.data || !this.data[z] || !this.data[z][x]) return;
        ctx.scene.remove(this.data[z][x].mesh);
        delete this.data[z][x];
    }

    private async downloadMap(map: string): Promise<string> {
        const response = await window.fetch(`/maps/${map}.txt`, {
            method: 'GET',
        });

        return response.text();
    }

    private createMesh(x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(w, h, d);
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        mesh.position.set(x, y, z);
        mesh.renderOrder = -1;

        return mesh;
    }

    private async setSkyBox(ctx: Context): Promise<void> {
        return new Promise((resolve) => {
            const loader = new THREE.CubeTextureLoader();
            loader.load([
                '/skybox/right.jpg',
                '/skybox/left.jpg',
                '/skybox/top.jpg',
                '/skybox/bottom.jpg',
                '/skybox/front.jpg',
                '/skybox/back.jpg',
            ], (texture) => {
                texture.mapping = THREE.CubeReflectionMapping;
                ctx.scene.background = texture;
                ctx.scene.environment = texture;
                resolve();
            });
        });
    }
}
