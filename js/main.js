// this construction helps avoid polluting the global name space
var Main = Main || {};

//make initial things
Main.image;
Main.canvas = document.getElementById('canvas');
Main.context = Main.canvas.getContext('2d');

Main.createImage = function(imagePath, nAccuracy, nSensitivity, nRand){
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
        Main.setupImage(nAccuracy, nSensitivity, nRand);
    };
}

Main.setupImage = function(nAccuracy, nSensitivity, nRand) {
    Voronoi.clearCanvas();

    //amount of randomness
    Triangulate.initImage(Main.image);
    Voronoi.initCanvas(Main.image);
    //if (typeof(ie.nVertices) != "undefined" && typeof(ie.nRand) !=  "undefined")
    //if (typeof ie != 'undefined')
        //Main.updateImage(ie.nVertices, ie.nRand);
        Main.updateImage(nAccuracy, nSensitivity, nRand);
}

Main.updateImage = function(nAccuracy, nPoints, nRand, nSensitivity){
    ThreeD.pointArray = Triangulate.getVertices(nAccuracy, nPoints,nRand,  nSensitivity);
    Voronoi.updateDots(ThreeD.pointArray);

    ThreeD.update();
}

Main.saveImage = function(saveName){
    console.log("saving image " + saveName);
    //store object
    var obj = {};
    obj.voronoi = Voronoi.makeObject();
    obj.triangulate = Triangulate.makeObject();
    var objStr = JSON.stringify(obj);

    //save file
    var filePath = "/tri/" + saveName + ".tri";
    var file = new File([objStr], filePath, {type: "text/plain"});
}

