if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var camera, cameraControls, scene, renderer, mesh;
var group;

var clock = new THREE.Clock();

var mesh;
/*
//pointerlock
var havePointerLock = checkForPointerLock();
var controls, controlsEnabled;
var moveForward,
    moveBackward,
    moveLeft,
    moveRight,
    canJump;
var velocity = new THREE.Vector3();

function checkForPointerLock() {
  return 'pointerLockElement' in document || 
           'mozPointerLockElement' in document || 
                    'webkitPointerLockElement' in document;
                    }

function initPointerLock() {
    var element = document.body;

    if (havePointerLock) {
        var pointerlockchange = function (event) {
            if (document.pointerLockElement === element ||
                    document.mozPointerLockElement === element ||
                    document.webkitPointerLockElement === element) {
                        controlsEnabled = true;
                        controls.enabled = true;
                    } else {
                        controlsEnabled = false;
                        controls.enabled = false;
                    }
        };

        var pointerlockerror = function (event) {
            element.innerHTML = 'PointerLock Error';
        };

        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        var requestPointerLock = function(event) {
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            element.requestPointerLock();
        };
        element.addEventListener('click', requestPointerLock, false);
    } else {
        element.innerHTML = 'Bad browser; No pointer lock';
    }
}
//end pointerlock

//controls
function onKeyDown(e) {
  switch (e.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = true;
      break;
    case 37: // left
    case 65: // a
      moveLeft = true;
      break;
    case 40: // down
    case 83: // s
      moveBackward = true;
      break;
    case 39: // right
    case 68: // d
      moveRight = true;
      break;
    case 32: // space
      if (canJump === true) velocity.y += 350;
      canJump = false;
      break;
  }
}

function onKeyUp(e) {
  switch(e.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = false;
      break;
    case 37: // left
    case 65: // a
      moveLeft = false;
      break;
    case 40: // down
    case 83: // s
      moveBackward = false;
      break;
    case 39: // right
    case 68: // d
      moveRight = false;
      break;
  }
}
function initControls() {
  document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    }

function updateControls() {
  if (controlsEnabled) {
    var delta = clock.getDelta();
    var walkingSpeed = 200.0;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta;

    if (moveForward) velocity.z -= walkingSpeed * delta;
    if (moveBackward) velocity.z += walkingSpeed * delta;
    if (moveLeft) velocity.x -= walkingSpeed * delta;
    if (moveRight) velocity.x += walkingSpeed * delta;

    controls.getObject().translateX(velocity.x * delta);
    controls.getObject().translateY(velocity.y * delta);
    controls.getObject().translateZ(velocity.z * delta);

   }
}
//end contorls
*/
function init() {
    //initPointerLock();
    //initControls();
     //renderer

    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1,  10000 );
    //camera = new THREE.OrthographicCamera(   window.innerWidth / - 16, window.innerWidth / 16,window.innerHeight / 16, window.innerHeight / - 16, -200, 500);
    //camera.position.z = -1000;
    camera.position.set(0, 0, -1000);

    cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    scene = new THREE.Scene();

    // lights

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0x002288 );
    light.position.set( -1, -1, -1 );
    scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    scene.add( light );

    material = new THREE.MeshBasicMaterial({
        wireframe: true,
             color: 'black'
    });

    //now, we load the thing
    makeMesh();

    window.addEventListener( 'resize', onWindowResize, false );
}


function makeGeometry(){
    var geom = new THREE.Geometry();
    var vertices = Triangulate.threeVertices;
    var triangles = Triangulate.triangles;

    console.log(vertices);
    console.log(triangles);

    var heights = Triangulate.vertexHeights;
    var idx = 0;
    //for each vertex
    for (var i = triangles.length; i; ){
        //push the three points
        i--;
        var v1 = new THREE.Vector3(vertices[triangles[i]][0], vertices[triangles[i]][1], heights[triangles[i]]);
        i--;
        var v2 = new THREE.Vector3(vertices[triangles[i]][0], vertices[triangles[i]][1], heights[triangles[i]]);
        i--;
        var v3 = new THREE.Vector3(vertices[triangles[i]][0], vertices[triangles[i]][1], heights[triangles[i]]);

        geom.vertices.push(v1);
        geom.vertices.push(v2);
        geom.vertices.push(v3);

        geom.faces.push( new THREE.Face3( idx++, idx++, idx++));

        geom.computeFaceNormals();
    }



    for ( var i = 0; i < geom.faces.length; i ++ ) {
        //console.log(vertices[geom.faces[i]].a);
        var vertex = geom.vertices[geom.faces[i].a];
        var color = Triangulate.getColorOfFace(geom.vertices[geom.faces[i].a], geom.vertices[geom.faces[i].b], geom.vertices[geom.faces[i].c]);
        var string = '0x' + color.toHex().substring(1, color.toHex().length);
        geom.faces[ i ].color.setHex( string);
    }

    return geom;
}


function makeMesh(){
    var geom = makeGeometry();
    var material = new THREE.MeshPhongMaterial( {
        vertexColors: THREE.FaceColors,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1
    } );

    mesh = new THREE.Mesh(geom, material);

    scene.add(mesh);
    // wireframe
    /*
       var helper = new THREE.EdgesHelper( mesh, 0xffffff ); // or THREE.WireframeHelper
       scene.add( helper );
       */
    //mesh.rotation.y = -Math.PI * .5;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function animate() {

    var delta = clock.getDelta();

    requestAnimationFrame(animate);

    cameraControls.update(delta);
    renderer.render(scene, camera);
}

function update(nAccuracy, nBlur, nPoints, nRand, nSensitivity){
    Triangulate.updateVertices(nAccuracy, nPoints, nRand, nSensitivity);
    scene.remove(mesh);
    makeMesh();
    animate();
}


