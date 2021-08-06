import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const TILE_SIZE = 3.9;
const SIDE_DAMPING = 0.75;

export class TileMesh {
    public model: THREE.Mesh;
    sideMaterial: THREE.Material;

    public async load(type: string): Promise<void> {
        return new Promise((resolve) => {
            const loader = new GLTFLoader();

            loader.load(`/models/tiles/${type}.glb`, (gltf) => {
                this.model = gltf.scene.getObjectByName('tile')! as THREE.Mesh;
                this.model.castShadow = false;
                this.model.receiveShadow = true;

                const material = this.model.material as THREE.MeshPhysicalMaterial;
                if (material.map) material.map.encoding = THREE.LinearEncoding;
                material.reflectivity = 0.0;
                material.roughness = 0.5;
                material.metalness = 0.5;
                material.emissiveIntensity = 1.2;

                this.sideMaterial = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(material.color.r * SIDE_DAMPING, material.color.g * SIDE_DAMPING, material.color.b * SIDE_DAMPING),
                });

                resolve();
            });
        });
    }

    public createMesh(x: number, y: number, z: number, w: number, h: number): THREE.Object3D {
        const geom = new THREE.PlaneGeometry(w, h);

        const front = geom.clone().applyMatrix4(new THREE.Matrix4().setPosition(0.0, -h / 2.0, TILE_SIZE / 2.0));
        const back = geom.clone().applyMatrix4(new THREE.Matrix4().setPosition(0.0, -h / 2.0, -TILE_SIZE / 2.0));
        const right = geom.clone().applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2.0).setPosition(TILE_SIZE / 2.0, -h / 2.0, 0.0));
        const left = geom.clone().applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2.0).setPosition(-TILE_SIZE / 2.0, -h / 2.0, 0.0));

        const sides = BufferGeometryUtils.mergeBufferGeometries([front, back, right, left]);
        sides.computeTangents();

        const mesh = this.model.clone();
        mesh.receiveShadow = true;
        mesh.position.set(x, y + h / 2.0, z);
        mesh.renderOrder = -1;
        mesh.add(new THREE.Mesh(sides, this.sideMaterial));
        return mesh;
    }
}