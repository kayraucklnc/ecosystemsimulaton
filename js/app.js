var canvas;

var leftDrag = false;
var middleDrag = false;
var mouseInit = vec2(0, 0);
var leftDragAmount = vec2(0, 0);
var lastRotation = vec2(0, 0);
var lastTranslation = vec2(0, 0);
var zoom = -8;
var middleDragAmount = vec2(0, 0);

// main()

// // ------------------------------------------------------------------------------------
// Renderer renderer = new Renderer();
// Renderable r1 = Renderable(vertecies, renderMode, optionalVShader, optionalFShader);

// PrimativeGrid pg = new PrimativeGrid();
// Renderable r2 = pg.renderable;

// PrimativeFox fox = new PrimativeFox();
// Renderable r3 = cow.renderable;

// Terrain terrain = new Terrain(scale, pos, resulution);
// Renderable r4 = terrain.renderable;

// renderer.objects.add(r1);
// renderer.objects.add(r2);
// renderer.objects.add(r3);
// renderer.objects.add(r4);

// renderer.startLoop();
// // .................
// renderer.stopLoop();
// ------------------------------------------------------------------------------------

let gameObjectList = [];

function loop(){
  gameObjectList.forEach((x) => x.update());
}

var InitNewDemo = function () {
  document.addEventListener("mousedown", mouseDown);
  document.addEventListener("mouseup", mouseUp);
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("wheel", scroll);

  gameObjectList.push(new Tree(new Vector2(0, 0), new Vector2(0,0)));
  gameObjectList.push(new Human(new Vector2(10, 5), new Vector2(0,0)))
  setInterval(loop, 1000/1);
};

var InitDemo = function () {
  document.addEventListener("mousedown", mouseDown);
  document.addEventListener("mouseup", mouseUp);
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("wheel", scroll);

  console.log("This is working");

  canvas = document.getElementById("world-surface");
  var gl = canvas.getContext("webgl");

  if (!gl) {
    console.log("WebGL not supported, falling back on experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
  }

  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  //
  // Create shaders
  //

  var program = initShaders(gl, "shaders/testVs.glsl", "shaders/testFs.glsl");

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
    return;
  }

  var boxVertices = [
    // X, Y, Z           R, G, B
    // Top
    -1.0, 1.0, -1.0, 0.5, 0.5, 0.5, -1.0, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0, 1.0,
    1.0, 0.5, 0.5, 0.5, 1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

    // Left
    -1.0, 1.0, 1.0, 0.75, 0.25, 0.5, -1.0, -1.0, 1.0, 0.75, 0.25, 0.5, -1.0,
    -1.0, -1.0, 0.75, 0.25, 0.5, -1.0, 1.0, -1.0, 0.75, 0.25, 0.5,

    // Right
    1.0, 1.0, 1.0, 0.25, 0.25, 0.75, 1.0, -1.0, 1.0, 0.25, 0.25, 0.75, 1.0,
    -1.0, -1.0, 0.25, 0.25, 0.75, 1.0, 1.0, -1.0, 0.25, 0.25, 0.75,

    // Front
    1.0, 1.0, 1.0, 1.0, 0.0, 0.15, 1.0, -1.0, 1.0, 1.0, 0.0, 0.15, -1.0, -1.0,
    1.0, 1.0, 0.0, 0.15, -1.0, 1.0, 1.0, 1.0, 0.0, 0.15,

    // Back
    1.0, 1.0, -1.0, 0.0, 1.0, 0.15, 1.0, -1.0, -1.0, 0.0, 1.0, 0.15, -1.0, -1.0,
    -1.0, 0.0, 1.0, 0.15, -1.0, 1.0, -1.0, 0.0, 1.0, 0.15,

    // Bottom
    -1.0, -1.0, -1.0, 0.5, 0.5, 1.0, -1.0, -1.0, 1.0, 0.5, 0.5, 1.0, 1.0, -1.0,
    1.0, 0.5, 0.5, 1.0, 1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
  ];

  var boxIndices = [
    // Top
    0, 1, 2, 0, 2, 3,

    // Left
    5, 4, 6, 6, 4, 7,

    // Right
    8, 9, 10, 8, 10, 11,

    // Front
    13, 12, 14, 15, 14, 12,

    // Back
    16, 17, 18, 16, 18, 19,

    // Bottom
    21, 20, 22, 22, 20, 23,
  ];

  var boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

  var boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(boxIndices),
    gl.STATIC_DRAW
  );

  var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  var colorAttribLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  // Tell OpenGL state machine which program should be active.
  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);

  glMatrix.mat4.identity(worldMatrix);
  glMatrix.mat4.lookAt(viewMatrix, [0, 0, zoom], [0, 0, 0], [0, 1, 0]);

  glMatrix.mat4.perspective(
    projMatrix,
    glMatrix.glMatrix.toRadian(45),
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000.0
  );

  var xRotationMatrix = new Float32Array(16);
  var yRotationMatrix = new Float32Array(16);

  var identityMatrix = new Float32Array(16);
  glMatrix.mat4.identity(identityMatrix);

  function loop() {
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, zoom], [0, 0, 0], [0, 1, 0]);

    var rotatedVec3 = glMatrix.vec3.fromValues(
      -middleDragAmount[0],
      -middleDragAmount[1],
      0
    );

    glMatrix.vec3.rotateX(
      rotatedVec3,
      rotatedVec3,
      glMatrix.vec3.fromValues(0, 0, 0),
      -leftDragAmount[1]
    );
    glMatrix.vec3.rotateY(
      rotatedVec3,
      rotatedVec3,
      glMatrix.vec3.fromValues(0, 0, 0),
      -leftDragAmount[0]
    );

    glMatrix.mat4.rotate(
      xRotationMatrix,
      identityMatrix,
      leftDragAmount[0],
      [0, 1, 0]
    );
    glMatrix.mat4.rotate(
      yRotationMatrix,
      identityMatrix,
      leftDragAmount[1],
      [1, 0, 0]
    );

    glMatrix.mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
    glMatrix.mat4.translate(worldMatrix, worldMatrix, rotatedVec3);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    document.getElementById("translations").innerHTML =
      "translations " +
      middleDragAmount[0].toFixed(2) +
      " " +
      middleDragAmount[1].toFixed(2);
    document.getElementById("rotations").innerHTML =
      "rotations " +
      leftDragAmount[0].toFixed(2) +
      " " +
      leftDragAmount[1].toFixed(2);
    document.getElementById("rotatedVec").innerHTML =
      "rotatedVec " +
      rotatedVec3[0].toFixed(2) +
      " " +
      rotatedVec3[1].toFixed(2);
  }
  setInterval(loop, 1000 / 60);
};
