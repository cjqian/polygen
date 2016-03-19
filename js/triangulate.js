var Triangulate = Triangulate || {};

Triangulate.image;

Triangulate.triWidth;
Triangulate.triHeight;

Triangulate.triPerRow;
Triangulate.triPerCol;

Triangulate.baseTriangles;
Triangulate.triStdDevs;
/* 
   2D array; each array is a row 
   each element is a triangle
   */

//Triangulate.blockStdDevs; //list of standard deviations for each list
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

//TODO what is the word for this?? mask??
Triangulate.mask = function( x , isWidth ) {
    if ( x < 0 ) return 0;

    if (isWidth){
        return Math.min(x, Triangulate.image.width - 1);
    } else {
        return Math.min(x, Triangulate.image.height - 1);
    }
}

Triangulate.getLine = function(pointA, pointB){
    var m = (pointB[1] - pointA[1])/(pointB[0] - pointA[0]);
    var b = pointA[1] - (m * pointA[0]);

    var line = [m, b];

    return line;
}

Triangulate.addTriangle = function(array, top, left, right, upright){
    //need to compute the points on the left border and the points on the right border
    //leftBorder[y] = x;

    var leftBorder = [];
    var rightBorder = [];

    var leftLine = Triangulate.getLine(left, top);
    var rightLine = Triangulate.getLine(top, right);

    for (var i = 0; i < Triangulate.triHeight; i ++){
        var y;
        if (upright) y = top[1] + i;
        else y = top[1] - i;

        var curLeftPoint = (y - leftLine[1])/leftLine[0];
        var curRightPoint = (y - rightLine[1])/rightLine[0];

        leftBorder.push(Math.round(curLeftPoint));
        rightBorder.push(Math.round(curRightPoint));
    }

    var triangle = {"topPoint": top, "leftPoint": left, "rightPoint": right, "isUpright": upright, "leftBorder": leftBorder, "rightBorder": rightBorder};
    array.push(triangle);

    return triangle;
}

//returns n uniform points with some skew
Triangulate.getUniformPoints = function ( skew ){
    Triangulate.baseTriangles = [];
    var nodeArray = [];

    for (var i = 0; i < Triangulate.image.height; i += Triangulate.triHeight){
        var rowTriangles = [];
        //even row
        if ((i / Triangulate.triHeight) % 2 == 0){
            var isUpright = true;

            //add the initial half triangle
            var topPoint = [0, i];
            var leftPoint = [0, i + Triangulate.triHeight];
            var rightPoint = [Math.floor(Triangulate.triWidth / 2), i + Triangulate.triHeight];

            //push the points
            nodeArray.push(topPoint);
            nodeArray.push(leftPoint);
            nodeArray.push(rightPoint);

            var prevTriangle = Triangulate.addTriangle(rowTriangles, topPoint, leftPoint, rightPoint, isUpright);

            for (var j = Triangulate.triWidth; j <= Triangulate.image.width; j += Triangulate.triWidth){
                //push the first triangle
                isUpright = !isUpright;

                var newPoint = [Triangulate.mask(j, true), Triangulate.mask(i, false)];
                nodeArray.push(newPoint);

                prevTriangle = Triangulate.addTriangle(rowTriangles, prevTriangle.rightPoint, prevTriangle.topPoint, newPoint, isUpright);

                //push the second triangle
                isUpright = !isUpright;

                newPoint = [Triangulate.mask(j + Math.floor(Triangulate.triWidth / 2), true), Triangulate.mask(i + Triangulate.triHeight, false)];
                nodeArray.push(newPoint);

                prevTriangle = Triangulate.addTriangle(rowTriangles, prevTriangle.rightPoint, prevTriangle.topPoint, newPoint, isUpright);
            }
        } 

        //odd row
        else {
            var isUpright = false;

            //add the initial half triangle
            var topPoint = [0, i + Triangulate.triHeight];
            var leftPoint = [0, i];
            var rightPoint = [Math.floor(Triangulate.triWidth / 2), i]; 

            //last row
            if (Triangulate.image.height - i <= Triangulate.triHeight){
                nodeArray.push(topPoint);
            }

            var prevTriangle = Triangulate.addTriangle(rowTriangles, topPoint, leftPoint, rightPoint, isUpright);

            for (var j = Triangulate.triWidth; j <= Triangulate.image.width; j += Triangulate.triWidth){
                //push the first triangle
                isUpright = !isUpright;

                var newPoint = [Triangulate.mask(j, true), Triangulate.mask(i + Triangulate.triHeight, false)];

                if (Triangulate.image.height - i <= Triangulate.triHeight) nodeArray.push(newPoint);

                prevTriangle = Triangulate.addTriangle(rowTriangles, prevTriangle.rightPoint, prevTriangle.topPoint, newPoint, isUpright);

                //push the second triangle
                isUpright = !isUpright;

                newPoint = [Triangulate.mask(j + Math.floor(Triangulate.triWidth / 2), true), Triangulate.mask(i, false)];

                if (Triangulate.image.height - i <= Triangulate.triHeight) nodeArray.push(newPoint);

                prevTriangle = Triangulate.addTriangle(rowTriangles, prevTriangle.rightPoint, prevTriangle.topPoint, newPoint, isUpright);
            }
        }

        Triangulate.baseTriangles.push(rowTriangles);
    }

    return nodeArray;
}

