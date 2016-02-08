//upload image and perform triangulation
window.onload = function() {

    var fileInput = document.getElementById('import-images');
    var fileDisplayArea = document.getElementById('fileDisplayArea');


    fileInput.addEventListener('change', function(e) {
        var file = fileInput.files[0];
        var imageType = /image.*/;

        if (file.type.match(imageType)) {
            var reader = new FileReader();

            reader.onload = function(e) {
                var img = new Image();
                img.src = reader.result;

                //send the image to the triangulation station
                renderCanvas(img);
            }

            reader.readAsDataURL(file); 
        } else {
            fileDisplayArea.innerHTML = "File not supported!"
        }
    });

}

