// this construction helps avoid polluting the global name space
var Main = Main || {};

//make initial things
var image;
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
        image = new Img(imageObj.width, imageObj.height, imageData.data);
        Main.setupImage();
    };
}

Main.setupImage = function() {
    // now triangulate!!
    var vertices = Triangulate.getVertices(image, 300);
    Voronoi.initCanvas();
    Voronoi.updateDots(vertices);
}

