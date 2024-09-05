// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// Import the OBJLoader
import { OBJLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader.js";
// Import the postprocessing libraries
import { EffectComposer } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/RenderPass.js";
import { BokehPass } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/postprocessing/BokehPass.js";

import vertexShader from "../Threejs/shaders/vertex.js";
import fragmentShader from "../Threejs/shaders/fragment.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(1.5);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Define the custom shader material
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 } },
});

let loadedObject;

// Instantiate a loader
const loader = new OBJLoader();

// Load a resource
loader.load(
    // Resource URL
    "./Threejs/WEB_O_FINAL.obj",
    // Called when resource is loaded
    function (object) {
        // Apply the custom shader material to the loaded object
        object.traverse((child) => {
            if (child.isMesh) {
                child.geometry.center();
                child.material = material;
            }
        });

        loadedObject = object;
        scene.add(object);
    },
    // Called when loading is in progress
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // Called when loading has errors
    function (error) {
        console.log('An error happened');
    }
);

// Set up postprocessing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bokehPass = new BokehPass(scene, camera, {
    focus: 1.0,
    aperture: 0.025,
    maxblur: 0.01,
});
composer.addPass(bokehPass);

function animate() {
    requestAnimationFrame(animate);

    if (loadedObject) {
      loadedObject.rotation.y += 0.0007; // Rotate around the Y axis
      loadedObject.rotation.x += 0.0005; // Rotate around the X axis (optional)
  }

    // Optional: Update the uTime uniform for animations
    material.uniforms.uTime.value += 0.01;

    //camera.rotation.z += 0.001;

    // Use composer to render the scene with postprocessing
    composer.render();
}

// Start animation loop
animate();

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
});
