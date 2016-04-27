var ThreeScene = ThreeScene || {};

var container;

ThreeScene.cameraControls;

var renderer, mesh;
var group;

var clock = new THREE.Clock();
ThreeScene.scene;
ThreeScene.camera;
ThreeScene.mesh;
ThreeScene.objects;
ThreeScene.selectedObject;

ThreeScene.mouse;
ThreeScene.mouseTime;
ThreeScene.raycaster;
ThreeScene.init = function() {
    canvas = document.getElementById('canvas');

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);

    //container = document.getElementById('container');
    document.body.appendChild(renderer.domElement);

    ThreeScene.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1,  10000 );
    //ThreeScene.camera.up.set(0, -1, 0);
    ThreeScene.camera.position.set(0, 0, -1000);
    //camera.rotation.y = 90 * Math.PI / 180;

    //ThreeScene.cameraControls = new THREE.OrbitControls(ThreeScene.camera);
    ThreeScene.cameraControls = new THREE.TrackballControls(ThreeScene.camera, renderer.domElement);
    //ThreeScene.cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
    ThreeScene.cameraControls.target.set(0, 0, 0);

    ThreeScene.scene = new THREE.Scene();
    ThreeScene.camera.lookAt(ThreeScene.scene.position);
    // lights
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 );
    ThreeScene.scene.add( light );
      light2 = new THREE.DirectionalLight( 0xffffff );
    light2.position.set( -1, 1, -1 );
    ThreeScene.scene.add( light2 );
    light3 = new THREE.DirectionalLight( 0x303030);
    light3.position.set(-1, 1, 1);
    ThreeScene.scene.add (light3);
    //scene.add(light4);


    light = new THREE.DirectionalLight( 0xffffed );
    light.position.set( -500, 100, 0 );
ThreeScene.scene.add(light);

    //light2 = new THREE.DirectionalLight( 0xffffed );
    //light2.position.set( 500, 100, 0 );

    //scene.add( light );
    //scene.add( light2 );

    light = new THREE.AmbientLight( 0x222222 );
    ThreeScene.scene.add( light );

    //material = new THREE.MeshBasicMaterial({
        //wireframe: true,
             //color: 'black'
    //});
    //ThreeScene.addAxis();
    //ThreeScene.addGrid();

    ThreeScene.selectedObject = null;

    //render things
    ThreeScene.mouse = new THREE.Vector2;
    ThreeScene.raycaster = new THREE.Raycaster();

    window.addEventListener( "resize",    ThreeScene.onWindowResize, false );
    canvas.addEventListener( "mouseup",   ThreeScene.onMouseUp,      false );
    canvas.addEventListener( "mousedown", ThreeScene.onMouseDown,    false );


    window.addEventListener( 'resize', onWindowResize, false );
}

ThreeScene.animate = function() {
    var delta = clock.getDelta();
    requestAnimationFrame(ThreeScene.animate);
    ThreeScene.cameraControls.update(delta);
    renderer.render(ThreeScene.scene, ThreeScene.camera);
}

//uses Triangulate.vertices and triangles to make a geometry object
//which is returned
ThreeScene.makeGeometry = function(){
    console.log("Making geometry");
    var geom = new THREE.Geometry();
    var vertices = Triangulate.threeVertices;
    var triangles = Triangulate.triangles;
    console.log(vertices);
    console.log(triangles);
    var heights = Triangulate.vertexHeights;
    console.log(heights);
    var idx = 0;
    //for each vertex
    console.log(triangles.length);
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

    //we have to flip it real quick
    var mS = (new THREE.Matrix4()).identity();
    //set -1 to the corresponding axis
    //mS.elements[0] = -1;
    mS.elements[5] = -1;
    //mS.elements[10] = -1;

    geom.applyMatrix(mS);
    //geom.scale(1, -1, 1);
    //mesh.applyMatrix(mS);
    //object.applyMatrix(mS);
    console.log("DONE");
    return geom;
}

ThreeScene.addAxis = function() {
    var r = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.850, 0.325, 0.098 ), linewidth: 4, opacity: 0.5, transparent: true });
    var g = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.466, 0.674, 0.188 ), linewidth: 4, opacity: 0.5, transparent: true });
    var b = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.000, 0.447, 0.741 ), linewidth: 4, opacity: 0.5, transparent: true });

    var x_axis_geo = new THREE.Geometry();
    var y_axis_geo = new THREE.Geometry();
    var z_axis_geo = new THREE.Geometry();
    x_axis_geo.vertices.push( new THREE.Vector3( -10.5, 0, 0 ) );
    x_axis_geo.vertices.push( new THREE.Vector3(  10.5, 0, 0 ) );

    y_axis_geo.vertices.push( new THREE.Vector3( 0, -10.5, 0 ) );
    y_axis_geo.vertices.push( new THREE.Vector3( 0,  10.5, 0 ) );

    z_axis_geo.vertices.push( new THREE.Vector3( 0, 0, -10.5 ) );
    z_axis_geo.vertices.push( new THREE.Vector3( 0, 0,  10.5 ) );

    var x_axis = new THREE.Line( x_axis_geo, r );
    var y_axis = new THREE.Line( y_axis_geo, b );
    var z_axis = new THREE.Line( z_axis_geo, g );

    ThreeScene.scene.add( x_axis );
    ThreeScene.scene.add( y_axis );
    ThreeScene.scene.add( z_axis );
};
/*

ThreeScene.addGrid = function() {
    var w = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.95, 0.95, 0.95 ), linewidth: 5, opacity: 0.3, transparent: true });

    //we want a grid along the z axis
    var grid_geo = new THREE.Geometry();
    for ( var i = -10; i <= 10 ; ++i ) {
        if ( i === 0 ) continue;
        grid_geo.vertices.push( new THREE.Vector3( i, -10, 0 ) );
        grid_geo.vertices.push( new THREE.Vector3( i,  10, 0 ) );
        grid_geo.vertices.push( new THREE.Vector3( -10,  i, 0 ) );
        grid_geo.vertices.push( new THREE.Vector3( 10,  i, 0 ) );
    }
    var grid = new THREE.Line( grid_geo, w, THREE.LinePieces );
    ThreeScene.scene.add( grid );


    //this._grid = grid;
};
*/
ThreeScene.makeMesh = function(){
    var geom = ThreeScene.makeGeometry();
    var material = new THREE.MeshPhongMaterial( {
        vertexColors: THREE.FaceColors,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1
    } );

    ThreeScene.mesh = new THREE.Mesh(geom, material);
    ThreeScene.objects = [ThreeScene.mesh];

    ThreeScene.mesh.castShadow = true;
    ThreeScene.scene.add(ThreeScene.mesh);

//\    ThreeScene.mesh.position.set(-1000, -800, 0);
}

//TODO: fix resizing
function onWindowResize() {
    ThreeScene.camera.aspect = window.innerWidth / window.innerHeight;
    ThreeScene.camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

ThreeScene.update =function(paramObject){
    console.log("calling update");
    Triangulate.updateVertices(paramObject);
    console.log("updated");
    ThreeScene.scene.remove(ThreeScene.mesh);
    ThreeScene.makeMesh();
    ThreeScene.animate();
    console.log("finished update");
}


