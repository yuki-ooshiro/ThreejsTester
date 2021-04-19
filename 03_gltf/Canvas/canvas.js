import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import {FBXLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/FBXLoader.js';

let SIZE_FBX = 100;

export class Canvas {
  constructor() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.mouse = new THREE.Vector2(0, 0);

    // レンダラーを作成
    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#myCanvas"),
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 100 );
    camera.position.set(0, 1, 5);

    let loader = new FBXLoader();
    const path = './Canvas/test.fbx';
    loader.load(path, (fbx)=>{
      fbx.traverse((child)=>{
        if(child.isMesh){
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      fbx.position.set(0, 0, 0);
      fbx.scale.set(SIZE_FBX, SIZE_FBX, SIZE_FBX);
      fbx.rotation.set(0, Math.PI, 0);
      scene.add(fbx);
  
      console.log(fbx);
    });

    this.light = new THREE.DirectionalLight(0xffffff);
    this.light.position.set(0, 0, 400);
    this.light.position.x = this.mouse.x;
    this.light.position.y = this.mouse.y;

    // シーンに追加
    scene.add(this.light);
    

    // 初回実行
    //   renderer.render(scene, camera);
    tick();

    function tick() {
      requestAnimationFrame(tick);

      const sec = performance.now() / 1000;

      // レンダリング
      renderer.render(scene, camera);
    }
  }

  mouseMoved(x, y) {
    // this.mouse.x =  x - (this.width / 2);// 原点を中心に持ってくる
    // this.mouse.y = -y + (this.height / 2);// 軸を反転して原点を中心に持ってくる
    this.mouse.x =  x;
    this.mouse.y = y;

    // ライトの xy座標 をマウス位置にする
    this.light.position.x = this.mouse.x;
    this.light.position.y = this.mouse.y;
  }

};
