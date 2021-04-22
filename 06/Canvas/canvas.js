import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import { FBXLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/MTLLoader.js';
import { DDSLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/DDSLoader.js';
import { FirstPersonControls } from "https://threejs.org/examples/jsm/controls/FirstPersonControls.js";

let camera, scene, renderer, controls;
let mouseX = 0, mouseY = 0, preMouseX = 0, preMouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

var clock = new THREE.Clock();

let modelNum = 4;//読み込む3dモデルの数

let pane;
let firstCol = "rgb(180,255,180)";
	
const PARAMS = {
  backgroundColor: {r: 180,g: 255,b: 180},
  CamRotationX : .0,
  CamRotationY : .0,
  CamRotationZ : .0,
};

export class Canvas {
  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 2000);
    camera.rotation.set(0, Math.PI / 2, Math.PI / 2);
    camera.position.set(-3800, 10, 38700);

    // scene
    scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.2);
    camera.add(pointLight);
    scene.add(camera);

    // model
    const onProgress = function (xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log(Math.round(percentComplete, 2) + '% downloaded');
      }
    };

    const onError = function () { };

    const manager = new THREE.LoadingManager();
    manager.addHandler(/\.dds$/i, new DDSLoader());

    // OBJ MTLの読み込み
    // for (var i = 0; i < modelNum; i++) {
    //   var mtlLoader = new MTLLoader();
    //   var pathString = 'models/obj/pla/' + String(i)+ '/';
    //   mtlLoader.setPath(pathString);              // this/is/obj/path/
    //   mtlLoader.load('materials.mtl', function (materials) {
    //     materials.preload();
    //     var objLoader = new OBJLoader();
    //     objLoader.setMaterials(materials);
    //     objLoader.setPath(pathString);            // this/is/obj/path/
    //     objLoader.load('obj.obj', function (object) {

    //       object.opacity = 1;
    //       object.visibility = true;
    //       object.scale.set(1, 1, 1);
    //       // object.position.set(11200,50900,-30);
    //       object.position.set(0, 0, 0);
    //       object.rotation.set(-Math.PI / 2, 0, 0);
    //       scene.add(object);                       // sceneに追加
    //     }, onProgress, onError);
    //   });
    // }

    var mtlLoader0 = new MTLLoader();
    var pathString0 = 'models/obj/pla/0/';
    mtlLoader0.setPath(pathString0);              // this/is/obj/path/
    mtlLoader0.load('materials.mtl', function (materials) {
      materials.preload();
      var objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(pathString0);            // this/is/obj/path/
      objLoader.load('obj.obj', function (object) {

        object.opacity = 1;
        object.visibility = true;
        object.scale.set(1, 1, 1);
        // object.position.set(11200,50900,-30);
        object.position.set(0, 0, 0);
        object.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(object);                       // sceneに追加
      }, onProgress, onError);
    });
    var mtlLoader1 = new MTLLoader();
    var pathString1 = 'models/obj/pla/1/';
    mtlLoader1.setPath(pathString1);              // this/is/obj/path/
    mtlLoader1.load('materials.mtl', function (materials) {
      materials.preload();
      var objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(pathString1);            // this/is/obj/path/
      objLoader.load('obj.obj', function (object) {

        object.opacity = 1;
        object.visibility = true;
        object.scale.set(1, 1, 1);
        // object.position.set(11200,50900,-30);
        object.position.set(0, 0, 0);
        object.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(object);                       // sceneに追加
      }, onProgress, onError);
    });
    var mtlLoader2 = new MTLLoader();
    var pathString2 = 'models/obj/pla/2/';
    mtlLoader2.setPath(pathString2);              // this/is/obj/path/
    mtlLoader2.load('materials.mtl', function (materials) {
      materials.preload();
      var objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(pathString2);            // this/is/obj/path/
      objLoader.load('obj.obj', function (object) {

        object.opacity = 1;
        object.visibility = true;
        object.scale.set(1, 1, 1);
        // object.position.set(11200,50900,-30);
        object.position.set(0, 0, 0);
        object.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(object);                       // sceneに追加
      }, onProgress, onError);
    });

    var mtlLoader3 = new MTLLoader();
    var pathString3 = 'models/obj/pla/3/';
    mtlLoader3.setPath(pathString3);              // this/is/obj/path/
    mtlLoader3.load('materials.mtl', function (materials) {
      materials.preload();
      var objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(pathString3);            // this/is/obj/path/
      objLoader.load('obj.obj', function (object) {

        object.opacity = 1;
        object.visibility = true;
        object.scale.set(1, 1, 1);
        // object.position.set(11200,50900,-30);
        object.position.set(0, 0, 0);
        object.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(object);                       // sceneに追加
      }, onProgress, onError);
    });

    //-----------------XYZ軸を表示
    var axes = new THREE.AxisHelper(20);
    scene.add(axes);

    //-----------------Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.autoClear = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //--------------FirstPersonControls---------
    controls = new FirstPersonControls(camera, renderer.domElement);

    controls.lookSpeed = 0.05;
    controls.movementSpeed = 4;
    controls.noFly = true;
    controls.lookVertical = true; // false : 首を上下に振れない
    controls.autoForward = false;

    controls.activeLook = true; // false : 一方向しか見られない

    // 首を上下する角度
    controls.constrainVertical = true;
    controls.verticalMin = 1.0;
    controls.verticalMax = 2.0;

    window.addEventListener("keydown", handleKeydown);
    document.addEventListener('mousemove', onDocumentMouseMove);
    // window.addEventListener('resize', onWindowResize);

    //---------------gUI--------
    const pane = new Tweakpane();
    // pane.addInput(PARAMS, 'backgroundColor');
    pane.addInput(PARAMS, 'backgroundColor', {
      input: 'color',
    });
    pane.addMonitor(PARAMS, 'CamRotationX', {
      title: 'Number',
    });
    pane.addMonitor(PARAMS, 'CamRotationY', {
      title: 'Number',
    });
    pane.addMonitor(PARAMS, 'CamRotationZ', {
      title: 'Number',
    });
    renderer.setClearColor( firstCol, 1 );
    // pane.addInput(PARAMS, 'tint');

    pane.on('change', (val) => {
      // document.getElementById("back").style.backgroundColor = val;
      PARAMS.backgroundColor.r = Math.round(PARAMS.backgroundColor.r);  //四捨五入
      PARAMS.backgroundColor.g = Math.round(PARAMS.backgroundColor.g);
      PARAMS.backgroundColor.b = Math.round(PARAMS.backgroundColor.b);
      var col = "rgb("+PARAMS.backgroundColor.r +", "+ PARAMS.backgroundColor.g + ", "+PARAMS.backgroundColor.b + ")";
      const color = new THREE.Color(col);
      // var color = Number(col,16); 
      // console.log("color :" + color);
      renderer.setClearColor( color, 1 );
    });

    animate();
  }
};

