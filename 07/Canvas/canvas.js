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
let isClick = false;
let cliclFadeTime = 15;
let cliclFade = cliclFadeTime;

let modelNum = 4;//読み込む3dモデルの数

let pane;
let firstCol = "rgb(34,31,29)";

var viewMode = 1;

let visible = false;

const PARAMS = {
  backgroundColor: { r: 34, g: 31, b: 29 },
  CamRotationX: .0,
  CamRotationY: .0,
  CamRotationZ: .0,
  moveSpeed: 4,
  viewMode: 1,
};

export class Canvas {
  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('mousedown', clickdown);
    window.addEventListener('mouseup', clickup);
    window.addEventListener('resize', onWindowResize);

    //camera
    camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 1, 2000);
    camera.rotation.set(0, Math.PI / 2, Math.PI / 2);
    camera.position.set(-3800, 7, 38700);

    // scene
    scene = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.8);
    ambientLight.position.set(-3800, 50, 38700);
    // ambientLight.castShadow = true;
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.2);
    camera.add(pointLight);
    scene.add(camera);

    scene.fog = new THREE.Fog(0xdedede, 0.015, 1000);

    //makeGround
    var map1 = THREE.ImageUtils.loadTexture( './Canvas/map1.jpg' );
    map1.wrapS = THREE.RepeatWrapping;
    map1.wrapT = THREE.RepeatWrapping;
    map1.repeat.set(100, 100);
    var geometry = new THREE.PlaneBufferGeometry( 5000, 5000, 100,100 );
    var plane = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial( { map: map1 } )
    );
    plane.rotation.x = Math.PI / -2;
    plane.position.set(-3800, 5, 38700);
    var simplexNoise = new SimplexNoise;
    for (var i = 0; i < geometry.attributes.position.count; i++ ) {
      geometry.attributes.position.setZ( i , simplexNoise.noise( geometry.attributes.position.getX(i) / 2, geometry.attributes.position.getY(i) / 20 ));
    }
    plane.geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    scene.add(plane);
    //makeCrowd
    var map2 = THREE.ImageUtils.loadTexture( './Canvas/crowd.png' );
    var geometry_2 = new THREE.PlaneBufferGeometry( 1000, 1000, 1,1 );
    var crowd = new THREE.Mesh(
      geometry_2,
      new THREE.MeshLambertMaterial( { map: map2,side: THREE.DoubleSide,opacity: 0.5,transparent: true, } )
    );
    crowd.rotation.x = Math.PI / 2;
    crowd.position.set(-3800, 100, 38700);
    scene.add(crowd);
  
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
    // OBJ & MTL
    this.modelsetup_2(onProgress, onError);

    //-----------------Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.autoClear = true;
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //--------------FirstPersonControls---------
    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.lookSpeed = 0.05;
    controls.movementSpeed = 4;
    controls.noFly = true;
    controls.lookVertical = true; // false : 首を上下に振れない
    controls.constrainVertical = true;
    controls.autoForward = false;
    controls.activeLook = false; // false : 一方向しか見られない
    // 首を上下する角度
    controls.constrainVertical = true;
    controls.verticalMin = 1.0;
    controls.verticalMax = 2.0;

    //---------------gUI--------
    const pane = new Tweakpane();
    this.guisetup(pane);
    // renderer.setClearColor(firstCol, 1);

    pane.on('change', (val) => {
      PARAMS.backgroundColor.r = Math.round(PARAMS.backgroundColor.r);  //四捨五入
      PARAMS.backgroundColor.g = Math.round(PARAMS.backgroundColor.g);
      PARAMS.backgroundColor.b = Math.round(PARAMS.backgroundColor.b);
      controls.movementSpeed = PARAMS.moveSpeed;
      var col = "rgb(" + PARAMS.backgroundColor.r + ", " + PARAMS.backgroundColor.g + ", " + PARAMS.backgroundColor.b + ")";
      const color = new THREE.Color(col);
      // renderer.setClearColor(color, 1);
      // document.body.style.background = "linear-gradient( " + color + ", #cdcdcd)";
      var colString = 'linear-gradient(' + col+','+'white)';
      document.body.style.background = colString;
      console.log(document.body.style.background);
      viewMode = PARAMS.viewMode;
      // scene.fog = new THREE.Fog(color, 0.015, 800);
    });

    animate();
  }

  guisetup(pane) {
    // pane.addInput(PARAMS, 'backgroundColor');
    pane.addInput(PARAMS, 'backgroundColor', {
      input: 'color',
    });
    pane.addInput(PARAMS, 'viewMode', {
      options: {
        HumanView: 1,
        FlyView: 2,
      },
    });
    pane.addInput(PARAMS, 'moveSpeed');
    const f1 = pane.addFolder({
      title: 'CameraSetting',
    });
    f1.addMonitor(PARAMS, 'CamRotationX', {
      title: 'Number',
    });
    f1.addMonitor(PARAMS, 'CamRotationY', {
      title: 'Number',
    });
    f1.addMonitor(PARAMS, 'CamRotationZ', {
      title: 'Number',
    });
  }

  modelsetup_1(onProgress, onError) {
    const wrap = new THREE.Object3D();  
    for (var i = 0; i < modelNum; i++) {
      var mtlLoader = new MTLLoader();
      var pathString = 'models/obj/pla/' + String(i) + '/';
      mtlLoader.setPath(pathString);              // this/is/obj/path/
      mtlLoader.load('materials.mtl', function (materials) {
        materials.preload();
        var objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(pathString);            // this/is/obj/path/
        objLoader.load('obj.obj', function (object) {

          object.opacity = 1;
          object.visibility = true;
          object.scale.set(1, 1, 1);
          object.position.set(0, 0, 0);
          object.rotation.set(-Math.PI / 2, 0, 0);
          wrap.add(object);
          // scene.add(object);                       // sceneに追加
        }, onProgress, onError);
      });
    }
    scene.add(wrap);
  }
  modelsetup_2(onProgress, onError) {
    var mtlLoader0 = new MTLLoader();
    var pathString0 = 'models/obj/pla/0/';
    mtlLoader0.setPath(pathString0);    
    mtlLoader0.load('materials.mtl', function (materials) {
      materials.preload();
      var objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(pathString0); 
      objLoader.load('obj.obj', function (object) {
        object.receiveShadow = true;
        object.castShadow = true;
        object.opacity = 1;
        object.visibility = true;
        object.scale.set(1, 1, 1);
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
        object.receiveShadow = true;
        object.castShadow = true;
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
        object.receiveShadow = true;
        object.castShadow = true;
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
        object.receiveShadow = true;
        object.castShadow = true;
        object.opacity = 1;
        object.visibility = true;
        object.scale.set(1, 1, 1);
        // object.position.set(11200,50900,-30);
        object.position.set(0, 0, 0);
        object.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(object);                       // sceneに追加
      }, onProgress, onError);
    });
  }
};

function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  controls.update(clock.getDelta());
  PARAMS.CamRotationX = camera.rotation.x;
  PARAMS.CamRotationY = camera.rotation.y;
  PARAMS.CamRotationZ = camera.rotation.z;
  if (isClick) {
    controls.activeLook = true;
  } else {
    cliclFade--;
    if (cliclFade < 1) {
      controls.activeLook = false;
      cliclFade = cliclFadeTime;
    }
  }
  if(viewMode == 1){
    camera.position.y = 8;
  }
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
function clickdown(event) {
  isClick = true;
}
function clickup(event) {
  isClick = false;
}

function handleKeydown(event) {
  var keyCode = event.keyCode;
}
