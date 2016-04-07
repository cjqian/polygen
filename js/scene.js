if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;

var camera, cameraControls, scene, renderer, mesh;
var group;

var clock = new THREE.Clock();


function init() {
    
        // renderer

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        renderer.setSize(window.innerWidth, window.innerHeight);

        container = document.getElementById('container');
        container.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, -50, 1000 );
        camera.position.z = 1;

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
    var vertices = Triangulate.vertices;
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
    var color = Triangulate.image.getPixel(vertex.y, vertex.x);
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

var mesh = new THREE.Mesh(geom, material);

scene.add(mesh);
// wireframe
var helper = new THREE.EdgesHelper( mesh, 0xffffff ); // or THREE.WireframeHelper
scene.add( helper );
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
