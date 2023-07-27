import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

//Creating a loading screen: onStart, onProgress, onError, onLoad
const loadingScreen = new THREE.LoadingManager();
const progressBar = document.getElementById("progress-bar");
loadingScreen.onProgress = function (url, itemsLoaded, itemsTotal) {
  progressBar.value = (itemsLoaded / itemsTotal) * 100;
};
const progressBarContainer = document.querySelector(".progress-bar-container");
loadingScreen.onLoad = function () {
  progressBarContainer.style.display = "none";
};

//create canvas
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

//create a scene: background (sky)
const scene = new THREE.Scene();

//sky
const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  "/enviroment/px.png",
  "/enviroment/nx.png",
  "/enviroment/py.png",
  "/enviroment/ny.png",
  "/enviroment/pz.png",
  "/enviroment/nz.png",
]);
scene.background = texture;
//LIGHT
const color = 0xffffff;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

//SIZE SCREEN
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//we need a camera set up
const fov = 45;
const aspect = sizes.width / sizes.height; // the canvas default: base on size canvas
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
scene.add(camera);

//Camera fixed size
function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * 1.5); //need change this to snap into middle of object
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  const direction = new THREE.Vector3()
    .subVectors(camera.position, boxCenter)
    .multiply(new THREE.Vector3(1, 0, 1))
    .normalize();

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  camera.updateProjectionMatrix();

  //console.log(boxCenter);
  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

//AUDIO
// create an AudioListener and add it to the camera
var audioLoader = new THREE.AudioLoader();
var listener = new THREE.AudioListener();
var audio = new THREE.Audio(listener);
audioLoader.load("/HowlsMovingCastle.mp3", function (buffer) {
  audio.setBuffer(buffer);
  audio.setLoop(true);
  sound.setVolume(0.5);
  audio.play();
});
// const listener = new THREE.AudioListener();
// camera.add(listener);
// // create a global audio source
// const sound = new THREE.Audio(listener);
// // load a sound and set it as the Audio object's buffer
// const audioLoader = new THREE.AudioLoader();
// audioLoader.load("/HowlsMovingCastle.mp3", function (buffer) {
//   sound.setBuffer(buffer);
//   sound.setLoop(true);
//   sound.setVolume(0.5);
//   sound.play();
// });

//Next up we set up 3d object; Put element loading
const gltfLoader = new GLTFLoader(loadingScreen);
gltfLoader.load("/scene.gltf", (gltf) => {
  const root = gltf.scene;
  scene.add(root);

  // compute the box that contains all the stuff
  // from root and below
  const box = new THREE.Box3().setFromObject(root);

  const boxSize = box.getSize(new THREE.Vector3()).length();
  const boxCenter = box.getCenter(new THREE.Vector3());

  // set the camera to frame the box
  frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

  // update the Trackball controls to handle the new size
  controls.maxDistance = boxSize * 10;
  controls.target.copy(boxCenter);
  controls.update();
});

//RENDERER: put everything in the scene to render
// const canvas = document.querySelector(".webgl");
// const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

//CONTROL
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();
controls.enablePan = false;
controls.enableZoom = true;
controls.zoomSpeed = 1.5;

//Resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});
//ANIMATION - LOOP
function animate() {
  requestAnimationFrame(animate);

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;
  // required if controls.enableDamping or controls.autoRotate are set to true

  renderer.render(scene, camera);
}

animate();
if (WebGL.isWebGLAvailable()) {
  // Initiate function or other initializations here
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  console.log(warning);
  document.getElementById("container").appendChild(warning);
}
