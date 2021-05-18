import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { FirstPersonControls } from 'https://threejs.org/examples/jsm/controls/FirstPersonControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';
import { DDSLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/DDSLoader.js';
import { VRButton } from '../jsm/webxr/VRButton.js';
import Stats from '../jsm/libs/stats.module.js';
import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../jsm/postprocessing/RenderPass.js';
import { GlitchPass } from '../jsm/postprocessing/GlitchPass.js';
import { NodePass } from '../jsm/nodes/postprocessing/NodePass.js';
import * as Nodes from '../jsm/nodes/Nodes.js';
import { BufferGeometryUtils } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/examples/jsm/utils/BufferGeometryUtils.js';
import { ShaderMaterial } from 'https://cdn.jsdelivr.net/npm/three@0.125.2/src/materials/ShaderMaterial.js';
import { vertexSource } from '../Shader/shader.vert.js';
import { fragmentSource } from '../Shader/shader.frag.js';

let camera, cameraContainer, scene, renderer, controls, mixer;
let manager;
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
var pointCloud;

let modelNum = 12;
let models = [];

let pane;
let firstCol = "rgb(222,222,222)";
let cameraFolder, blurFolder;
let stats;
let composer, nodepass, glitchPass, blurScreen;
var viewMode = 3; //1:Human 2:Fly 3:Auto
var mergeObj = [];
var originmergeObjPos = [];

let firstPosition = new THREE.Vector3(-3800, 0, 38700);

const frame = new Nodes.NodeFrame();

const PARAMS = {
    backgroundColor: { r: 222, g: 222, b: 222 },
    architectureVisible: true,
    CamRotationX: .0,
    CamRotationY: .0,
    CamRotationZ: .0,
    CamPositionX: .0,
    CamPositionY: .0,
    CamPositionZ: .0,
    walkSpeed: 4,
    viewMode: 3,
    blurX: 1,
    blurY: 1,
};

let breakAnimation = false;

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

        let ps = [];
        // for(var i = 0; i < modelNum; i++){
        //   var pathString = './models/obj/pla/' + String(i) + '/';
        //   ps[i] = this.loadModel(pathString).then(result => {  models[i] = result; });
        // }
        ps[0] = this.loadModel('./models/glb/0/').then(result => { models[0] = result; });
        ps[1] = this.loadModel('./models/glb/1/').then(result => { models[1] = result; });
        ps[2] = this.loadModel('./models/glb/2/').then(result => { models[2] = result; });
        ps[3] = this.loadModel('./models/glb/3/').then(result => { models[3] = result; });
        ps[4] = this.loadModel('./models/glb/4/').then(result => { models[4] = result; });
        ps[5] = this.loadModel('./models/glb/5/').then(result => { models[5] = result; });
        ps[6] = this.loadModel('./models/glb/6/').then(result => { models[6] = result; });
        ps[7] = this.loadModel('./models/glb/7/').then(result => { models[7] = result; });
        ps[8] = this.loadModel('./models/glb/8/').then(result => { models[8] = result; });
        ps[9] = this.loadModel('./models/glb/9/').then(result => { models[9] = result; });
        ps[10] = this.loadModel('./models/glb/10/').then(result => { models[10] = result; });
        ps[11] = this.loadModel('./models/glb/11/').then(result => { models[11] = result; });

        //-----------------Renderer
        renderer = new THREE.WebGLRenderer({ alpha: true, logarithmicDepthBuffer: true });
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
        var merged;
        var newVector = [];

        Promise.all(ps).then(() => {
            for (var j = 0; j < modelNum; j++) {
                models[j].position.set(0, 0, 0);
                models[j].rotation.set(-Math.PI / 2, 0, 0);
                models[j].traverse((object) => {
                    if (object.isMesh) {
                        object.material.wireframe = true;
                    }
                });
                scene.add(models[j]);
                models[j].visible = true;
            }
            mergeObj = mergeObj.filter(Boolean);
            merged = BufferGeometryUtils.mergeBufferGeometries(mergeObj);
            let geoLength = merged.attributes.position.array.length;
            const colors_base = [];
            for (var i = 0; i < geoLength; i++) {
                colors_base.push(0, 0, 0);
            }

            const colors = new Float32Array(colors_base);
            merged.addAttribute('color', new THREE.BufferAttribute(colors, 3));

            // const shaderMaterial = new ShaderMaterial({
            //     vertexShader: vertexSource,
            //     fragmentShader: fragmentSource,
            // });
            // pointCloud = new THREE.Points(
            //     merged, shaderMaterial
            // );
            pointCloud = new THREE.Points(
                merged, new THREE.PointsMaterial({
                    size: 1,
                    color: 0x000000,
                    sizeAttenuation: false
                })
            );

            for (let i = 0; i < geoLength; i += 3) {
                originmergeObjPos[i] = pointCloud.geometry.attributes.position.array[i];
                originmergeObjPos[i + 1] = pointCloud.geometry.attributes.position.array[i + 1];
                originmergeObjPos[i + 2] = pointCloud.geometry.attributes.position.array[i + 2];

            }

            scene.add(pointCloud);
            loading.classList.add('hide');
            renderer.setAnimationLoop(animate);
        });

        pane.on('change', (val) => {
            PARAMS.backgroundColor.r = Math.round(PARAMS.backgroundColor.r);
            PARAMS.backgroundColor.g = Math.round(PARAMS.backgroundColor.g);
            PARAMS.backgroundColor.b = Math.round(PARAMS.backgroundColor.b);
            controls.movementSpeed = PARAMS.walkSpeed;
            var col = "rgb(" + PARAMS.backgroundColor.r + ", " + PARAMS.backgroundColor.g + ", " + PARAMS.backgroundColor.b + ")";
            const color = new THREE.Color(col);
            var colString = 'linear-gradient(' + col + ',' + 'white)';
            document.body.style.background = colString;
            viewMode = PARAMS.viewMode;

            blurScreen.radius.x = PARAMS.blurX;
            blurScreen.radius.y = PARAMS.blurY;
            nodepass.input = blurScreen;
            if (PARAMS.architectureVisible) {
                for (var j = 0; j < modelNum; j++) {
                    models[j].traverse((object) => {
                        if (object.isMesh) {
                            object.material.wireframe = true;

                        }
                    });
                    models[j].visible = true;
                }
                for (let i = 0; i < pointCloud.geometry.attributes.position.array.length; i += 3) {
                    pointCloud.geometry.attributes.position.array[i] = originmergeObjPos[i];
                    pointCloud.geometry.attributes.position.array[i + 1] = originmergeObjPos[i + 1];
                    pointCloud.geometry.attributes.position.array[i + 2] = originmergeObjPos[i + 2];

                }
                blurScreen.radius.x = PARAMS.blurX;
                blurScreen.radius.y = PARAMS.blurY;
                composer.removePass(glitchPass);
                breakAnimation = false;
            } else {
                for (var j = 0; j < modelNum; j++) {
                    models[j].traverse((object) => {
                        if (object.isMesh) {
                            object.material.wireframe = false;
                        }
                    });
                    models[j].visible = false;
                }
                composer.addPass(glitchPass);
                breakAnimation = true;
            }
        });

        var positionKeyframeTrackJSON = {
            name: ".position",
            type: "vector",
            times: [0, 10, 12, 20, 30, 37, 40],
            values: [firstPosition.x - 600, 100, firstPosition.z - 100,
                firstPosition.x - 1000, 100, firstPosition.z - 400,
                firstPosition.x - 1100, 100, firstPosition.z - 350,
                firstPosition.x - 1100, 100, firstPosition.z,
                firstPosition.x + 100, 150, firstPosition.z - 450,
                firstPosition.x + 100, 100, firstPosition.z - 100,
                firstPosition.x - 600, 100, firstPosition.z - 100,
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

        action.play();
        renderer.xr.enabled = true;

        stats = new Stats();
        stats.showPanel(0);
        document.body.appendChild(stats.dom);

        // postprocessing
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        glitchPass = new GlitchPass();
        // composer.addPass(glitchPass);
        nodepass = new NodePass();
        composer.addPass(nodepass);

        const size = renderer.getDrawingBufferSize(new THREE.Vector2());

        blurScreen = new Nodes.BlurNode(new Nodes.ScreenNode());
        blurScreen.size = new THREE.Vector2(size.width, size.height);
        blurScreen.radius.x = 1;
        blurScreen.radius.y = 1;
        nodepass.input = blurScreen;

        // renderer.setAnimationLoop(animate);
    }

    cameraSetup() {
        cameraContainer = new THREE.Object3D();
        camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.1, 2000);
        cameraContainer.add(camera);
        cameraContainer.position.set(firstPosition.x, 7, firstPosition.z);
        cameraContainer.scale.set(0.5, 0.5, 0.5);
    }
    sceneSetup() {
        scene = new THREE.Scene();
        const ambientLight = new THREE.AmbientLight(0xcccccc, 0.8);
        ambientLight.position.set(-3800, 50, 38700);
        scene.add(ambientLight);
        scene.add(cameraContainer);
        scene.fog = new THREE.Fog(0xdedede, 0.015, 900);
    }

    guiSetup(pane) {
        pane.addInput(PARAMS, 'architectureVisible');
        const f2 = pane.addFolder({ title: 'ambientSetting', expanded: false, });
        f2.addInput(PARAMS, 'backgroundColor', { input: 'color', });

        const f3 = pane.addFolder({ title: 'viewSetting', expanded: false, });
        f3.addInput(PARAMS, 'viewMode', {
            options: { HumanView: 1, FlyView: 2, AutoView: 3, },
        });
        f3.addInput(PARAMS, 'walkSpeed');

        cameraFolder = pane.addFolder({ title: 'cameraContainerValue', expanded: false, });
        cameraFolder.addMonitor(PARAMS, 'CamRotationX', { title: 'Number', });
        cameraFolder.addMonitor(PARAMS, 'CamRotationY', { title: 'Number', });
        cameraFolder.addMonitor(PARAMS, 'CamRotationZ', { title: 'Number', });
        cameraFolder.addMonitor(PARAMS, 'CamPositionX', { title: 'Number', });
        cameraFolder.addMonitor(PARAMS, 'CamPositionY', { title: 'Number', });
        cameraFolder.addMonitor(PARAMS, 'CamPositionZ', { title: 'Number', });

        blurFolder = pane.addFolder({ title: 'BlurSettings', expanded: false, });
        blurFolder.addInput(PARAMS, 'blurX', { min: 0, max: 15 });
        blurFolder.addInput(PARAMS, 'blurY', { min: 0, max: 15 });
    }
    fpCtlSetup() {
        controls = new FirstPersonControls(cameraContainer, renderer.domElement);
        controls.lookSpeed = 0.05;
        controls.movementSpeed = 4;
        controls.noFly = true;
        controls.lookVertical = true;
        controls.constrainVertical = true;
        controls.autoForward = false;
        controls.activeLook = false;
        controls.constrainVertical = true;
        controls.verticalMin = 1.0;
        controls.verticalMax = 2.0;
    }

    loadModel(url) {
        return new Promise(resolve => {
            var gltfLoader = new GLTFLoader(manager);
            gltfLoader.setPath(url);
            gltfLoader.load('obj.glb', function(gltf) {
                gltf.scene.traverse(function(child) {
                    mergeObj.push(child.geometry);
                });
                resolve(gltf.scene);
            });
        });
    }
};

