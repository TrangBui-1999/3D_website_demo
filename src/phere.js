import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import WebGL from "three/addons/capabilities/WebGL.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
const loader = new THREE.TextureLoader();

//create a scene
const scene = new THREE.Scene();

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
//aim the camera: length between camera lens and object; if too much, we will be in obj => black screen
camera.position.z = 20;
//CAMERA
scene.add(camera);

//Next up we create a BoxGeometry which contains the data for a box.
const radius = 3;
const detail = 64;
const geometry = new THREE.SphereGeometry(radius, detail, detail);
const boxWidth = 3;
const boxHeight = 3;
const boxDepth = 3;
//const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
//We also create a MeshBasicMaterial which is a material that uses the color
const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
// const material = new THREE.MeshBasicMaterial({
//   map: loader.load("./public/moon.jpg"),
// });
//To create a mesh: we need a geometry and a material.
const cube = new THREE.Mesh(geometry, material);
//MESH
scene.add(cube);

//LIGHT
const color = 4553629;
const intensity = 10;
const light = new THREE.PointLight(color, intensity, 100);
light.position.set(0, 10, 10); //position:x-y-z
scene.add(light);

//We also need to change the material.
//The MeshBasicMaterial is not affected by lights. Let's change it to a MeshPhongMaterial which is affected by lights.
//const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });

//We can then render the scene: need canvas, camera, scene, light
//ask three.js to draw into that canvas
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

//CONTROL
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = true;
controls.enablePan = false;
controls.zoomSpeed = 0.5;
controls.autoRotate = true;
controls.autoRotateSpeed = 5;
controls.minDistance = 10;
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
  controls.update();
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
