import * as THREE from 'three';
import * as context from './context';

const tileSize = 4.0;
const planeHeight = 0.1;

export enum Attribute {
    FinishLine,
}

export interface Tile {
    height?: number;
    attribute?: Attribute;
}

export type MapData = Array<Array<Tile>>;


const downloadMap = async (map: string): Promise<string> => {
    const response = await window.fetch(`/maps/${map}.txt`, {
        method: 'GET',
    });

    return response.text();
}

const addTile = (ctx: context.Context, row: number, tile: number, type: string) => {
    const height = parseInt(type);
    const r = tileSize / 2.0;

    const x = (tile - 3.5) * tileSize + r;
    const z = row * tileSize + r;

    if (!ctx.map[x]) ctx.map[x] = [];
    if (!ctx.map[x][z]) ctx.map[x][z] = {};

    if (!isNaN(height) && height > 0.0) {
        const geometry = new THREE.BoxGeometry(tileSize - 0.1, height - (1 - planeHeight), tileSize - 0.1);
        const material = new THREE.MeshNormalMaterial();

        const mesh = new THREE.Mesh(geometry, material);
        const y = height === 1 ? -planeHeight : height / 2.0 - 0.5;

        mesh.position.set(x, y, z);
        ctx.scene.add(mesh);
        ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
        ctx.map[x][z].height = y + (height - (1 - planeHeight)) / 2.0;
    } else if (type === 'F') {
        const geometry = new THREE.BoxGeometry(tileSize - 0.1, 1.0 - (1 - planeHeight), tileSize - 0.1);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0.8, 0.0, 0.0),
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0.0, z);
        ctx.scene.add(mesh);
        ctx.collision.createPolygon(x, z, [[-r, -r], [r, -r], [r, r], [-r, r]]);
        ctx.map[x][z].height = 0.0;
        ctx.map[x][z].attribute = Attribute.FinishLine;
    }
}

const generateMap = async (ctx: context.Context) => {
    const map = await downloadMap('level-1');
    const rows = map.split('\n');

    ctx.map = [];

    rows.reverse().forEach((tiles, row) => {
        for (let i = 0; i < tiles.length; i++) {
            addTile(ctx, -row, i, tiles[i]);
        }
    });
};

export {
    generateMap,
};
