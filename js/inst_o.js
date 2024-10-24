// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// Import the OBJLoader
import { OBJLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader.js";


// Create a Three.JS Scene
const scene = new THREE.Scene();

// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg2"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // Set background to white
camera.position.setZ(10);

renderer.render(scene, camera);

// Load the Matcap texture
const textureLoader = new THREE.TextureLoader();
textureLoader.load("../js/MATCAP.png", (matcapTexture) => {
    // Create MeshMatcapMaterial with the loaded texture
    const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });

    // Load the OBJ model
    const objLoader = new OBJLoader();
    objLoader.load(
        // resource URL
        "../Threejs/O_REMESHED.obj",

        // onLoad callback
        function (obj) {
            // Get the geometry of the loaded object
            let geometry;

            obj.traverse((child) => {
                if (child.isMesh) {
                    geometry = child.geometry;
                }
            });

            if (!geometry) {
                console.error("Geometry not found in the loaded object.");
                return;
            }

            // Create an InstancedMesh
            const count = 100; // Number of instances
            const instancedMesh = new THREE.InstancedMesh(geometry, material, count);

            const matrix = new THREE.Matrix4();
            for (let i = 0; i < count; i++) {
                randomizeMatrix(matrix);
                instancedMesh.setMatrixAt(i, matrix);
            }

            scene.add(instancedMesh);

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);

                instancedMesh.rotation.x += 0.001;
                instancedMesh.rotation.y += 0.002;

                // Render the scene
                controls.update();
                renderer.render(scene, camera);
            }

            animate();
        },

        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },

        // onError callback
        function (err) {
            console.error("An error happened:", err);
        }
    );
});

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Randomize matrix function similar to the instancing example
function randomizeMatrix(matrix) {
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    position.x = Math.random() * 40 - 20;
    position.y = Math.random() * 40 - 20;
    position.z = Math.random() * 40 - 20;

    quaternion.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
    ).normalize();

    scale.x = scale.y = scale.z = Math.random() * 2.0;

    matrix.compose(position, quaternion, scale);
}
