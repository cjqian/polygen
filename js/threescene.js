var ThreeScene = ThreeScene || {};

var container;

var camera, cameraControls, scene, renderer, mesh;
var group;

var clock = new THREE.Clock();

ThreeScene.mesh;

ThreeScene.init = function() {
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1,  10000 );
    camera.up.set(0, -1, 0);
    camera.position.set(0, 0, 1000);
    //camera.rotation.y = 90 * Math.PI / 180;

    cameraControls = new THREE.TrackballControls(camera);
    //cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
    cameraControls.target.set(0, 0, 0);

    scene = new THREE.Scene();
    camera.lookAt(scene.position);
    // lights
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    //light = new THREE.DirectionalLight( 0x002288 );
    //light.position.set( -1, -1, -1 );
    //scene.add( light );

    light = new THREE.AmbientLight( 0x222222 );
    scene.add( light );

    //material = new THREE.MeshBasicMaterial({
        //wireframe: true,
             //color: 'black'
    //});

    window.addEventListener( 'resize', onWindowResize, false );
}

ThreeScene.animate = function() {
    var delta = clock.getDelta();
    requestAnimationFrame(ThreeScene.animate);
    cameraControls.update(delta);
    renderer.render(scene, camera);
}

//uses Triangulate.vertices and triangles to make a geometry object
//which is returned
ThreeScene.makeGeometry = function(){
    var geom = new THREE.Geometry();
    var vertices = Triangulate.threeVertices;
    console.log(vertices.length);
    var triangles = Triangulate.triangles;

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
        var color = Triangulate.faceColors[i];
        geom.faces[i].color.setHex(color);
    }

    return geom;
}


ThreeScene.makeMesh = function(){
    var geom = ThreeScene.makeGeometry();
    var material = new THREE.MeshPhongMaterial( {
        vertexColors: THREE.FaceColors,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1
    } );

    ThreeScene.mesh = new THREE.Mesh(geom, material);
    scene.add(ThreeScene.mesh);
    ThreeScene.mesh.position.set(-1000, -800, 0);
}

//TODO: fix resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

ThreeScene.update =function(paramObject){
    Triangulate.updateVertices(paramObject);
    scene.remove(ThreeScene.mesh);
    ThreeScene.makeMesh();
    ThreeScene.animate();
}


