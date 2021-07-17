import * as THREE from 'three';
import * as context from './context';

const create = (ctx: context.Context) => {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        '/skybox/right.jpg',
        '/skybox/left.jpg',
        '/skybox/top.jpg',
        '/skybox/bottom.jpg',
        '/skybox/front.jpg',
        '/skybox/back.jpg',
    ]);

    ctx.scene.background = texture;


    texture.mapping = THREE.CubeReflectionMapping;
    ctx.scene.environment = texture;
};

export {
    create,
};
