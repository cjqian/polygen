var Triangulate = Triangulate || {};

Triangulate.image;

Triangulate.blockWidth; 
Triangulate.blockHeight;

Triangulate.blocksPerRow;
Triangulate.blocksPerCol;

Triangulate.blockStdDevs; //list of standard deviations for each list
/*
[
    block 0: [
        [x, y], [x, y].....
    ]
]
*/

Triangulate.initImage = function(img){
    Triangulate.image = img;

    Triangulate.image.width = img.width;
    Triangulate.image.height = img.height;
}


//returns n uniform points with some skew
Triangulate.getUniformPoints = function ( skew ){
    var nodeArray = [];

    for (var i = Triangulate.blockHeight/2; i < Triangulate.image.height; i+= Triangulate.blockHeight){
        for (var j = Triangulate.blockWidth/2; j < Triangulate.image.width; j+= Triangulate.blockWidth){
            var curNode = [];

            //randomness up to 1% of the image width/height
            var randomX = Math.ceil((Math.random() - .5) * Triangulate.image.width * skew);
            var randomY = Math.ceil((Math.random() - .5) * Triangulate.image.height * skew);

            curNode.push(j + randomX);
            curNode.push(i + randomY);

            nodeArray.push(curNode);
        }
    }

    return nodeArray;
}

Triangulate.getIdxFromCoordStart = function(i, j ){
    var iRaw = i / Triangulate.blockHeight;
    var jRaw = j / Triangulate.blockWidth;

    return (iRaw * Triangulate.blocksPerRow + jRaw);
}

//returns n points in the block starting at i, j
Triangulate.getPointsInBlock = function(n, i, j){
    //first, we get the points in the block
    var curBlockIdx = Triangulate.getIdxFromCoordStart(i, j);
    var curBlockStdDevs = Triangulate.blockStdDevs[curBlockIdx];

    //var blockStdDevs = Triangulate.blockStdDevs.slice(0, 10);

    //now, we sort it
    function compare(a, b){
        if (a.val < b.val) return -1;
        else if (a.val > b.val) return 1;
        else return 0;
    }
    curBlockStdDevs.sort(compare);

    //now, we make the actual array 
    points = [];
    for (var i = 0; i < n; i++){
        curPoint = [];

        curPoint.push(curBlockStdDevs[i].x);
        curPoint.push(curBlockStdDevs[i].y);

        points.push(curPoint);
    }

    return points;
}


Triangulate.getDecimalFromPixel = function(i, j){
    var curPixelColor = Triangulate.image.getPixel(i, j).toHex();
    var curPixelHex = curPixelColor.toString().substring(1, curPixelColor.length);
    var curPixelDec = parseInt(curPixelHex, 16);
    return curPixelDec;
}

Triangulate.getDecimalArrayFromPixel = function(image, i, j){
    var curPixelColor = image.getPixel(i, j).toHex();
    var curPixelHex = curPixelColor.toString().substring(1, curPixelColor.length);

    var hexVals = [];

    hexVals.push(parseInt(curPixelHex.substring(0, 2), 16));
    hexVals.push(parseInt(curPixelHex.substring(2, 4), 16));
    hexVals.push(parseInt(curPixelHex.substring(4, 6), 16));

    return hexVals;
}


Triangulate.resetThreshold = function( n ){
    var points = n/10; // 1/10 of total points atm, should be variable
    var pointsSqrt = Math.ceil(Math.sqrt(points));

    Triangulate.blockWidth = Math.ceil(Triangulate.image.width / pointsSqrt);
    Triangulate.blockHeight = Math.ceil(Triangulate.image.height / pointsSqrt);

    Triangulate.blocksPerRow = Math.floor(Triangulate.image.width / Triangulate.blockWidth);
    Triangulate.blocksPerCol = Math.floor(Triangulate.image.height / Triangulate.blockHeight);

    Triangulate.blockStdDevs = new Array(Triangulate.blocksPerRow * Triangulate.blocksPerCol);
}


Triangulate.toIdx = function(i, j){
    return (i * Triangulate.blocksPerRow + j);
}

Triangulate.getX = function(idx){
    return (idx - Triangulate.getY(idx));
    //return (idx - Math.flooTriangulate.blocksPerRow);
}

Triangulate.getY = function(idx){
    return Math.floor(idx / Triangulate.blocksPerRow);
}

