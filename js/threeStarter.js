import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";

var fShader = document.getElementById("fragmentShader").text;
var vShader = document.getElementById("vertexShader").text;

function threeStarter() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, 500 / 500, 0.1, 1000);
  camera.position.y = 3;
  const renderer = new THREE.WebGLRenderer();

  renderer.setSize(500, 500);
  document.body.appendChild(renderer.domElement);

  var raycaster = new THREE.Raycaster();
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);

  // controls.maxPolarAngle = Math.PI / 2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const plane = new THREE.PlaneGeometry(12, 12, 90, 90);

  const cube1 = new THREE.SphereGeometry(0.2);

  var uniforms3 = THREE.UniformsUtils.merge([
    THREE.UniformsLib["lights"],
    {
      diffuse: { type: "c", value: new THREE.Color(0x0000ff) },
      color: { type: "c", value: new THREE.Color("yellow") },
    },
  ]);

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms3,
    vertexShader: vShader,
    fragmentShader: fShader,
    lights: true,
  });

  var planeMat = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
  });

  const A = new THREE.Mesh(cube1, material);
  const C = new THREE.Mesh(plane, planeMat);
  const arr = C.geometry.attributes.position.array;
  for (let i = 0; i < arr.length; i += 3) {
    let x = C.geometry.attributes.position.array[i];
    let y = C.geometry.attributes.position.array[i + 1];
    C.geometry.attributes.position.array[i + 2] = perlin.get(x,y)*1.5;
  }
  C.rotation.x = Math.PI/2;

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 0);
  scene.add(directionalLight);
  scene.add(A);
  scene.add(C);

  camera.position.z = 6;

  var mouse = {
    x: undefined,
    y: undefined,
  }

  function animate() {
    requestAnimationFrame(animate);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(C);
    if(intersects.length > 0){
      A.position.x = intersects[0].point.x;
      A.position.y = intersects[0].point.y;
      A.position.z = intersects[0].point.z;
    }


    controls.update();
    renderer.render(scene, camera);
    A.rotation.y += 0.009;
    A.rotation.z += 0.005;
  }
  animate();
  addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / 500) * 2 - 1;
    mouse.y = -(event.clientY / 500) * 2 + 1;
  })
}
window.onload = threeStarter();
