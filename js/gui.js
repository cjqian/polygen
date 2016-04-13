console.log("HELLO");
var ie;
var ImageEditor = function() {
    this.imageURL='city.jpg';

    //boolean values
    this.showTriangles = true;
    this.showPolygons = false;

    //modes
    this.addMode = true;

    //save function
    this.saveName='city';
    this.saveButton=false;

    //ways to modify
    this.nAccuracy = 50;
    this.nBlur = 10;
    this.nPoints = 10;
    this.nRand = .01;
    this.nSensitivity = .55;
};

window.onload = function() {
    ie = new ImageEditor();
    var gui = new dat.GUI();
    gui.add(ie, 'imageURL').onFinishChange(function(newName){
        console.log(newName);
        //Main.createImage(newName);
    });

    gui.add(ie, 'nAccuracy', 1, 100).step(1).onFinishChange(function(){
        updateValues();
    });

    gui.add(ie, 'nBlur', 1, 100).step(1).onFinishChange(function(){
        updateValues();
    });


    gui.add(ie, 'nPoints', 5, 30).step(1).onFinishChange(function(){
        updateValues();
    });


    gui.add(ie, 'nRand', 0, 1).onFinishChange(function(){
        updateValues();
    });


    gui.add(ie, 'nSensitivity', 0, 1).step(.01).onFinishChange(function(){
        updateValues();
    });

    //show, edit
    /*
    gui.add(ie, 'showTriangles').onChange(function(changeValue){
        Voronoi.toggleShowTriangles(changeValue);
    });
    gui.add(ie, 'showPolygons').onChange(function(changeValue){
        Voronoi.toggleShowPolygons(changeValue);
    });
    gui.add(ie, 'addMode').onChange(function(changeValue){
        Voronoi.toggleAddMode(changeValue);
    });

    //save function
    gui.add(ie, 'saveName');
    gui.add(ie, 'saveButton').onChange(function(){
        Main.saveImage(ie.saveName);
    });
    */
}

updateValues = function(){
        update(ie.nAccuracy, ie.nBlur, ie.nPoints, ie.nSensitivity, ie.nRand);
}

