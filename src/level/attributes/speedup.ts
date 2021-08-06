import * as THREE from 'three';
import { BaseAttribute } from '.';
import { Context } from 'context';
import { TileMesh } from 'level/tile';

export const speedup = {
    interact: (ctx: Context, overlap: number) => {
        if (overlap > 1.5) ctx.ship.speed.z += 0.008;
    },
    update: (tile: TileMesh) => {
        const material = tile.top.material as THREE.MeshPhysicalMaterial;
        material.emissiveIntensity = Math.sin(performance.now() * 0.008) * 0.5 + 1.5;
    },
    editorColor: '#0f0',
} as BaseAttribute;