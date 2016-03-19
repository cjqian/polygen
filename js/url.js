var Url = Url || {};

Url.validParams = ["imagePath", "nVertices", "nRand"];

Url.getObject = function(path){
    urlObject = {};
    if (path.length == 0) return urlObject;

    //we remove the initial question mark
    path = path.substring(1, path.lastIndexOf("/"));   
    if (path.length == 0) return urlObject;
    console.log(path);

    //now we split parameters by and
    pathArray = path.split("&");

    for (var i = 0; i < pathArray.length; i++){
        var curParam = pathArray[i].split("=");
        if (curParam.length == 0) return urlObject;

        if (Url.validParams.indexOf(curParam[0]) != -1){
            urlObject[curParam[0]] = curParam[1];
        }
    }

    return urlObject;
}

Url.handleUrl = function(path){
    console.log("handle url called");
    //first, get a url object
    var urlObject = Url.getObject(path);
    console.log(urlObject);
    /* 
     * imagePath: "city.jpg"
     * nVertices: 600
     * nRand: 200
     *
     */

     //defaults
     if (typeof urlObject.imagePath == "undefined"){
        urlObject.imagePath = "city.jpg";
     }

     if (typeof urlObject.nVertices == "undefined"){
        urlObject.nVertices = 600;
     }

     if (typeof urlObject.nRand == "undefined"){
        urlObject.nRand = .01;
     }

    Main.createImage(urlObject.imagePath, urlObject.nVertices, urlObject.nRand);
}