function animate() {
    if (PARAMS.viewMode == 1 || PARAMS.viewMode == 2) {
        controls.update(clock.getDelta());
    } else {
        mixer.update(clock.getDelta());
    }

    if (breakAnimation) {
        for (let i = 0; i < pointCloud.geometry.attributes.position.array.length; i += 3) {
            let rn = Math.ceil(Math.random() * 10);
            if (rn % 3 == 0) {
                let dx = (Math.random() - 0.5) * 2;
                let dy = (Math.random() - 0.5) * 2;
                let dz = (Math.random() - 0.5) * 2;

                pointCloud.geometry.attributes.position.array[i] += dx;
                pointCloud.geometry.attributes.position.array[i + 1] += dy;
                pointCloud.geometry.attributes.position.array[i + 2] += dz;
            }
        }
        blurScreen.radius.x = (Math.random() - 0.5) * 10;
        blurScreen.radius.y = (Math.random() - 0.5) * 10;
    }

    render();
}

function render() {
    stats.begin();
    frame.update(clock.getDelta()).updateNode(nodepass.material); 

    if (cameraFolder.expanded) {
        PARAMS.CamRotationX = cameraContainer.rotation.x;
        PARAMS.CamRotationY = cameraContainer.rotation.y;
        PARAMS.CamRotationZ = cameraContainer.rotation.z;
        PARAMS.CamPositionX = -firstPosition.x + cameraContainer.position.x;
        PARAMS.CamPositionY = -firstPosition.y + cameraContainer.position.y;
        PARAMS.CamPositionZ = -firstPosition.z + cameraContainer.position.z;
    }

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
        if (cameraContainer.position.y < 0.5) { //最低値
            cameraContainer.position.y = 0.5;
        } else if (cameraContainer.position.y > 60) { //最高値
            cameraContainer.position.y = 60;
        }
    }
    stats.end();
    // renderer.render(scene, camera);
    pointCloud.geometry.attributes.position.needsUpdate = true;
    composer.render();
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
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