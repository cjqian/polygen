var Url = Url || {};

Url.validParams = ["imagePath", "accuracy", "blur", "points", "rate", "sensitivity", "meshType", "mountainHeight"];

Url.object;

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

    console.log(urlObject);
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
     * rand: 200
     *
     */

    //defaults
if (typeof urlObject.mountainHeight == "undefined"){
    urlObject.mountainHeight = 50;
    }
    if (typeof urlObject.imagePath == "undefined"){
        urlObject.imagePath = "city.jpg";
    }

    if (typeof urlObject.accuracy == "undefined"){
        urlObject.accuracy = .55;
    }

    if (typeof urlObject.blur == "undefined"){
        urlObject.blur = 25;
    }
    
    if (typeof urlObject.points == "undefined"){
        urlObject.points = 2000;
    }

    if (typeof urlObject.meshType == "undefined"){
        urlObject.meshType = "plane";
    }

    if (typeof urlObject.rate == "undefined"){
        urlObject.rate = .0505;
    }

    if (typeof urlObject.sensitivity == "undefined"){
        urlObject.sensitivity = 50;
    }
    Url.object = urlObject;

    Triangulate.initImage(urlObject);
}



