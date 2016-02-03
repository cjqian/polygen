function renderCanvas(img){
console.log("rendering canvas");
console.log(document.getElementById("canvas-container").style.width);
    document.getElementById("canvas-container").style.width = img.width + "px";
    document.getElementById("canvas-container").style.height = img.height + "px";

console.log(document.getElementById("canvas-container").style.width);
console.log("set width and height");
}

function triangulateImage(img){
    console.log(img);
console.log(img.width);
    console.log("HELLO");
}
