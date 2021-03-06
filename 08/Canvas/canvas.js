import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { FirstPersonControls } from "https://threejs.org/examples/jsm/controls/FirstPersonControls.js";
import { OBJLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/MTLLoader.js';
import { DDSLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/DDSLoader.js';
import { Water } from '../jsm/objects/Water.js';
import { VRButton } from '../jsm/webxr/VRButton.js';
// import { FirstPersonControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/FirstPersonControls.js';

let camera, cameraContainer, scene, renderer, controls, mixer;
let manager;
let loaded = false;
const loading = document.querySelector('.loading');
let mouseX = 0,
    mouseY = 0,
    preMouseX = 0,
    preMouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

var clock = new THREE.Clock();
let isClick = false;
let cliclFadeTime = 15;
let cliclFade = cliclFadeTime;

let modelNum = 12;
let models = [];
let water, crowd, plane, plane2, map1;
let preCamPos = new THREE.Vector3(-3800, 7, 38700);

let pane;
let firstCol = "rgb(222,222,222)";

var viewMode = 3; //1:Human 2:Fly 3:Auto

let firstPosition = new THREE.Vector3(-3800, 0, 38700);

const PARAMS = {
    backgroundColor: { r: 222, g: 222, b: 222 },
    CamRotationX: .0,
    CamRotationY: .0,
    CamRotationZ: .0,
    CamPositionX: .0,
    CamPositionY: .0,
    CamPositionZ: .0,
    moveSpeed: 4,
    viewMode: 3,
    waterHeight: 5,
    waterAlpha: 0.8,
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

        this.cameraSetup();
        this.sceneSetup();
        this.ambientSetup();

        let ps = [];
        // for(var i = 0; i < modelNum; i++){
        //   var pathString = './models/obj/pla/' + String(i) + '/';
        //   ps[i] = this.loadModel(pathString).then(result => {  models[i] = result; });
        // }
        ps[0] = this.loadModel('./models/obj/pla/0/').then(result => { models[0] = result; });
        ps[1] = this.loadModel('./models/obj/pla/1/').then(result => { models[1] = result; });
        ps[2] = this.loadModel('./models/obj/pla/2/').then(result => { models[2] = result; });
        ps[3] = this.loadModel('./models/obj/pla/3/').then(result => { models[3] = result; });
        ps[4] = this.loadModel('./models/obj/pla/4/').then(result => { models[4] = result; });
        ps[5] = this.loadModel('./models/obj/pla/5/').then(result => { models[5] = result; });
        ps[6] = this.loadModel('./models/obj/pla/6/').then(result => { models[6] = result; });
        ps[7] = this.loadModel('./models/obj/pla/7/').then(result => { models[7] = result; });
        ps[8] = this.loadModel('./models/obj/pla/8/').then(result => { models[8] = result; });
        ps[9] = this.loadModel('./models/obj/pla/9/').then(result => { models[9] = result; });
        ps[10] = this.loadModel('./models/obj/pla/10/').then(result => { models[10] = result; });
        ps[11] = this.loadModel('./models/obj/pla/11/').then(result => { models[11] = result; });

        //-----------------Renderer
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.autoClear = true;
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        this.fpCtlSetup();
        const pane = new Tweakpane();
        this.guiSetup(pane);

        const manager = new THREE.LoadingManager();
        manager.onLoad = function() {
            console.log('Loading complete!');
        };

        Promise.all(ps).then(() => {
            //do something to the model
            for (var j = 0; j < modelNum; j++) {
                models[j].position.set(0, 0, 0);
                models[j].rotation.set(-Math.PI / 2, 0, 0);
                scene.add(models[j]);
            }
            loaded = true;
            loading.classList.add('hide');
        });


        // renderer.setClearColor(firstCol, 1);

        pane.on('change', (val) => {
            PARAMS.backgroundColor.r = Math.round(PARAMS.backgroundColor.r); //????????????
            PARAMS.backgroundColor.g = Math.round(PARAMS.backgroundColor.g);
            PARAMS.backgroundColor.b = Math.round(PARAMS.backgroundColor.b);
            controls.movementSpeed = PARAMS.moveSpeed;
            var col = "rgb(" + PARAMS.backgroundColor.r + ", " + PARAMS.backgroundColor.g + ", " + PARAMS.backgroundColor.b + ")";
            const color = new THREE.Color(col);
            // renderer.setClearColor(color, 1);
            // document.body.style.background = "linear-gradient( " + color + ", #cdcdcd)";
            var colString = 'linear-gradient(' + col + ',' + 'white)';
            document.body.style.background = colString;
            // scene.fog = new THREE.Fog(color, 0.015, 1000);
            viewMode = PARAMS.viewMode;
            water.position.y = PARAMS.waterHeight;
            const water_uniforms = water.material.uniforms;
            water_uniforms['alpha'].value = PARAMS.waterAlpha;
        });

        var positionKeyframeTrackJSON = {
            name: ".position",
            type: "vector",
            times: [0, 10, 12, 20, 30, 37, 40],
            values: [firstPosition.x - 500, 100, firstPosition.z,
                firstPosition.x - 900, 100, firstPosition.z - 300,
                firstPosition.x - 1000, 100, firstPosition.z - 250,
                firstPosition.x - 1000, 100, firstPosition.z + 100,
                firstPosition.x + 200, 150, firstPosition.z - 350,
                firstPosition.x + 200, 100, firstPosition.z,
                firstPosition.x - 500, 100, firstPosition.z,
            ],
            interpolation: THREE.InterpolateSmooth
        }

        var rotationXKeyframeTrackJSON = {
            name: ".rotation[x]",
            type: "number",
            times: [0, 14, 22, 37, 40],
            values: [-Math.PI / 4, -Math.PI / 6, -Math.PI / 4, -Math.PI / 6, -Math.PI / 4],
            interpolation: THREE.InterpolateSmooth
        }
        var rotationYKeyframeTrackJSON = {
            name: ".rotation[y]",
            type: "number",
            times: [0, 10, 14, 22, 32, 37, 40],
            values: [0, Math.PI / 6, Math.PI / 2, Math.PI * 3 / 2, Math.PI, Math.PI / 2, 0],
            interpolation: THREE.InterpolateSmooth
        }
        var rotationZKeyframeTrackJSON = {
            name: ".rotation[z]",
            type: "number",
            times: [0, 10, 14, 22, 32, 37, 40],
            values: [0, Math.PI / 6, Math.PI / 4, 0, -Math.PI / 6, 0, 0],
            interpolation: THREE.InterpolateSmooth
        }

        var clipJSON = {
            duration: 40,
            tracks: [
                positionKeyframeTrackJSON,
                rotationXKeyframeTrackJSON,
                rotationYKeyframeTrackJSON,
                rotationZKeyframeTrackJSON
            ]
        }

        var clip = THREE.AnimationClip.parse(clipJSON);

        mixer = new THREE.AnimationMixer(cameraContainer);
        var action = mixer.clipAction(clip);

        action.play()
        renderer.xr.enabled = true;
        document.body.appendChild(renderer.domElement);
        document.body.appendChild(VRButton.createButton(renderer));

        renderer.setAnimationLoop(animate);
    }

    cameraSetup() {
        cameraContainer = new THREE.Object3D();
        camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.1, 2000);
        cameraContainer.add(camera);
        // cameraContainer.rotation.set(0, Math.PI / 2, Math.PI / 2);
        cameraContainer.position.set(firstPosition.x, 7, firstPosition.z);
        cameraContainer.scale.set(0.5, 0.5, 0.5);

    }
    sceneSetup() {
        scene = new THREE.Scene();
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.8);
        ambientLight.position.set(-3800, 50, 38700);
        // ambientLight.castShadow = true;
        scene.add(ambientLight);
        // const pointLight = new THREE.PointLight(0xffffff, 0.2);
        // cameraContainer.add(pointLight);
        scene.add(cameraContainer);
        scene.fog = new THREE.Fog(0xdedede, 0.015, 1000);
    }
    ambientSetup() {
        //Ground
        map1 = THREE.ImageUtils.loadTexture('./Canvas/map2.jpg');
        map1.wrapS = THREE.RepeatWrapping;
        map1.wrapT = THREE.RepeatWrapping;
        map1.repeat.set(100, 100);
        var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100);
        plane = new THREE.Mesh(
            geometry,
            new THREE.MeshLambertMaterial({ map: map1 })
        );
        plane.rotation.x = Math.PI / -2;
        plane.position.set(firstPosition.x, firstPosition.y, firstPosition.z);
        var simplexNoise = new SimplexNoise;
        for (var i = 0; i < geometry.attributes.position.count; i++) {
            geometry.attributes.position.setZ(i, simplexNoise.noise(geometry.attributes.position.getX(i) / 2, geometry.attributes.position.getY(i) / 20));
        }
        plane.geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        scene.add(plane);

        //Water
        const waterGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 10, 10);
        water = new Water(
            waterGeometry, {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('./Canvas/Water_1_M_Normal.jpg', function(texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                alpha: .8,
                waterColor: 0x3e89ce,
                distortionScale: 1.3,
                side: THREE.DoubleSide,
                transparent: true,
                fog: scene.fog !== undefined,
            }
        );
        water.rotation.x = -Math.PI / 2;
        water.position.set(firstPosition.x, 5, firstPosition.z);
        scene.add(water);

        //Crowd
        var map2 = THREE.ImageUtils.loadTexture('./Canvas/crowd.png');
        map2.wrapS = THREE.RepeatWrapping;
        map2.wrapT = THREE.RepeatWrapping;
        map2.repeat.set(2, 3);
        crowd = new THREE.Mesh(
            new THREE.SphereGeometry(1000, 10, 10), // ??????     
            new THREE.MeshLambertMaterial({ // ??????     
                map: map2,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide // ????????????????????????????????????                         
            })
        );
        crowd.position.set(firstPosition.x, 0, firstPosition.z);
        scene.add(crowd);

    }

    guiSetup(pane) {
        // pane.addInput(PARAMS, 'backgroundColor');
        const f2 = pane.addFolder({ title: 'ambientSetting', expanded: false, });
        f2.addInput(PARAMS, 'backgroundColor', { input: 'color', });
        f2.addInput(PARAMS, 'waterHeight', { min: 1, max: 20, });
        f2.addInput(PARAMS, 'waterAlpha', { min: 0.1, max: 1.0, });
        const f3 = pane.addFolder({ title: 'viewSetting', expanded: false, });
        f3.addInput(PARAMS, 'viewMode', {
            options: { HumanView: 1, FlyView: 2, AutoView: 3, },
        });
        f3.addInput(PARAMS, 'moveSpeed');
        const f1 = pane.addFolder({ title: 'cameraContainerValue', expanded: false, });
        f1.addMonitor(PARAMS, 'CamRotationX', { title: 'Number', });
        f1.addMonitor(PARAMS, 'CamRotationY', { title: 'Number', });
        f1.addMonitor(PARAMS, 'CamRotationZ', { title: 'Number', });
        f1.addMonitor(PARAMS, 'CamPositionX', { title: 'Number', });
        f1.addMonitor(PARAMS, 'CamPositionY', { title: 'Number', });
        f1.addMonitor(PARAMS, 'CamPositionZ', { title: 'Number', });
    }
    fpCtlSetup() {
        //--------------FirstPersonControls---------
        controls = new FirstPersonControls(cameraContainer, renderer.domElement);
        controls.lookSpeed = 0.05;
        controls.movementSpeed = 4;
        controls.noFly = true;
        controls.lookVertical = true; // false : ???????????????????????????
        controls.constrainVertical = true;
        controls.autoForward = false;
        controls.activeLook = false; // false : ??????????????????????????????
        // ????????????????????????
        controls.constrainVertical = true;
        controls.verticalMin = 1.0;
        controls.verticalMax = 2.0;
    }
    loadModel(url) {
        return new Promise(resolve => {
            var mtlLoader = new MTLLoader(manager);
            var objLoader = new OBJLoader(manager);
            var pathString = url;
            mtlLoader.setPath(pathString);
            mtlLoader.load('materials.mtl', function(materials) {
                materials.preload();
                objLoader.setMaterials(materials);
                objLoader.setPath(pathString);
                objLoader.load('obj.obj', resolve);
            });
        });
    }
};

