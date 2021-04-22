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


export class Canvas {
  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.rotation.set(0, Math.PI / 2, Math.PI / 2);
    camera.position.set(-11200, 30, 50900);

    // scene
    scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
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

    new OBJLoader(manager).setPath('models/obj/male02/').load('test.obj', function (object) {
      object.opacity = 1;
      object.visibility = true;
      object.scale.set(1, 1, 1);
      // object.position.set(11200,50900,-30);
      object.position.set(0, 0, 0);
      object.rotation.set(-Math.PI / 2,0, 0);
      scene.add(object);
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
  if (keyCode == 39) {// →
    camera.position.y += 5;
    console.log("camera.position.x : " + camera.position.x);
  }
  if (keyCode == 37) {// ←  
    camera.position.y -= 5;
    console.log("camera.position.x : " + camera.position.x);
  }

  if (keyCode == 38) {// ↑
    camera.position.x -= 10;
    console.log("camera.position.z : " + camera.position.z);
  }
  if (keyCode == 40) {// ↓
    camera.position.x += 10;
    console.log("camera.position.z : " + camera.position.z);
  }
  if (keyCode == 65) {// A
    console.log("camera.position.x : " + camera.position.x);
    console.log("camera.position.y : " + camera.position.y);
    console.log("camera.position.z : " + camera.position.z);
    console.log("camera.rotation.x : " + camera.rotation.x);
    console.log("camera.rotation.y : " + camera.rotation.y);
    console.log("camera.rotation.z : " + camera.rotation.z);
  }
}
