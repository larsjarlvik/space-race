import * as THREE from 'three';
import * as context from './context';

const tileSize = 4.0;
const planeHeight = 0.1;

export enum Attribute {
    FinishLine,
}

export interface Tile {
    top?: number;
    bottom?: number;
    attribute?: Attribute;
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

    return mesh
};

const addTile = (ctx: context.Context, row: number, tile: number, type: string) => {
    const height = parseInt(type);
    const r = tileSize / 2.0;

    const x = (tile - 3.5) * tileSize + r;
    const z = row * tileSize + r;

    if (!ctx.map[x]) ctx.map[x] = [];
    if (!ctx.map[x][z]) ctx.map[x][z] = {};

    if (!isNaN(height) && height > 0.0) {
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0.3, 0.3, 0.3),
        });
        const y = height === 1 ? -planeHeight : height / 2.0 - 0.5;
        const mesh = createMesh(x, y, z, tileSize - 0.1, height - (1 - planeHeight), tileSize - 0.1, material);
        ctx.scene.add(mesh);

        ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
        ctx.map[x][z].bottom = y;
        ctx.map[x][z].top = y + (height - (1 - planeHeight)) / 2.0;
    } else if (type === 'F') {
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(0.8, 0.0, 0.0),
        });
        const mesh = createMesh(x, 0.0, z, tileSize - 0.1, 1.0 - (1 - planeHeight), tileSize - 0.1, material);
        ctx.scene.add(mesh);

        ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
        ctx.map[x][z].bottom = -planeHeight;
        ctx.map[x][z].top = 0.0;
        ctx.map[x][z].attribute = Attribute.FinishLine;
    }
}

const generateMap = async (ctx: context.Context) => {
    const map = await downloadMap('level-1');
    const rows = map.split('\n');

    ctx.map = [];

    rows.forEach((tiles, row) => {
        for (let i = 0; i < tiles.length; i++) {
            addTile(ctx, -row, i, tiles[i].replace(' ', '0'));
        }
    });
};

export {
    generateMap,
};
