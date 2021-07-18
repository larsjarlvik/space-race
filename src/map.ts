import * as THREE from 'three';
import * as context from './context';

export const tileSize = 4.0;
const planeHeight = 0.1;
const startElev = -100;

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

const downloadMap = async (map: string): Promise<string> => {
    const response = await window.fetch(`/maps/${map}.txt`, {
        method: 'GET',
    });

    return response.text();
}

const createMesh = (x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(w, h, d);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.position.set(x, y, z);
    mesh.renderOrder = -1;

    return mesh
};

const addTile = (ctx: context.Context, numRows: number, row: number, tile: number, type: string) => {
    const height = parseInt(type);
    const r = tileSize / 2.0;

    const x = (tile - 3.5) * tileSize + r;
    const z = -row * tileSize + r;

    if (!isNaN(height) && height > 0.0) {
        const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.3, 0.3, 0.3), transparent: true, opacity: 0 });
        const h = height - 1;
        const mesh = createMesh(x, h / 2.0 + 0.025, z, tileSize - 0.1, h + 0.05, tileSize - 0.1, material);
        ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
        ctx.map[row][tile].top = h;
        ctx.map[row][tile].bottom = -0.05;
        ctx.map[row][tile].mesh = mesh;
        ctx.scene.add(mesh);
    } else if (type === 'F') {
        const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.8, 0.0, 0.0), transparent: true, opacity: 0 });
        const mesh = createMesh(x, 0.0, z, tileSize - 0.1, 1.0 - (1 - planeHeight), tileSize - 0.1, material);
        ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
        ctx.map[row][tile].bottom = -planeHeight;
        ctx.map[row][tile].top = 0.0;
        ctx.map[row][tile].attribute = Attribute.FinishLine;
        ctx.map[row][tile].mesh = mesh;
        ctx.scene.add(mesh);
    }
}

const generateMap = async (ctx: context.Context) => {
    const map = await downloadMap('level-1');
    const rows = map.split('\n');

    ctx.map = [];

    rows.forEach((tiles, row) => {
        ctx.map[row] = [];

        for (let tile = 0; tile < 7; tile++) {
            ctx.map[row][tile] = {};
            addTile(ctx, rows.length, row, tile, (tiles[tile] !== undefined ? tiles[tile] : '0').replace(' ', '0'));
        }
    });

    console.log(ctx.map);
};

const update = (ctx: context.Context) => {
    if (!ctx.map) return;

    for (let z = 0; z < ctx.map.length; z++) {
        for (let x = 0; x < 7; x++) {
            if (ctx.map[z] && ctx.map[z][x] && ctx.map[z][x].mesh) {
                const center = (ctx.map[z][x].top - ctx.map[z][x].bottom) / 2.0;
                if (ctx.camera.position.distanceTo(ctx.map[z][x].mesh.position) < ctx.camera.far) {
                    (ctx.map[z][x].mesh.material as THREE.MeshPhongMaterial).opacity += Math.max(0.002, (ctx.camera.far - ctx.camera.position.distanceTo(ctx.map[z][x].mesh.position)) / ctx.camera.far * 0.02);
                }
            }
        }
    }
};

const reset = (ctx: context.Context) => {
    for (let z = 0; z < ctx.map.length; z++) {
        for (let x = 0; x < 7; x++) {
            if (ctx.map[z] && ctx.map[z][x] && ctx.map[z][x].mesh) {
                (ctx.map[z][x].mesh.material as THREE.MeshPhongMaterial).opacity = 0.0;
            }
        }
    }

};

export {
    generateMap,
    update,
    reset,
};