//get the average std dev of the block starting at i, j
//this assumes that the pixelStdDev array is filled out
Triangulate.getAvgPixVal = function(y, x){
    var sumPixVal = 0;

    for (var i = y; i < y + Triangulate.blockHeight; i++){
        for (var j = x; j < x + Triangulate.blockWidth; j++){
            sumPixVal += Triangulate.getDecimalFromPixel(i, j);
        }
    }

    return (sumPixVal / (Triangulate.blockHeight * Triangulate.blockWidth));
}

//sets the standard deviation of all pixels in the block starting at i, j and returns the average
Triangulate.getAvgStdDev = function(y, x){
    var avgPixVal = Triangulate.getAvgPixVal(y, x);

    var sumStdDev = 0;

    var curBlockStdDevs = [];

    for (var i = y; i < y + Triangulate.blockHeight; i++){
        for (var j = x; j < x + Triangulate.blockWidth; j++){
            var curDiff = Triangulate.getDecimalFromPixel(i, j) - avgPixVal;
            var curDiffSq = curDiff * curDiff;

            var curSDObj = {"x": j, "y": i, "val": curDiffSq};
            curBlockStdDevs.push(curSDObj);

            sumStdDev += curDiffSq;
        }
    }

    Triangulate.blockStdDevs[Triangulate.getIdxFromCoordStart(y, x)] = curBlockStdDevs;

    return (sumStdDev / (Triangulate.blockHeight * Triangulate.blockWidth));
}

//returns an array of standard deviations for each block
Triangulate.getBlockStdDevs = function(){
    var stdDevs = [];

    var sumStdDevs = 0;
    //for each block
    for (var i = 0; i < Triangulate.image.height; i += Triangulate.blockHeight){
        for (var j = 0; j < Triangulate.image.width; j += Triangulate.blockWidth){
            var avgStdDev = Triangulate.getAvgStdDev(i, j); //blockStdDevs should be filled now
            stdDevs.push(avgStdDev);
            sumStdDevs += avgStdDev;
        }
    }

    //result list; first the array of std devs, then their sum
    var resList = [];
    resList.push(stdDevs);
    resList.push(sumStdDevs);
    return resList;
}

//returns an array of the most significant points
Triangulate.getVertices = function ( n , rand){
    Triangulate.resetThreshold( n );

    //start with a uniform mesh with 10% of our points
    var nodeArray = Triangulate.getUniformPoints(rand);

    //get the average standard deviations of each block
    var stdDevResult = Triangulate.getBlockStdDevs();

    var stdDevs = stdDevResult[0];
    var sumStdDev = stdDevResult[1];

    var idx = 0;
    var remPoints = Math.ceil(n * .9); //again, assumption

    //allocate tickets for each block

    for (var i = 0; i < Triangulate.blocksPerCol; i++){
        for (var j = 0; j < Triangulate.blocksPerRow; j++){
            var n = Math.floor((stdDevs[idx++]/sumStdDev) * remPoints);
            var newNodes = Triangulate.getPointsInBlock(n, i * Triangulate.blockHeight, j * Triangulate.blockWidth);

            nodeArray.push.apply(nodeArray, newNodes);
        }
    }

    return nodeArray;
}

Triangulate.getAverageColor = function(image, triangle){
    var xMin = Math.min(triangle[0][0], triangle[1][0], triangle[2][0]);
    var xMax = Math.max(triangle[0][0], triangle[1][0], triangle[2][0]);

    var yMin = Math.min(triangle[0][1], triangle[1][1], triangle[2][1]);
    var yMax = Math.max(triangle[0][1], triangle[1][1], triangle[2][1]);

    var sumR = 0;
    var sumG = 0;
    var sumB = 0;

    for (var i = yMin; i < yMax; i++){
        for (var j = xMin; j < xMax; j++){
            var decArray = Triangulate.getDecimalArrayFromPixel(image, i, j);

            sumR += decArray[0];
            sumG += decArray[1];
            sumB += decArray[2];
        }
    }

    var area = (xMax - xMin) * (yMax - yMin);

    var R = Math.ceil(sumR / area);
    var G = Math.ceil(sumG / area);
    var B = Math.ceil(sumB / area);

    var hexR = R.toString(16);
    var hexG = G.toString(16);
    var hexB = B.toString(16);

    var hexString =  hexR + hexG + hexB;

    return hexString;
}

