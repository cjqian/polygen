var Gui = Gui || {};

Gui.meshList = [
    "plane", 
    "mountain",
    "cylinder",
    "mountain_cylinder",
    "sphere"
]

Gui.mountainType = [
    "random",
    "emboss",
    "engrave"
]


var ie;
var ImageEditor = function() {

    this.imagePath='city.jpg';
    this.meshType="plane";

    //ways to modify
    this.accuracy = Url.object.accuracy || .5;
    this.blur = 25;
    this.points = 2000;
    this.sensitivity = 50;
    this.rate = .05;

    this.mountainHeight = 50;
    this.mountainType = "emboss";
};

window.onload = function() {
    ie = new ImageEditor();
    var gui = new dat.GUI();
    
    gui.add(ie, 'imagePath').onFinishChange(function(newName){
        Triangulate.initImage(ie);
    });

    gui.add( ie, 'meshType', Gui.meshList).name("current mesh").onChange(function(){
        ThreeScene.update(ie);
    });

    gui.add( ie, 'mountainType', Gui.mountainType).name("mountain type").onChange(function(){
        ThreeScene.update(ie);
    });


    gui.add( ie, 'mountainHeight', 0, 100).name("mountain height").step(10).onFinishChange(function(){
       ThreeScene.update(ie);
    });

    //folder for triangulate editor
    var f1 = gui.addFolder('Triangulation Editor');

    f1.add(ie, 'accuracy', .1, 1).name("sample freq").step(.01).onFinishChange(function(){
        ThreeScene.update(ie);
    });

    f1.add(ie, 'blur', 0, 50).step(1).onFinishChange(function(){
        ThreeScene.update(ie);
    });

 f1.add(ie, 'rate', .001, .1).step(.01).onFinishChange(function(){
        ThreeScene.update(ie);
    });


    f1.add(ie, 'points', 100, 5000).step(100).onFinishChange(function(){
        ThreeScene.update(ie);
    });


    f1.add(ie, 'sensitivity', 0, 100).name("edge threshold").step(10).onFinishChange(function(){
        ThreeScene.update(ie);
    });

    f1.open();
}

