import { Context } from 'context';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const TILE_SIZE = 3.9;
const SIDE_DAMPING = 0.75;

export class TileMesh {
    sideMaterial: THREE.Material;
    sidesGeometry: THREE.BufferGeometry;
    topMaterial: THREE.MeshPhysicalMaterial;
    topModel: THREE.Mesh;
    count: number;

    public top: THREE.InstancedMesh;
    public sides: THREE.InstancedMesh;

    public async load(ctx: Context, type: string): Promise<void> {
        return new Promise((resolve) => {
            const loader = new GLTFLoader();

            loader.load(`/models/tiles/${type}.glb`, (gltf) => {
                this.topModel = gltf.scene.getObjectByName('tile')! as THREE.Mesh;
                this.topModel.castShadow = false;
                this.topModel.receiveShadow = true;

                this.topMaterial = this.topModel.material as THREE.MeshPhysicalMaterial;
                if (this.topMaterial.map) this.topMaterial.map.encoding = THREE.LinearEncoding;
                this.topMaterial.reflectivity = 0.0;
                this.topMaterial.roughness = 0.5;
                this.topMaterial.metalness = 0.5;
                this.topMaterial.emissiveIntensity = 1.2;

                this.sideMaterial = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(this.topMaterial.color.r * SIDE_DAMPING, this.topMaterial.color.g * SIDE_DAMPING, this.topMaterial.color.b * SIDE_DAMPING),
                });

                const geom = new THREE.PlaneGeometry(TILE_SIZE, 1.0);
                const front = geom.clone().applyMatrix4(new THREE.Matrix4().setPosition(0.0, 0.0, TILE_SIZE / 2.0));
                const back = geom.clone().applyMatrix4(new THREE.Matrix4().setPosition(0.0, 0.0, -TILE_SIZE / 2.0));
                const right = geom.clone().applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2.0).setPosition(TILE_SIZE / 2.0, 0.0, 0.0));
                const left = geom.clone().applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2.0).setPosition(-TILE_SIZE / 2.0, 0.0, 0.0));

                this.sidesGeometry = BufferGeometryUtils.mergeBufferGeometries([front, back, right, left]);
                this.sidesGeometry.computeTangents();

                this.clear(ctx);
                resolve();
            });
        });
    }

    public addTile(pos: THREE.Vector3, height: number): number {
        this.top.setMatrixAt(this.count, new THREE.Matrix4().setPosition(pos.x, pos.y + height / 2.0, pos.z));
        this.top.instanceMatrix.needsUpdate = true;

        this.sides.setMatrixAt(this.count, new THREE.Matrix4().scale(new THREE.Vector3(1.0, height, 1.0)).setPosition(pos.x, pos.y, pos.z));
        this.sides.instanceMatrix.needsUpdate = true;

        this.count++;
        return this.count - 1;
    }

    public removeTile(index: number) {
        this.top.setMatrixAt(index, new THREE.Matrix4().scale(new THREE.Vector3(0.0)));
        this.sides.setMatrixAt(index, new THREE.Matrix4().scale(new THREE.Vector3(0.0)));
        this.top.instanceMatrix.needsUpdate = true;
        this.sides.instanceMatrix.needsUpdate = true;
    }

    public clear(ctx: Context) {
        ctx.scene.remove(this.top);
        ctx.scene.remove(this.sides);

        this.sides = new THREE.InstancedMesh(this.sidesGeometry, this.sideMaterial, 500);
        this.top = new THREE.InstancedMesh(this.topModel.geometry, this.topMaterial, 500);
        this.top.receiveShadow = true;
        this.top.position.set(0.0, 0.0, 0.0);
        this.top.renderOrder = -1;
        this.count = 0;
        ctx.scene.add(this.top);
        ctx.scene.add(this.sides);
    }
}