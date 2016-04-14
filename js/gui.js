var Gui = Gui || {};

Gui.meshList = [
    "plane", 
    "mountain",
    "cylinder",
    "mountain_cylinder",
    "sphere"
]

var ie;
var ImageEditor = function() {

    this.imagePath='city.jpg';
    this.meshType="plane";

    //ways to modify
    this.accuracy = Url.object.accuracy || 50;
    this.blur = 10;
    this.points = 10;
    this.rand = .01;
    this.sensitivity = .55;

    this.mountainHeight = 50;
};

window.onload = function() {
    ie = new ImageEditor();
    var gui = new dat.GUI();
    
    gui.add(ie, 'imagePath').onFinishChange(function(newName){
        Triangulate.initImage(ie);
    });

    gui.add( ie, 'meshType', Gui.meshList).name("Current Mesh").onChange(function(){
        ThreeScene.update(ie);
    });

    gui.add( ie, 'mountainHeight', 0, 100).step(10).onFinishChange(function(){
       ThreeScene.update(ie);
    });

    //folder for triangulate editor
    var f1 = gui.addFolder('Triangulation Editor');

    f1.add(ie, 'accuracy', 1, 100).step(1).onFinishChange(function(){
        ThreeScene.update(ie);
    });

    f1.add(ie, 'blur', 1, 100).step(1).onFinishChange(function(){
        ThreeScene.update(ie);
    });


    f1.add(ie, 'points', 5, 30).step(1).onFinishChange(function(){
        ThreeScene.update(ie);
    });


    f1.add(ie, 'rand', 0, 1).onFinishChange(function(){
        ThreeScene.update(ie);
    });


    f1.add(ie, 'sensitivity', 0, 1).step(.01).onFinishChange(function(){
        ThreeScene.update(ie);
    });

    f1.open();
}

