var Triangulate = Triangulate || {};

var energyList = [];
var nodeList = []; //nodeList is all the nodes in list form of object nodes
var linkList = [];
var triangleList = [];

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

//returns a uniform distribution of points points
Triangulate.getUniformPoints = function (image, blockHeight, blockWidth, points){
    var nodeArray = [];

    for (var i = blockHeight/2; i < image.height; i+= blockHeight){
        for (var j = blockWidth/2; j < image.width; j+= blockWidth){
            var curNode = [];

            curNode.push(j);
            curNode.push(i);

            nodeArray.push(curNode);
        }
    }

    return nodeArray;
}

//returns "significance" of point in relation to neighbors
Triangulate.getEnergy = function(image, i, j){
    return (Math.random() * 20);
}

Triangulate.getPointsInBlock = function(image, n, yBlockStart, xBlockStart, blockHeight, blockWidth){
    energyList = [];

    for (var i = yBlockStart; i < yBlockStart + blockHeight; i++){
        for (var j = xBlockStart; j < xBlockStart + blockWidth; j++){                   
            var energy = Triangulate.getEnergy(image, i, j); 
            energyList.push({energy: energy, x: j, y: i});
        }
    }

    function compare(a, b){
        if (a.energy < b.energy) return -1;
        else if (a.energy > b.energy) return 1;
        else return 0;
    }

    energyList.sort(compare);

    //now, we make the actual array 
    blockArray = [];
    for (var i = 0; i < n; i++){
        curNode = [];
        curNode.push(energyList[i].x);
        curNode.push(energyList[i].y);

        blockArray.push(curNode);
    }

    return blockArray;
}


Triangulate.getDecimalFromPixel = function(image, i, j){
    var curPixelColor = image.getPixel(i, j).toHex();
    var curPixelHex = curPixelColor.toString().substring(1, curPixelColor.length);
    var curPixelDec = parseInt(curPixelHex, 16);

    return curPixelDec;
}


//returns the standard deviation of hex values of a "block"
Triangulate.getStdDev = function(image, yBlockStart, xBlockStart, blockHeight, blockWidth){
    var sumPixelVal = 0;

    //iterate through each pixel of the block and get the average
    for (var i = yBlockStart; i < yBlockStart + blockHeight; i++){
        for (var j = xBlockStart; j < xBlockStart + blockWidth; j++){
            curPixelDec = Triangulate.getDecimalFromPixel(image, i, j);
            sumPixelVal += curPixelDec;
        }
    }
    var avgPixelVal = sumPixelVal / (blockHeight * blockWidth);

    //now we get the stddev of the block
    var sumDiffSq = 0;
    for (var i = yBlockStart; i < yBlockStart + blockHeight; i++){
        for (var j = xBlockStart; j < xBlockStart + blockWidth; j++){
            var curDiff = Triangulate.getDecimalFromPixel(image, i, j) - avgPixelVal;
            var curDiffSq = curDiff * curDiff;

            sumDiffSq += curDiffSq;
        }
    }

    var stdDevSq = sumDiffSq / (blockHeight * blockWidth);
    var stdDev = Math.sqrt(stdDevSq);

    return stdDev;
}

//returns an array of the most significant points
Triangulate.getVertices = function ( image, threshold ){
    var points = threshold/10;
    var pointsSqrt = Math.ceil(Math.sqrt(points));

    var blockWidth = Math.ceil(image.width / pointsSqrt);
    var blockHeight = Math.ceil(image.height / pointsSqrt);

    //start with a uniform mesh with 10% of our points
    var nodeArray = Triangulate.getUniformPoints(image, blockHeight, blockWidth, threshold/10);

    //get the standard deviations of each block
    var sumStdDev = 0;
    var stdDevs = [];
    for (var i = 0; i < image.height; i += blockHeight){
        for (var j = 0; j < image.width; j += blockWidth){
            var curStdDev = Triangulate.getStdDev(image, i, j, blockHeight, blockWidth);
            stdDevs.push(curStdDev);
            sumStdDev += curStdDev;
        }
    }

    var remainingPoints = threshold - points;
    var stdDevIdx = 0;

    //allocate tickets for each block
    for (var i = 0; i < image.height; i+= blockHeight){
        for (var j = 0; j < image.width; j += blockWidth){
            var curTickets = Math.floor((stdDevs[stdDevIdx++]/sumStdDev) * remainingPoints);
            var curNodes = Triangulate.getPointsInBlock(image, curTickets, i, j, blockHeight, blockWidth);

            nodeArray.push.apply(nodeArray, curNodes);
        }
    }

    console.log(nodeArray);
    return nodeArray;
}

/*
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

var adjNodes = "l" + indexes[0] + " l" + indexes[1];
var link = {"source": indexes[0], "target": indexes[1], "class": adjNodes};
linkList.push(link);
}
}

Triangulate.updateTriangleSvgString = function( curTriangle ){
//ok this is a little hairy stick with me here
var classStr = curTriangle.className.baseVal;
var tIndexes = classStr.split(" ");

//get the three nodes from the nodeList
var pointA = nodeList[tIndexes[0].substring(1, tIndexes[0].length)];
var pointB = nodeList[tIndexes[1].substring(1, tIndexes[1].length)];
var pointC = nodeList[tIndexes[2].substring(1, tIndexes[2].length)];

var startPoint = { "x": pointA.x, "y": pointA.y };
var relPointA = { "x": pointB.x - pointA.x, "y": pointB.y - pointA.y };
var relPointB = { "x": pointC.x - pointB.x, "y": pointC.y - pointB.y };
var hexVal = curTriangle.getAttribute("fill");
var triangle = {"start": startPoint, "relA": relPointA, "relB": relPointB, "color": hexVal, "class": classStr };

return Triangulate.getSvgStringFromTriangle(triangle);
}

Triangulate.getSvgStringFromTriangle = function(triangle){
var x = triangle.start.x;
var y = triangle.start.y;

var ax = triangle.relA.x;
var ay = triangle.relA.y;

var bx = triangle.relB.x;
var by = triangle.relB.y;

var a = 'M ' + x + ' ' + y;
var b = ' l ' + ax + ' ' + ay;
var c = ' l ' + bx + ' ' + by;
var z = ' z';
var string = a + b + c + z;

return string;
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

        var aID = Triangulate.getIndexFromCoordinate(pointA[0], pointA[1]);
        var bID = Triangulate.getIndexFromCoordinate(pointB[0], pointB[1]);
        var cID = Triangulate.getIndexFromCoordinate(pointC[0], pointC[1]);

        var classStr = "t" + aID + " t" + bID + " t" + cID;
        var triangle = {"start": startPoint, "relA": relPointA, "relB": relPointB, "color": hexVal, "class": classStr };
        triangleList.push(triangle);
    }
}
*/

Triangulate.getAverageColor = function(image, triangle){
    var xMin = Math.min(triangle[0][0], triangle[1][0], triangle[2][0]);
    var xMax = Math.max(triangle[0][0], triangle[1][0], triangle[2][0]);

    var yMin = Math.min(triangle[0][1], triangle[1][1], triangle[2][1]);
    var yMax = Math.max(triangle[0][1], triangle[1][1], triangle[2][1]);

    var sumColor = 0;

    for (var i = yMin; i < yMax; i++){
        for (var j = xMin; j < xMax; j++){
            sumColor += Triangulate.getDecimalFromPixel(image, i, j);
        }
    }

    var colorDec = Math.ceil(sumColor / ((xMax - xMin) * (yMax - yMin)));
    var colorHex = colorDec.toString(16);
    return colorHex;
}

