window.addEventListener("DOMContentLoaded", init);
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { ShaderMaterial } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/src/materials/ShaderMaterial.js';
import { vertexSource } from './Shader/shader.vert.js';
import { fragmentSource } from './Shader/shader.frag.js';
import { computeShaderPosition } from './Shader/shader.computePosition.js';
import { computeShaderVelocity } from './Shader/shader.computeVelocity.js';
import { BufferGeometryUtils } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/utils/BufferGeometryUtils.js';
import { GPUComputationRenderer } from './js/GPUComputationRenderer.js';

import Particle from './js/Particles/Particles.js';


var container, camera, scene, renderer, geometry, controls, boxGeometry, boxAry, controls;

var WIDTH = 500;
var PARTICLES = WIDTH * WIDTH;

var gpuCompute;
var velocityVariable;
var positionVariable;
var positionUniforms;
var velocityUniforms;
var particleUniforms;
var effectController;


function init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#myCanvas")
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 0, 1000);

    controls = new OrbitControls(camera, renderer.domElement);

    boxGeometry = new THREE.BoxGeometry(100, 100, 100);
    boxAry = boxGeometry.attributes.position.array;
    boxAry = boxAry.filter(Boolean);
    // console.log("boxArylength" + boxAry.length);

    initComputeRenderer();
    initPosition();

    // const particles = new Particle(renderer, new THREE.Color(0xffffff));
    // scene.add(particles.obj);


    // const shaderMaterial = new ShaderMaterial({
    //     vertexShader: vertexSource,
    //     fragmentShader: fragmentSource,
    //     depthTest: true, //距離減衰
    //     transparent: true
    // });

    // const material = new THREE.MeshStandardMaterial({
    //     color: 0x0000ff
    // });
    // const box = new THREE.Mesh(boxGeometry, shaderMaterial);
    // scene.add(box);


    const directionalLight = new THREE.DirectionalLight(
        0xffffff
    );
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    tick();
}

function tick() {
    requestAnimationFrame(tick);
    gpuCompute.compute();
    particleUniforms.texturePosition.value = gpuCompute.getCurrentRenderTarget(positionVariable).texture;
    particleUniforms.textureVelocity.value = gpuCompute.getCurrentRenderTarget(velocityVariable).texture;


    // box.rotation.x += 0.01;
    // box.rotation.y += 0.01;

    renderer.render(scene, camera);
}

function initComputeRenderer() {

    // gpgpuオブジェクトのインスタンスを格納
    gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

    // 今回はパーティクルの位置情報と、移動方向を保存するテクスチャを2つ用意します
    var dtPosition = gpuCompute.createTexture();
    var dtVelocity = gpuCompute.createTexture();

    // テクスチャにGPUで計算するために初期情報を埋めていく
    fillTextures(dtPosition, dtVelocity);

    // shaderプログラムのアタッチ
    velocityVariable = gpuCompute.addVariable("textureVelocity", computeShaderVelocity, dtVelocity);
    positionVariable = gpuCompute.addVariable("texturePosition", computeShaderPosition, dtPosition);

    // 一連の関係性を構築するためのおまじない
    gpuCompute.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpuCompute.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);


    // uniform変数を登録したい場合は以下のように作る
    /*
    positionUniforms = positionVariable.material.uniforms;
    velocityUniforms = velocityVariable.material.uniforms;

    velocityUniforms.time = { value: 0.0 };
    positionUniforms.time = { ValueB: 0.0 };
    ***********************************
    たとえば、上でコメントアウトしているeffectControllerオブジェクトのtimeを
    わたしてあげれば、effectController.timeを更新すればuniform変数も変わったり、ということができる
    velocityUniforms.time = { value: effectController.time };
    ************************************
    */

    // error処理
    var error = gpuCompute.init();
    if (error !== null) {
        console.error(error);
    }
}

function initPosition() {

    // 最終的に計算された結果を反映するためのオブジェクト。
    // 位置情報はShader側(texturePosition, textureVelocity)
    // で決定されるので、以下のように適当にうめちゃってOK

    geometry = new THREE.BufferGeometry();


    var positions = new Float32Array(PARTICLES * 3);
    var p = 0;
    for (var i = 0; i < PARTICLES; i += 3) {
        positions[i] = 0;
        positions[i + 1] = 0;
        positions[i + 2] = 0;
    }

    // uv情報の決定。テクスチャから情報を取り出すときに必要
    var uvs = new Float32Array(PARTICLES * 3);
    p = 0;
    for (var j = 0; j < WIDTH; j++) {
        for (var i = 0; i < WIDTH; i++) {
            uvs[p++] = i / (WIDTH - 1);
            uvs[p++] = j / (WIDTH - 1);
        }
    }

    // attributeをgeometryに登録する
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 3));

    // uniform変数をオブジェクトで定義
    // 今回はカメラをマウスでいじれるように、計算に必要な情報もわたす。
    particleUniforms = {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        cameraConstant: { value: getCameraConstant(camera) }
    };



    // Shaderマテリアル これはパーティクルそのものの描写に必要なシェーダー
    var material = new THREE.ShaderMaterial({
        uniforms: particleUniforms,
        vertexShader: vertexSource,
        fragmentShader: fragmentSource
    });
    material.extensions.drawBuffers = true;
    var particles = new THREE.Points(geometry, material);
    particles.matrixAutoUpdate = false;
    particles.updateMatrix();

    // パーティクルをシーンに追加
    scene.add(particles);
}

function fillTextures(texturePosition, textureVelocity) {

    // textureのイメージデータをいったん取り出す
    var posArray = texturePosition.image.data;
    var velArray = textureVelocity.image.data;

    // パーティクルの初期の位置は、ランダムなXZに平面おく。
    // 板状の正方形が描かれる

    for (var k = 0, kl = posArray.length; k < kl; k += 4) {
        // Position
        var x, y, z;
        x = Math.random() * 500 - 250;
        z = Math.random() * 500 - 250;
        y = Math.random() * 500 - 250;
        // posArrayの実態は一次元配列なので
        // x,y,z,wの順番に埋めていく。
        // wは今回は使用しないが、配列の順番などを埋めておくといろいろ使えて便利
        posArray[k + 0] = x;
        posArray[k + 1] = y;
        posArray[k + 2] = z;
        posArray[k + 3] = 0;
        // posArray[k + 0] = boxAry[k + 0];
        // posArray[k + 1] = boxAry[k + 1];
        // posArray[k + 2] = boxAry[k + 2];
        // posArray[k + 3] = boxAry[k + 3];

        // 移動する方向はとりあえずランダムに決めてみる。
        // これでランダムな方向にとぶパーティクルが出来上がるはず。
        velArray[k + 0] = Math.random() * 2 - 1;
        velArray[k + 1] = Math.random() * 2 - 1;
        velArray[k + 2] = Math.random() * 2 - 1;
        velArray[k + 3] = Math.random() * 2 - 1;
    }
}

function getCameraConstant(camera) {
    return window.innerHeight / (Math.tan(THREE.Math.DEG2RAD * 0.5 * camera.fov) / camera.zoom);
}