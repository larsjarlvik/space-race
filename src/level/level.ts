import * as THREE from 'three';
import { Context } from 'context';

const TILE_SIZE = 4.0;
const PLANE_HEIGHT = 0.1;

export enum Attribute {
    FinishLine,
}

export interface Tile {
    top?: number;
    bottom?: number;
    attribute?: Attribute;
    mesh?: THREE.Mesh,
}

export type MapData = Array<Array<Tile>>;

export class Level {
    private tiles: MapData;

    public async load(ctx: Context, name: string) {
        await this.setSkyBox(ctx);

        const data = await this.downloadMap(name);
        const rows = data.split('\n');
        this.tiles = [];

        rows.forEach((tiles, row) => {
            this.tiles[row] = [];

            for (let tile = 0; tile < 7; tile++) {
                this.tiles[row][tile] = {};
                this.addTile(ctx, rows.length, row, tile, (tiles[tile] !== undefined ? tiles[tile] : '0').replace(' ', '0'));
            }
        });
    }

    public update(ctx: Context) {
        if (!this.tiles) return;

        for (let z = 0; z < this.tiles.length; z++) {
            for (let x = 0; x < 7; x++) {
                if (this.tiles[z] && this.tiles[z][x] && this.tiles[z][x].mesh) {
                    if (ctx.camera.position.distanceTo(this.tiles[z][x].mesh.position) < ctx.camera.far) {
                        (this.tiles[z][x].mesh.material as THREE.MeshPhongMaterial).opacity += Math.max(0.002, (ctx.camera.far - ctx.camera.position.distanceTo(this.tiles[z][x].mesh.position)) / ctx.camera.far * 0.02);
                    }
                }
            }
        }
    }

    public reset() {
        for (let z = 0; z < this.tiles.length; z++) {
            for (let x = 0; x < 7; x++) {
                if (this.tiles[z] && this.tiles[z][x] && this.tiles[z][x].mesh) {
                    (this.tiles[z][x].mesh.material as THREE.MeshPhongMaterial).opacity = 0.0;
                }
            }
        }
    }

    public getTile(x: number, z: number) {
        const tx = x / TILE_SIZE + 3;
        const tz = (Math.abs(z - 4) - TILE_SIZE / 2) / 4;

        if (this.tiles[tz] && this.tiles[tz][tx]) {
            return this.tiles[tz][tx];
        }

        return null;
    }

    private addTile(ctx: Context, numRows: number, row: number, tile: number, type: string) {
        const height = parseInt(type);
        const r = TILE_SIZE / 2.0;

        const x = (tile - 3.5) * TILE_SIZE + r;
        const z = -row * TILE_SIZE + r;

        if (!isNaN(height) && height > 0.0) {
            const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.3, 0.3, 0.3), transparent: true, opacity: 0 });
            const h = height - 1;
            const mesh = this.createMesh(x, h / 2.0 + 0.025, z, TILE_SIZE - 0.1, h + 0.05, TILE_SIZE - 0.1, material);
            ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
            this.tiles[row][tile].top = h;
            this.tiles[row][tile].bottom = -0.05;
            this.tiles[row][tile].mesh = mesh;
            ctx.scene.add(mesh);
        } else if (type === 'F') {
            const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.8, 0.0, 0.0), transparent: true, opacity: 0 });
            const mesh = this.createMesh(x, 0.0, z, TILE_SIZE - 0.1, 1.0 - (1 - PLANE_HEIGHT), TILE_SIZE - 0.1, material);
            ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
            this.tiles[row][tile].bottom = -PLANE_HEIGHT;
            this.tiles[row][tile].top = 0.0;
            this.tiles[row][tile].attribute = Attribute.FinishLine;
            this.tiles[row][tile].mesh = mesh;
            ctx.scene.add(mesh);
        }
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
