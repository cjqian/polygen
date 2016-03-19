// this construction helps avoid polluting the global name space
var Main = Main || {};

//make initial things
Main.image;
Main.canvas = document.getElementById('canvas');
Main.context = Main.canvas.getContext('2d');

Main.createImage = function(imagePath, nVertices, nRand){
    //now, we call the equivalent of ("image change callback")
    var imageObj = document.createElement('img');
    imageObj.setAttribute("id", "image");
    imageObj.src = './img/' + imagePath;

    //TODO reload bug??
    imageObj.onload = function(){
        //on load, we reset the image object
        Main.context.clearRect(0, 0, Main.canvas.width, Main.canvas.height);
        console.log(imageObj.width);
        Main.canvas.width = imageObj.width;
        console.log(Main.canvas.width);
        Main.canvas.height = imageObj.height;

        Main.context.drawImage(imageObj, 0, 0);
        //we get the data and make an actual image
        var imageData = Main.context.getImageData(0, 0, imageObj.width, imageObj.height);
        Main.image = new Img(imageObj.width, imageObj.height, imageData.data);
        Main.setupImage(nVertices, nRand);
    };
}

Main.setupImage = function(nVertices, nRand) {
    Voronoi.clearCanvas();

    //amount of randomness
    Triangulate.initImage(Main.image);
    Voronoi.initCanvas(Main.image);

    //if (typeof(ie.nVertices) != "undefined" && typeof(ie.nRand) !=  "undefined")
    if (typeof ie != 'undefined')
        Main.updateImage(ie.nVertices, ie.nRand);
    else
        Main.updateImage(nVertices, nRand);
}

Main.updateImage = function(nVertices, nRand){
    console.log("Updating image with " + nVertices + " and rand " + nRand);
    var vertices = Triangulate.getVertices(nVertices, nRand);
    Voronoi.updateDots(vertices);
}
