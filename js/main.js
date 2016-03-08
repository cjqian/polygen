// this construction helps avoid polluting the global name space
var Main = Main || {};

//make initial things
Main.image;
Main.canvas = document.getElementById('canvas');
Main.context = Main.canvas.getContext('2d');

Main.createImage = function(imagePath){
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
        Main.setupImage();
    };
}

Main.setupImage = function() {
    // now triangulate!!
    //amount of randomness
    Triangulate.initImage(Main.image);
    //number of vertices
    var vertices = Triangulate.getVertices(600);
    Voronoi.initCanvas(Main.image);
    Voronoi.updateDots(vertices);
}

