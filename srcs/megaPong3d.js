import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

// Constants
const PADDLE_SPEED = 10;
const CUBE_INITIAL_SPEED = 20;
const SHAKE_INTENSITY = 15;
const SHAKE_DURATION = 20;
const PADDLE_COLOR = 0x008000;
const TABLE_COLOR = 0x800080;
const PLANE_COLOR = 0x000000;
const CUBE_COLOR = 0x00ff00;
const POINT_LIGHT_INTENSITY = 1000000;
const POINT_LIGHT_DISTANCE = 1000;
const AMBIENT_LIGHT_INTENSITY = 1;

// Variables
let player1Score = 0;
let player2Score = 0;
let cubeSpeedx = CUBE_INITIAL_SPEED;
let cubeSpeedz = 0;
let shakeDuration = 0;
let paddle1Speed = 0;
let paddle2Speed = 0;

// Scene Setup
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5000, 0);
controls.update();

// Helpers
const gridHelper = new THREE.GridHelper(5000, 100, 0x808080);
scene.add(gridHelper);

// Plane
const planeGeometry = new THREE.PlaneGeometry(3000, 2000);
const planeMaterial = new THREE.MeshStandardMaterial({ color: PLANE_COLOR });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -100;
plane.receiveShadow = true;
scene.add(plane);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, POINT_LIGHT_INTENSITY, POINT_LIGHT_DISTANCE);
scene.add(pointLight);

// Cube
const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: CUBE_COLOR });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);
const cubeBoundingBox = new THREE.Box3().setFromObject(cube);

// Paddles and Table
const table1 = makeParalellepiped(-1300, 0, 500, 2500, 100, 100, TABLE_COLOR);
const table2 = makeParalellepiped(-1300, 0, -600, 2500, 100, 100, TABLE_COLOR);
const paddle1 = makeParalellepiped(-800, 0, 0, 4, 10, 200, PADDLE_COLOR);
const paddle2 = makeParalellepiped(800, 0, 0, 4, 10, 200, PADDLE_COLOR);

scene.add(table1);
scene.add(table2);
scene.add(paddle1);
scene.add(paddle2);

const table1BoundingBox = new THREE.Box3().setFromObject(table1);
const table2BoundingBox = new THREE.Box3().setFromObject(table2);
const paddle1BoundingBox = new THREE.Box3().setFromObject(paddle1);
const paddle2BoundingBox = new THREE.Box3().setFromObject(paddle2);

// Functions
function makeParalellepiped(x, y, z, dx, dy, dz, color) 
{
  const material = new THREE.MeshStandardMaterial({ color: color });
  const box = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), material);
  box.position.set(x + dx / 2, y + dy / 2, z + dz / 2);
  return box;
}

