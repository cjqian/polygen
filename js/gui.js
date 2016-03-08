var ImageEditor = function() {
    this.imageURL='city.jpg';
    this.nVertices = 600;
    this.nRand = .01;

    //boolean values
    this.showTriangles = true;
    this.showPolygons = false;

    //modes
    this.addMode = true;
};

window.onload = function() {
    var ie = new ImageEditor();
    var gui = new dat.GUI();
    gui.add(ie, 'imageURL').onFinishChange(function(newName){
        console.log(newName);
        Main.createImage(newName);
    });

    gui.add(ie, 'nVertices', 10, 5000).step(1).onFinishChange(function(newVert){
        Voronoi.clearDots();

        Main.updateImage(newVert, ie.nRand);
    });

    gui.add(ie, 'nRand', 0, 1).onFinishChange(function(newRand){
        Voronoi.clearDots();

        Main.updateImage(ie.nVertices, newRand); 
    });

    gui.add(ie, 'showTriangles').onChange(function(changeValue){
        Voronoi.toggleShowTriangles(changeValue);
    });
    gui.add(ie, 'showPolygons').onChange(function(changeValue){
        Voronoi.toggleShowPolygons(changeValue);
    });
    gui.add(ie, 'addMode').onChange(function(changeValue){
        Voronoi.toggleAddMode(changeValue);
    });
};
