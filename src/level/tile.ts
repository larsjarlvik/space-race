import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
        geom.computeTangents();

        const frontMesh = new THREE.Mesh(geom, this.sideMaterial);
        frontMesh.position.set(0.0, -h / 2.0, TILE_SIZE / 2.0);

        const backMesh = new THREE.Mesh(geom, this.sideMaterial);
        backMesh.position.set(0.0, -h / 2.0, -TILE_SIZE / 2.0);

        const rightMesh = new THREE.Mesh(geom, this.sideMaterial);
        rightMesh.position.set(TILE_SIZE / 2.0, -h / 2.0, 0.0);
        rightMesh.rotateY(Math.PI / 2.0);

        const leftMesh = new THREE.Mesh(geom, this.sideMaterial);
        leftMesh.position.set(-TILE_SIZE / 2.0, -h / 2.0, 0.0);
        leftMesh.rotateY(-Math.PI / 2.0);


        const mesh = this.model.clone();
        mesh.receiveShadow = true;
        mesh.position.set(x, y + h / 2.0, z);
        mesh.renderOrder = -1;

        mesh.add(frontMesh);
        mesh.add(backMesh);
        mesh.add(rightMesh);
        mesh.add(leftMesh);

        return mesh;
    }
}