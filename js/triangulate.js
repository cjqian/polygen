var Triangulate = Triangulate || {};

var energyList = [];
var nodeList = []; //nodeList is all the nodes in list form of object nodes
var linkList = [];
var triangleList = [];

//calculates the energy of a pixel
//at any point
Triangulate.calculatePixelEnergy = function ( image, i, j ){
    var leftCoor, rightCoor, upCoor, downCoor;

    //wrap border pixels
    if (i == 0){
        upCoor = image.height - 1;
        downCoor = i + 1;
    } else if (i == image.height - 1){
        upCoor = i - 1;
        downCoor = 0;
    } else {
        upCoor = i - 1;
        downCoor = i + 1;
    }

    if (j == 0){
        leftCoor = image.width - 1;
        rightCoor = j + 1;
    } else if (j == image.width - 1){
        leftCoor = j - 1;
        rightCoor = 0;
    } else {
        leftCoor = j - 1;
        rightCoor = j + 1;
    }

    //check horizontal
    var leftPix = image.getPixel(i, leftCoor);
    var rightPix = image.getPixel(i, rightCoor);

    var redDiff = Math.abs(leftPix.r - rightPix.r);
    var greenDiff = Math.abs(leftPix.g - rightPix.r);
    var blueDiff = Math.abs(leftPix.b - rightPix.b);

    var xSquared = (redDiff * redDiff) + (greenDiff * greenDiff) + (blueDiff * blueDiff);

    //check vertical
    var upPix = image.getPixel(upCoor, j);
    var downPix = image.getPixel(downCoor, j);

    redDiff = Math.abs(upPix.r - downPix.r);
    greenDiff = Math.abs(upPix.g - downPix.g);
    blueDiff = Math.abs(upPix.b - downPix.b);

    var ySquared = (redDiff * redDiff) + (greenDiff * greenDiff) + (blueDiff * blueDiff);

    //get energy
    var energy = Math.sqrt(xSquared + ySquared);
    return energy;
}

Triangulate.makeEnergyList = function( image ){
    //calculate threshold for each pixel
    //for (var i = 0; i < image.height; i++){
    //for (var j = 0; j < image.width; j++){
    for (var i = 0; i < image.width; i++){
        for (var j = 0; j < image.height; j++){
            var pixel = image.getPixel(i, j);
            //calculate the energy of the pixel
            var energy =  Triangulate.calculatePixelEnergy(image, i, j);
            var energyObj = {"energy": energy, "x": j, "y": i};

            energyList.push(energyObj);
        }
    }

    //now, we sort the energyList
    function compare(a, b){
        if (a.energy < b.energy) return -1;
        else if (a.energy > b.energy) return 1;
        else return 0;
    }

    energyList.sort(compare);
}

//gets the coordinate object given a node
Triangulate.getCoordFromNode = function(node){
    var coord = [];

    coord.push(node.x);
    coord.push(node.y);

    //TODO: fix reverse coordinate system :( (why did this happen rip)
    return coord;
}

//get all nodeArray representations from nodeList
Triangulate.getCoords = function(){    
    var coordList = [];

    for (var i = 0; i < nodeList.length; i++){
        coordList.push(Triangulate.getCoordFromNode(nodeList[i]));    
    }

    return coordList;
}

//returns an array of the most significant points
Triangulate.addVertices = function ( image, threshold ){
    //Triangulate.makeEnergyList( image );
    //temp
    for (var i = 100; i < image.width- 100; i++){
        for (var j = 100; j < image.height - 100; j++){
            if (i % 100 == 0 && j % 100 == 0){
                //add some variance to keep it interesting
                var x = Math.ceil((Math.random() - .5) * 80) + j;
                var y = Math.ceil((Math.random() - .5) * 80) + i; 
                var obj = {"x": x, "y": y};
                energyList.push(obj);
            }
        }
    }


    var maxThreshold = Math.min(threshold, energyList.length);
    for (var i = 0; i < maxThreshold - 1; i++){
        var hexval = image.getPixel(energyList[i].x, energyList[i].y).toHex();
        //console.log(hexval);
        var node = {"id": "n" + i, "x": energyList[i].y, "y": energyList[i].x, "color": hexval};

        nodeList.push(node);
    }
}

Triangulate.getIndexFromCoordinate = function ( x, y ){
    for (var i = 0; i < nodeList.length; i++){
        if (x == nodeList[i].x && y == nodeList[i].y) return i;
    }

    return -1;
}

Triangulate.getIndexesFromEdge = function( curEdge ) {
    var indexes = [];

    //get source
    var sourceX = curEdge.source[0];
    var sourceY = curEdge.source[1];
    var sourceIdx = Triangulate.getIndexFromCoordinate(sourceX, sourceY);

    //get dest
    var destX = curEdge.target[0];
    var destY = curEdge.target[1];
    var destIdx = Triangulate.getIndexFromCoordinate(destX, destY);

    indexes.push(sourceIdx);
    indexes.push(destIdx);

    return indexes;
}

Triangulate.addEdges = function ( image ){
    var nodeCoords = Triangulate.getCoords();
    var edgeCoords = d3.geom.voronoi().links(nodeCoords);

    //go through each edge
    for (var i = 0; i < edgeCoords.length; i++){
        var curEdge = edgeCoords[i];
        var indexes = Triangulate.getIndexesFromEdge( curEdge );

        //make an object
        var link = {"source": indexes[0], "target": indexes[1]};
        linkList.push(link);
    }
}

Triangulate.addTriangles = function ( image ) {
    var nodeCoords = Triangulate.getCoords();
    var triangleCoords = d3.geom.voronoi().triangles(nodeCoords);

    for (var i = 0; i < triangleCoords.length; i++){
        var curTriangle = triangleCoords[i];
        var pointA = curTriangle[0];
        var pointB = curTriangle[1];
        var pointC = curTriangle[2];

        var startPoint = { "x": pointA[0], "y": pointA[1] };
        var relPointA = { "x": pointB[0] - pointA[0], "y": pointB[1] - pointA[1] };
        var relPointB = { "x": pointC[0] - pointB[0], "y": pointC[1] - pointB[1] };

        var hexVal = image.getPixel(startPoint.y, startPoint.x).toHex();
        var triangle = {"start": startPoint, "relA": relPointA, "relB": relPointB, "color": hexVal };
        triangleList.push(triangle);
    }

    console.log(triangleList);
}

