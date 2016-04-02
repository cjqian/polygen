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
    this.nPoints = 10;
    this.nRand = .01;
    this.nSensitivity = .55;
};

window.onload = function() {
    var ie = new ImageEditor();
    var gui = new dat.GUI();
    gui.add(ie, 'imageURL').onFinishChange(function(newName){
        console.log(newName);
        Main.createImage(newName);
    });

    gui.add(ie, 'nAccuracy', 1, 100).step(1).onFinishChange(function(nAccuracy){
        Voronoi.clearDots();

        Main.updateImage(nAccuracy, ie.nSensitivity, ie.nRand);
    });


    gui.add(ie, 'nPoints', 5, 30).step(1).onFinishChange(function(nPoints){
        Voronoi.clearDots();

        Main.updateImage(ie.nAccuracy, nPoints, ie.nRand, ie.nSensitivity);
    });


    gui.add(ie, 'nRand', 0, 1).onFinishChange(function(nRand){
        Voronoi.clearDots();

        Main.updateImage(ie.nAccuracy, ie.nSensitivity, nRand); 
    });


    gui.add(ie, 'nSensitivity', 0, 1).step(.01).onFinishChange(function(nSensitivity){
        console.log("changed to " + ie.nSensitivity);
        Voronoi.clearDots();

        Main.updateImage(ie.nAccuracy, nSensitivity, ie.nRand);
    });

    //show, edit
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
};
