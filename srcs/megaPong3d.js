import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';



const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000); //

const controls = new OrbitControls(camera, renderer.domElement);

const axis = new THREE.AxesHelper(10);

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);
scene.add(axis);

camera.position.set(-10, 30, 30);
controls.update();

const planeGeometry = new THREE.PlaneGeometry(60, 60);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);
scene.add(plane);

function animate() 
{
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);