function animate() {
    // requestAnimationFrame(animate);
    // renderer.setAnimationLoop(function() { renderer.render(scene, cameraContainer); });
    renderer.render(scene, camera);
    if (PARAMS.viewMode == 1 || PARAMS.viewMode == 2) {
        controls.update(clock.getDelta());
    } else {
        mixer.update(0.01)
    }
    if (preCamPos.x != cameraContainer.position.x || preCamPos.y != cameraContainer.position.y || preCamPos.z != cameraContainer.position.z) calPlane();
    preCamPos.x = cameraContainer.position.x;
    preCamPos.y = cameraContainer.position.y;
    preCamPos.z = cameraContainer.position.z;

    render();
}

function calPlane() {
    map1.offset.x -= (preCamPos.x - cameraContainer.position.x) * 0.2;
    map1.offset.y += (preCamPos.z - cameraContainer.position.z) * 0.2;
}


function render() {
    if (!loaded) {

    }
    water.material.uniforms['time'].value += 1.0 / 60.0;
    PARAMS.CamRotationX = cameraContainer.rotation.x;
    PARAMS.CamRotationY = cameraContainer.rotation.y;
    PARAMS.CamRotationZ = cameraContainer.rotation.z;
    PARAMS.CamPositionX = -firstPosition.x + cameraContainer.position.x;
    PARAMS.CamPositionY = -firstPosition.y + cameraContainer.position.y;
    PARAMS.CamPositionZ = -firstPosition.z + cameraContainer.position.z;
    water.position.set(cameraContainer.position.x, PARAMS.waterHeight, cameraContainer.position.z);
    plane.position.set(cameraContainer.position.x, 0, cameraContainer.position.z);
    crowd.position.set(cameraContainer.position.x, 0, cameraContainer.position.z);
    crowd.rotation.z += Math.random() * 0.0005;
    crowd.rotation.x += Math.random() * 0.0005 - 0.001;
    if (isClick) {
        controls.activeLook = true;
    } else {
        cliclFade--;
        if (cliclFade < 1) {
            controls.activeLook = false;
            cliclFade = cliclFadeTime;
        }
    }
    if (viewMode == 1) {
        cameraContainer.position.y = 8;
    } else if (viewMode == 2) {
        if (cameraContainer.position.y < 0.5) { //?????????
            cameraContainer.position.y = 0.5;
        } else if (cameraContainer.position.y > 60) { //?????????
            cameraContainer.position.y = 60;
        }
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
    if (keyCode == 66) { //b
    }
}