var ThreeD = ThreeD || {};
ThreeD.polygonArray;
ThreeD.mesh;
var three = THREE;

var scene = new three.Scene();
var camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

var geometry = new three.BoxGeometry(1, 1, 1);

/* My functions */
//makes an array of 3D vectors
ThreeD.geometry;

ThreeD.getZ = function( point ){
    return Math.floor(Math.random() * 1000);
}
ThreeD.setGeometry = function(){

var geom = new THREE.Geometry(); 
var v1 = new THREE.Vector3(0,0,0);
var v2 = new THREE.Vector3(0,500,0);
var v3 = new THREE.Vector3(0,500,500);

    //for each triangle
    for (var i = 0; i < ThreeD.polygonArray.length; i++){
        var curTriangle = ThreeD.polygonArray[i];

        //for each point
        for (var j = 0; j < 3; j++){
           var curPoint = curTriangle.points[j];

           var curVector = new THREE.Vector3(curPoint.x, curPoint.y, ThreeD.getZ(curPoint));
           geom.vertices.push(curVector);    
        }

        geom.faces.push(new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2));
    }
/* 
geom.vertices.push(v1);
geom.vertices.push(v2);
geom.vertices.push(v3);
*/
/*
geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
*/
geom.computeFaceNormals();

var object = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );

object.position.z = -100;//move a bit back - size of 500 is a bit big

object.rotation.y = -Math.PI * .5;//triangle is pointing in depth, rotate it -90 degrees on Y

scene.add(object);
/*
    scene.remove(ThreeD.geometry);
    ThreeD.geometry = new THREE.Geometry();

    //for each triangle
    for (var i = 0; i < 10; i++){
    //for (var i = 0; i < ThreeD.polygonArray.length; i++){
        var curTriangle = ThreeD.polygonArray[i];

        //for each point
        for (var j = 0; j < 2; j++){
           var curPoint = curTriangle.points[j];

           var curVector = new THREE.Vector3(curPoint.x, curPoint.y, ThreeD.getZ(curPoint));
           ThreeD.geometry.dynamic = true;
           ThreeD.geometry.vertices.push(curVector);    
    ThreeD.geometry.verticesNeedUpdate = true;
        }

           ThreeD.geometry.dynamic = true;
        ThreeD.geometry.faces.push(new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2));

    ThreeD.geometry.verticesNeedUpdate = true;
        ThreeD.geometry.computeFaceNormals();
    }
  
    console.log(ThreeD.geometry);
    ThreeD.mesh = new THREE.Mesh(ThreeD.geometry, new THREE.MeshNormalMaterial() );
    console.log(ThreeD.mesh);
    ThreeD.mesh.position.z = -1000;
    scene.add(ThreeD.mesh);
*/
}



//var material = new three.MeshNormalMaterial();
/* * /
   var material = new three.MeshBasicMaterial({
   color: 0x00ff00
   });
/* */
/* */
three.ImageUtils.crossOrigin = '';

var material = new three.MeshFaceMaterial([
        new three.MeshBasicMaterial({
            color: 0x00ff00
        }),
        new three.MeshBasicMaterial({
            color: 0xff0000
        }),
        new three.MeshBasicMaterial({
            color: 0x0000ff,
        }),
        new three.MeshBasicMaterial({
            color: 0xffff00
        }),
        new three.MeshBasicMaterial({
            color: 0x00ffff
        }),
        new three.MeshBasicMaterial({
            color: 0xff00ff
        })
        ]);
/* */

var cube = new three.Mesh(geometry, material);
cube.rotation.x = Math.PI/4;
cube.rotation.y = Math.PI/4;
scene.add(cube);


camera.position.z = 1000;

/* */
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};
$(renderer.domElement).on('mousedown', function(e) {
    isDragging = true;
})
.on('mousemove', function(e) {
    //console.log(e);
    var deltaMove = {
        x: e.offsetX-previousMousePosition.x,
    y: e.offsetY-previousMousePosition.y
    };

    if(isDragging) {

        var deltaRotationQuaternion = new three.Quaternion()
    .setFromEuler(new three.Euler(
            toRadians(deltaMove.y * 1),
            toRadians(deltaMove.x * 1),
            0,
            'XYZ'
            ));

cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);
    }

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});
/* */

$(document).on('mouseup', function(e) {
    isDragging = false;
});



// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

var lastFrameTime = new Date().getTime() / 1000;
var totalGameTime = 0;
function update(dt, t) {
    //console.log(dt, t);

    //camera.position.z += 1 * dt;
    //cube.rotation.x += 1 * dt;
    //cube.rotation.y += 1 * dt;

    setTimeout(function() {
        var currTime = new Date().getTime() / 1000;
        var dt = currTime - (lastFrameTime || currTime);
        totalGameTime += dt;

        update(dt, totalGameTime);

        lastFrameTime = currTime;
    }, 0);
}


function render() {
    renderer.render(scene, camera);
    requestAnimFrame(render);
}

ThreeD.update = function(){
    ThreeD.setGeometry();
    render();
    update(0, totalGameTime);
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function toDegrees(angle) {
    return angle * (180 / Math.PI);
}