function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  // camera.position.x += (mouseX - camera.position.x) * .05;
  // camera.position.y += (- mouseY - camera.position.y) * .05;
  controls.update(clock.getDelta());
  PARAMS.CamRotationX = camera.rotation.x;
  PARAMS.CamRotationY = camera.rotation.y;
  PARAMS.CamRotationZ = camera.rotation.z;
  renderer.render(scene, camera);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
}

function handleKeydown(event) {
  var keyCode = event.keyCode;
  // if (keyCode == 39) {// →
  //   camera.position.y += 5;
  //   console.log("camera.position.x : " + camera.position.x);
  // }
  // if (keyCode == 37) {// ←  
  //   camera.position.y -= 5;
  //   console.log("camera.position.x : " + camera.position.x);
  // }

  // if (keyCode == 38) {// ↑
  //   camera.position.x -= 10;
  //   console.log("camera.position.z : " + camera.position.z);
  // }
  // if (keyCode == 40) {// ↓
  //   camera.position.x += 10;
  //   console.log("camera.position.z : " + camera.position.z);
  // }
  if (keyCode == 65) {// A
    console.log("camera.position.x : " + camera.position.x);
    console.log("camera.position.y : " + camera.position.y);
    console.log("camera.position.z : " + camera.position.z);
    console.log("camera.rotation.x : " + camera.rotation.x);
    console.log("camera.rotation.y : " + camera.rotation.y);
    console.log("camera.rotation.z : " + camera.rotation.z);
  }
}