Triangulate.getIdxFromCoordStart = function(i, j ){
    var iRaw = i / Triangulate.blockHeight;
    var jRaw = j / Triangulate.blockWidth;

    return (iRaw * Triangulate.blocksPerRow + jRaw);
}

//return n points in the triangle triangle in the row row
Triangulate.getTriPoints = function(n, row, triangle){
    var curStdDevs = Triangulate.triStdDevs[row][triangle];

    //var blockStdDevs = Triangulate.blockStdDevs.slice(0, 10);
    //now, we make the actual array 
    points = [];
    for (var i = 0; i < n; i++){
        curPoint = [];

        curPoint.push(curStdDevs[i].x);
        curPoint.push(curStdDevs[i].y);

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
Triangulate.getAvgPixVal = function(row, triangle){
    var sumPixVal = 0;
    
    var curTriangle = Triangulate.baseTriangles[row][triangle];

        for (var i = 0; i < Triangulate.triHeight; i++){
            for (var j = curTriangle.leftBorder[i]; j < curTriangle.rightBorder[i]; j++){
                if (curTriangle.isUpright){
                    sumPixVal += Triangulate.getDecimalFromPixel(curTriangle.topPoint[1] + i, j);
                } else {
                    sumPixVal += Triangulate.getDecimalFromPixel(curTriangle.topPoint[1] - i, j);
                }
            }
        }

    var height = Triangulate.triHeight;
    var width = curTriangle.rightPoint[0] - curTriangle.leftPoint[0]; //will be smaller for corner triangles

    var triArea = height * width / 2;

    return (sumPixVal / triArea);
}

//initializes the tristddevs array with empty arrays same size as triangulate.basetriangles
Triangulate.initTriStdDevs = function(){
    //initializes triangulate.tristddevs array
    Triangulate.triStdDevs = new Array(Triangulate.baseTriangles.length);
    for (var i = 0; i < Triangulate.baseTriangles.length; i++){
        var curArray = new Array(Triangulate.baseTriangles[i].length);
        Triangulate.triStdDevs[i]= curArray;
    }
}

//sets the standard deviation of all pixels in the triangle starting at i, j and returns the average
Triangulate.getTriStdDev = function(row, triangle){

    var avgPixVal = Triangulate.getAvgPixVal(row, triangle);
    var sumStdDev = 0;

    var curTriangle = Triangulate.baseTriangles[row][triangle];
    var curTriangleStdDevs = [];

    for (var i = 0; i < Triangulate.triHeight; i++){
        for (var j = curTriangle.leftBorder[i]; j < curTriangle.rightBorder[i]; j++){
            if (curTriangle.isUpright){
                var y = curTriangle.topPoint[1] + i;
            } else {
                var y = curTriangle.topPoint[1] - i;
            }

                var curDiff = Triangulate.getDecimalFromPixel(y, j) - avgPixVal;
            var curDiffSq = curDiff * curDiff; //necessary for positive value
            var curStdDevObj = {"x": j, "y": y, "val": curDiffSq};
            curTriangleStdDevs.push(curStdDevObj);
            sumStdDev += curDiffSq;
        }
    }

    //now, we sort it
    function compare(a, b){
        if (a.val < b.val) return -1;
        else if (a.val > b.val) return 1;
        else return 0;
    }

    curTriangleStdDevs.sort(compare);

    Triangulate.triStdDevs[row][triangle] = curTriangleStdDevs;

    var height = Triangulate.triHeight;
    var width = curTriangle.rightPoint[0] - curTriangle.leftPoint[0];

    var triArea = height * width / 2;
    return (sumStdDev / triArea);
}

//returns an array of standard deviations for each block
Triangulate.getTriStdDevs = function(){
    Triangulate.initTriStdDevs();

    var stdDevs = new Array(Triangulate.baseTriangles.length);

    var sumStdDevs = 0;
    //for each row
    for (var i = 0; i < Triangulate.baseTriangles.length; i++){
        var rowStdDevs = new Array(Triangulate.baseTriangles[i].length);

        for (var j = 0; j < Triangulate.baseTriangles[i].length; j++){
            var avgStdDev = Triangulate.getTriStdDev(i, j);

            rowStdDevs[j] = avgStdDev;
            sumStdDevs += avgStdDev;
        }

        stdDevs[i] = rowStdDevs;
    }

    //result list; first the array of std devs, then their sum
    var resList = [];
    resList.push(stdDevs);
    resList.push(sumStdDevs);
    return resList;
}

Triangulate.resetThreshold = function ( n ){
    var points = n / 10 / 2; // we want 10% of the points ot be fixed
    var pointsSqrt = Math.ceil(Math.sqrt(points));

    Triangulate.triWidth = Math.ceil(Triangulate.image.width / pointsSqrt);
    Triangulate.triHeight = Math.ceil(Triangulate.image.height / pointsSqrt);

    Triangulate.triPerRow = Math.floor(Triangulate.image.width / Triangulate.triWidth);
    Triangulate.triPerCol = Math.floor(Triangulate.image.height / Triangulate.triHeight);

    //Triangulate.blockStdDevs = new Array(Triangulate.blocksPerRow * Triangulate.blocksPerCol);
}

//returns an array of the most significant points
Triangulate.getVertices = function ( n , rand){
    Triangulate.resetThreshold( n );

    //start with a uniform mesh with 10% of our points
    var nodeArray = Triangulate.getUniformPoints(rand);
    console.log(Triangulate.baseTriangles);

    //get the average standard deviations of each block
    var stdDevResult = Triangulate.getTriStdDevs();

    var stdDevs = stdDevResult[0];
    var sumStdDev = stdDevResult[1];
    console.log(stdDevs);
    console.log(sumStdDev);

    var idx = 0;
    var remPoints = n - (Triangulate.baseTriangles.length * Triangulate.baseTriangles[1].length);

    for (var i = 0; i < Triangulate.baseTriangles.length; i++){
        for (var j = 0; j < Triangulate.baseTriangles[i].length; j++){
            var n = Math.round(( stdDevs[i][j] / sumStdDev ) * remPoints);
            var triNodes = Triangulate.getTriPoints(n, i, j);         

            nodeArray.push.apply(nodeArray, triNodes);
        }
    }

    console.log(nodeArray);

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