function handlePaddleControls() 
{
  document.addEventListener('keydown', (event) => 
  {
    switch (event.key) 
    {
      case 'w':
        paddle1Speed = -PADDLE_SPEED;
        break;
      case 's':
        paddle1Speed = PADDLE_SPEED;
        break;
      case 'ArrowUp':
        paddle2Speed = -PADDLE_SPEED;
        break;
      case 'ArrowDown':
        paddle2Speed = PADDLE_SPEED;
        break;
    }
  });

  document.addEventListener('keyup', (event) => 
  {
    switch (event.key) 
    {
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
}

function movePaddles() 
{
  paddle1.position.z += paddle1Speed;
  paddle2.position.z += paddle2Speed;
  paddle1BoundingBox.setFromObject(paddle1);
  paddle2BoundingBox.setFromObject(paddle2);
}

function applyCameraShake() 
{
  if (shakeDuration > 0) 
  {
    const shakeX = (Math.random() - 0.5) * SHAKE_INTENSITY;
    const shakeY = (Math.random() - 0.5) * SHAKE_INTENSITY;
    const shakeZ = (Math.random() - 0.5) * SHAKE_INTENSITY;
    camera.position.x += shakeX;
    camera.position.y += shakeY;
    camera.position.z += shakeZ;
    shakeDuration--;
  }
  if (shakeDuration == 0)   
  {
    camera.position.set(0, 500, 0);
  }
}

function increaseSpeed() 
{
  if (cubeSpeedx < 20 && cubeSpeedx > -20)
    cubeSpeedx += (cubeSpeedx > 0) ? 0.2 : -0.2;
}

function checkIntersections() 
{
  cubeBoundingBox.setFromObject(cube);

  if (cubeBoundingBox.intersectsBox(table1BoundingBox) || cubeBoundingBox.intersectsBox(table2BoundingBox)) 
  {
    cubeSpeedz *= -1;
    shakeDuration = SHAKE_DURATION;
  }

  if (cubeBoundingBox.intersectsBox(paddle1BoundingBox)) 
  {
    cubeSpeedx *= -1;
    shakeDuration = SHAKE_DURATION;
    increaseSpeed();
    adjustCubeDirection(paddle1);
    console.log(cubeSpeedx);
  }

  if (cubeBoundingBox.intersectsBox(paddle2BoundingBox)) 
  {
    cubeSpeedx *= -1;
    shakeDuration = SHAKE_DURATION;
    increaseSpeed();
    adjustCubeDirection(paddle2);
    console.log(cubeSpeedx);
  }

  if (paddle1BoundingBox.intersectsBox(table1BoundingBox) || paddle1BoundingBox.intersectsBox(table2BoundingBox)) 
  {
    paddle1.position.z -= paddle1Speed;
  }
  if (paddle2BoundingBox.intersectsBox(table1BoundingBox) || paddle2BoundingBox.intersectsBox(table2BoundingBox)) 
  {
    paddle2.position.z -= paddle2Speed;
  }
}

function adjustCubeDirection(paddle) 
{
  const relativeIntersectZ = (paddle.position.z + (paddle.geometry.parameters.depth / 2)) - cube.position.z;
  const normalizedIntersectZ = (relativeIntersectZ / (paddle.geometry.parameters.depth / 2)) - 1;
  cubeSpeedz = normalizedIntersectZ * 5; // Adjust the multiplier as needed
}

function respawnCube() 
{
  cube.position.set(0, 0, 0);
  cubeSpeedx = CUBE_INITIAL_SPEED;
  cubeSpeedz = 0;
}

function moveCube()
{
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  cube.position.x += cubeSpeedx;
  cube.position.z += cubeSpeedz;
  pointLight.position.copy(cube.position);

  if (cube.position.x > 1000) 
  {
    respawnCube();
    player1Score++;
    document.getElementById('player1score').innerHTML = player1Score;
  } else if (cube.position.x < -1000) 
  {
    respawnCube();
    player2Score++;
    document.getElementById('player2score').innerHTML = player2Score;
  }

  cubeBoundingBox.setFromObject(cube);
}

function paddle1AI(paddle, cube) 
{
  if (cube.position.x < 0) 
  {
    if (paddle.position.z > cube.position.z && paddle.position.z > -500) 
    {
      // check if the paddle is not out of bounds
      if (paddle.position.z + paddle.geometry.parameters.depth / 2 > 500)
      {
        paddle.position.z = 500 - paddle.geometry.parameters.depth / 2;
      }
      else 
      {
        paddle.position.z -= PADDLE_SPEED;
      }
    }
    else if (paddle.position.z < cube.position.z && paddle.position.z < 500) 
    {
      // check if the paddle is not out of bounds
      if (paddle.position.z - paddle.geometry.parameters.depth / 2 < -500)
      {
        paddle.position.z = -500 + paddle.geometry.parameters.depth / 2;
      }
      else 
      {
        paddle.position.z += PADDLE_SPEED;
      }
    }
  }
}

function animate() 
{
  if (player1Score < 7 && player2Score < 7) 
  {
    movePaddles();
    checkIntersections();
    moveCube();
    paddle1AI(paddle1, cube);
    applyCameraShake();
    renderer.render(scene, camera);
  }
}

handlePaddleControls();
renderer.setAnimationLoop(animate);