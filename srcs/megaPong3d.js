import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

function makeParalellepiped(x, y, z, dx, dy, dz, color) 
{
  console.log(`Creating box with color: ${color}`); // Debugging line
  const material = new THREE.MeshStandardMaterial({ color: color });
  const box = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), material); 
  box.position.set(x + dx / 2, y + dy / 2, z + dz / 2);
  return box;
}

const canvas = document.getElementById('canvas');

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 10000);

const controls = new OrbitControls(camera, renderer.domElement);

let player1Score = 0;
let player2Score = 0;


const gridHelper = new THREE.GridHelper(5000, 100, 0x808080);
scene.add(gridHelper);

camera.position.set(0, 5000, 0);
controls.update();

const planeGeometry = new THREE.PlaneGeometry(3000, 2000);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // grey 0x808080
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -100
// make the plane receive less light
plane.receiveShadow = true;
scene.add(plane);

//
// make ambient light
//

// white light 0xffffff


const geometry = new THREE.BoxGeometry(10, 10, 10);	
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // green 0x00ff00
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const cubeBoundingBox = new THREE.Box3().setFromObject(cube);

const pointLight = new THREE.PointLight(0xffffff, 100000, 1000); // White light with intensity 1 and distance 100
scene.add(pointLight);

// make the pong table using makeParalellepiped
const table1 = makeParalellepiped(-1300, 0, 500, 2500, 100, 100, 0x800080); // purple 0x800080
const table2 = makeParalellepiped(-1300, 0, -600, 2500, 100, 100, 0x800080); // purple 0x800080
const paddle1 = makeParalellepiped(-800, 0, 0, 2, 10, 150, 0x008000); // green 0x008000
const paddle2 = makeParalellepiped(800, 0, 0, 2, 10, 150, 0x008000); // green 0x008000

scene.add(table1);
scene.add(table2);
scene.add(paddle1);
scene.add(paddle2);

const table1BoundingBox = new THREE.Box3().setFromObject(table1);
const table2BoundingBox = new THREE.Box3().setFromObject(table2);
const paddle1BoundingBox = new THREE.Box3().setFromObject(paddle1);
const paddle2BoundingBox = new THREE.Box3().setFromObject(paddle2);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Variables to track cube movement
let cubeSpeedx = 5;
let cubeSpeedz = 5;
let shakeDuration = 0;
const shakeIntensity = 15;

// Variables to track paddle movement
let paddle1Speed = 0;
let paddle2Speed = 0;
const paddleSpeed = 10; // Speed of the paddles

// Event listeners for keydown and keyup
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w': // Move paddle1 up
      paddle1Speed = -paddleSpeed;
      break;
    case 's': // Move paddle1 down
      paddle1Speed = paddleSpeed;
      break;
    case 'ArrowUp': // Move paddle2 up
      paddle2Speed = -paddleSpeed;
      break;
    case 'ArrowDown': // Move paddle2 down
      paddle2Speed = paddleSpeed;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 's':
      paddle1Speed = 0;
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      paddle2Speed = 0;
      break;
  }
});

function movePaddles() {
  // Move paddles
  paddle1.position.z += paddle1Speed;
  paddle2.position.z += paddle2Speed;

  // Update paddles' bounding boxes
  paddle1BoundingBox.setFromObject(paddle1);
  paddle2BoundingBox.setFromObject(paddle2);
}

function applyCameraShake() {
  if (shakeDuration > 0) {
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;
    const shakeZ = (Math.random() - 0.5) * shakeIntensity;
    camera.position.x += shakeX;
    camera.position.y += shakeY;
    camera.position.z += shakeZ;
    shakeDuration--;
  }
  if (shakeDuration == 0) {
    camera.position.set(0, 500, 0);
  }
}

function increaseSpeed() 
{
  if (cubeSpeedx > 0) 
  {
    cubeSpeedx += 0.1;
  }
  else 
  {
    cubeSpeedx -= 0.1;
  }
  if (cubeSpeedz > 0) 
  {
    cubeSpeedz += 0.1;
  }
  else 
  {
    cubeSpeedz -= 0.1;
  }
}

function checkIntersections() {
  cubeBoundingBox.setFromObject(cube);

  if (cubeBoundingBox.intersectsBox(table1BoundingBox) || cubeBoundingBox.intersectsBox(table2BoundingBox)) {
    cubeSpeedz *= -1;
    console.log(cubeSpeedz);
    shakeDuration = 20;
    increaseSpeed();
  }
  if (cubeBoundingBox.intersectsBox(paddle1BoundingBox) || cubeBoundingBox.intersectsBox(paddle2BoundingBox)) {
    cubeSpeedx *= -1;
    console.log(cubeSpeedx);
    shakeDuration = 20;
    increaseSpeed();
  }

  // add paddle collision with table
  if (paddle1BoundingBox.intersectsBox(table1BoundingBox) || paddle1BoundingBox.intersectsBox(table2BoundingBox)) {
    paddle1.position.z -= paddle1Speed;
  }
  if (paddle2BoundingBox.intersectsBox(table1BoundingBox) || paddle2BoundingBox.intersectsBox(table2BoundingBox)) {
    paddle2.position.z -= paddle2Speed;
  }
}

function moveCube() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  cube.position.x += cubeSpeedx;
  cube.position.z += cubeSpeedz;
  pointLight.position.copy(cube.position);

  if (cube.position.x > 1000)
  {
    cube.position.set(0, 0, 0);
    cubeSpeedx = 5;
    cubeSpeedz = 5;
    player1Score++;
    document.getElementById('player1score').innerHTML = player1Score;
  }
  else if(cube.position.x < -1000) 
  {
    cube.position.set(0, 0, 0);
    cubeSpeedx = -5;
    cubeSpeedz = -5;
    player2Score++;
    document.getElementById('player2score').innerHTML = player2Score;
  }

  cubeBoundingBox.setFromObject(cube);
}

function paddle1AI(paddle, cube) 
{
  if(cube.position.x < 0)
  {
    if (paddle.position.z > cube.position.z)
    {
      paddle.position.z -= paddleSpeed;
    } 
    else if (paddle.position.z < cube.position.z) 
    {
      paddle.position.z += paddleSpeed;
    } 
  }
}

function animate() 
{
  if (player1Score < 7 && player2Score < 7) {
    moveCube();
    movePaddles();
    paddle1AI(paddle1, cube);
    checkIntersections();
    applyCameraShake();
    renderer.render(scene, camera);
  }
}

renderer.setAnimationLoop(animate);