// this construction helps avoid polluting the global name space
var Main = Main || {};

var image;

// called when image is finished loading
Main.onImageLoad = function(imageElm) {
    Main.ctx.clearRect(0, 0, Main.canvas.width, Main.canvas.height);
    Main.canvas.width = imageElm.width;
    Main.canvas.height = imageElm.height;
    
    Main.ctx.drawImage(imageElm, 0, 0);

    var imageData = Main.ctx.getImageData(0, 0, imageElm.width, imageElm.height);
    Main.img = new Img(imageElm.width, imageElm.height, imageData.data);

    Triangulate.addVertices(Main.img, 1000);
    Triangulate.addEdges(Main.img);
    Triangulate.addTriangles(Main.img);
    MakeSvg.render();
};

// gui file selection changed; load new image
Main.imageChangeCallback = function(newImage) {
    image = document.createElement("img");
    image.setAttribute("id", "image");

    image.onload = function() {
        Main.onImageLoad(image);
    };

    image.src = 'img/' + newImage;           
};

// called when the gui params change and we need to update the image
Main.controlsChangeCallback = function() {
    var outputImg = Main.img.copyImg();
    
    outputImg = Filters.update(outputImg, Gui.values);
    
    Main.ctx.clearRect(0, 0, Main.canvas.width, Main.canvas.height);
    Main.canvas.width  = outputImg.width;
    Main.canvas.height = outputImg.height;
    
    Main.ctx.putImageData( outputImg.toImgData(), 0, 0);
};

// when HTML is finished loading, do this
window.onload = function() {
    Main.canvas = document.getElementById('canvas');
    Main.ctx    = canvas.getContext('2d');
    
    // load the first image in the file selector
    Main.imageChangeCallback('city.jpg');

    // now triangulate!!
};
