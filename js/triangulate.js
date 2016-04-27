// (int) 0~255 明るさの平均からエッジを検出する際の最小値を示す, この明るさを超えるピクセルを検出する, 少ないほど詳細
var EDGE_DETECT_VALUE = 50;
// (number) エッジ上のポイントの分布比率, 高いほど詳細, 生成されたポイント数はコンソールを参照
var POINT_RATE = 0.075;
// (int) ポイントの最大数, POINT_RATE によるポイント数はこの値を超えない, 大きいほど詳細
var POINT_MAX_NUM = 2500;
// (int) 細かいエッジを消すために行うほかしのサイズ, 少ないほど詳細
var BLUR_SIZE = 2;
// (int) エッジ検出のサイズ, 大きいほど詳細 
var EDGE_SIZE = 3;
// (int) 許容ピクセル数, このピクセル数を超える画像が指定された場合リサイズする
var PIXEL_LIMIT = 360000;


/**
 * Filter
 */
var Filter = {

    /**
     * グレイスケールフィルタ, ソース用なので 1 チャンネル (Red) のみに
     */
    grayscaleFilterR: function (imageData) {
        var width  = imageData.width | 0;
        var height = imageData.height | 0;
        var data = imageData.data;

        var x, y;
        var i, step;
        var r, g, b;

        for (y = 0; y < height; y++) {
            step = y * width;

            for (x = 0; x < width; x++) {
                i = (x + step) << 2;
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];

                data[i] = (Math.max(r, g, b) + Math.min(r, g, b)) >> 2;
            }
        }

        return imageData;
    },

    /**
     * 畳み込みフィルタ, ソース用なので 1 チャンネル (Red) のみに
     * 
     * @see http://jsdo.it/akm2/iMsL
     */
    convolutionFilterR: function(matrix, imageData, divisor) {
        matrix  = matrix.slice();
        divisor = divisor || 1;

        // 割る数を行列に適用する
        var divscalar = divisor ? 1 / divisor : 0;
        var k, len;
        if (divscalar !== 1) {
            for (k = 0, len = matrix.length; k < matrix.length; k++) {
                matrix[k] *= divscalar;
            }
        }

        var data = imageData.data;

        // 参照用にオリジナルをコピー, グレースケールなので Red チャンネルのみ
        len = data.length >> 2;
        var copy = new Uint8Array(len);
        for (i = 0; i < len; i++) copy[i] = data[i << 2];

        var width  = imageData.width | 0;
        var height = imageData.height | 0;
        var size  = Math.sqrt(matrix.length);
        var range = size * 0.5 | 0;

        var x, y;
        var r, g, b, v;
        var col, row, sx, sy;
        var i, istep, jstep, kstep;

        for (y = 0; y < height; y++) {
            istep = y * width;

            for (x = 0; x < width; x++) {
                r = g = b = 0;

                for (row = -range; row <= range; row++) {
                    sy = y + row;
                    jstep = sy * width;
                    kstep = (row + range) * size;

                    if (sy >= 0 && sy < height) {
                        for (col = -range; col <= range; col++) {
                            sx = x + col;

                            if (
                                    sx >= 0 && sx < width &&
                                    (v = matrix[(col + range) + kstep]) // 値が 0 ならスキップ
                               ) {
                                   r += copy[sx + jstep] * v;
                               }
                        }
                    }
                }

                // 値を挟み込む
                if (r < 0) r = 0; else if (r > 255) r = 255;

                data[(x + istep) << 2] = r & 0xFF;
            }
        }

        return imageData;
    }  
};

var Triangulate = Triangulate || {};
Triangulate.imageElement;
Triangulate.context;
Triangulate.image;
Triangulate.doubleImage;

Triangulate.processedData;

Triangulate.meshType;

Triangulate.twoVertices;
Triangulate.threeVertices;
Triangulate.vertexHeights;

Triangulate.triangles;
Triangulate.faceColors;

Triangulate.getEdgeMatrix = function( size )
{
    var matrix = [ ];
    var side = size * 2 + 1;
    var i, len = side * side;
    var center = len * 0.5 | 0;

    for ( i = 0; i < len; i++ )
    {
        matrix[i] = i === center ? -len + 1 : 1;
    }

    return matrix;
}

Triangulate.detectEdges = function( image_data, accuracy, edge_size, divisor )
{
    var matrix = Triangulate.getEdgeMatrix( edge_size ).slice();
    var multiplier = parseInt( ( accuracy || 0.5 ) * 10, 10 ) || 1;

    divisor = divisor || 1;

    var divscalar = divisor ? 1 / divisor : 0;
    var k, len;

    if ( divscalar !== 1 )
    {
        for ( k = 0, len = matrix.length; k < matrix.length; k++ )
        {
            matrix[k] *= divscalar;
        }
    }

    var data = image_data;
    len = data.length >> 2;

    var copy = new Uint8Array( len );

    for (i = 0; i < len; i++)
    {
        copy[i] = data[i << 2];
    }

    var width  = image_data.width | 0;
    var height = image_data.height | 0;
    var size  = Math.sqrt( matrix.length );
    var range = size * 0.5 | 0;

    var x, y;
    var r, g, b, v;
    var col, row, sx, sy;
    var i, istep, jstep, kstep;

    for ( y = 0; y < height; y += multiplier )
    {
        istep = y * width;

        for ( x = 0; x < width; x += multiplier  )
        {
            r = g = b = 0;

            for ( row = -range; row <= range; row++ )
            {
                sy = y + row;
                jstep = sy * width;
                kstep = (row + range) * size;

                if ( sy >= 0 && sy < height )
                {
                    for ( col = -range; col <= range; col++ )
                    {
                        sx = x + col;

                        if (
                                sx >= 0 && sx < width &&
                                ( v = matrix[( col + range ) + kstep] )
                           )
                        {
                            r += copy[sx + jstep] * v;
                        }
                    }
                }
            }

            if ( r < 0 )
            {
                r = 0;
            }

            else
            {
                if ( r > 255 )
                {
                    r = 255;
                }
            }

            data[( x + istep ) << 2] = r & 0xFF;
        }
    }

    return image_data;
}


Triangulate.greyscale = function( image_data )
{
    var len = image_data.length;
    var data = image_data;

    for ( var i = 0; i < len; i += 4 ) 
    {
        var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]; 

        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
    }

    image_data = data;
    return image_data;
}

Triangulate.getEdgePoints = function( image_data, sensitivity, accuracy )
{
    var multiplier = parseInt( ( accuracy || 0.1 ) * 10, 10 ) || 1;
    var edge_detect_value = sensitivity;
    var width = image_data.width;
    var height = image_data.height;
    var data = image_data.data;
    var points = [ ];
    var x, y, row, col, sx, sy, step, sum, total;

    for ( y = 0; y < height; y += multiplier )
    {
        for ( x = 0; x < width; x += multiplier )
        {
            sum = total = 0;

            for ( row = -1; row <= 1; row++ )
            {
                sy = y + row;
                step = sy * width;

                if ( sy >= 0 && sy < height )
                {
                    for ( col = -1; col <= 1; col++ )
                    {
                        sx = x + col;

                        if ( sx >= 0 && sx < width )
                        {
                            sum += data[( sx + step ) << 2]; 
                            total++;
                        }
                    }
                }
            }

            if ( total )
            {
                sum /= total;
            }

            if ( sum > edge_detect_value )
            {
                points.push( [ x, y ]);
                //points.push( { x: x, y: y } );
            }
        }
    }
    return points;
}

Triangulate.getRandomVertices = function( points, rate, max_num, accuracy)
{
    //max num is the number of vertices

    var width = Triangulate.image.width;
    var height = Triangulate.image.height;

    var j;
    var result = [ ];
    var i = 0;
    var i_len = points.length;
    var t_len = i_len;
    var limit = Math.round( i_len * rate );

    if ( limit > max_num )
    {
        limit = max_num;
    }

    while ( i < limit && i < i_len )
    {
        j = t_len * Math.random() | 0;
        result.push( [ points[j][0], points[j][1] ]);
        //result.push( [points[j].x, points[j].y] );
        //result.push( { x: points[j].x, y: points[j].y } );

        // this seems to be extremely time
        // intensive.
        // points.slice( j, 1 );

        t_len--;
        i++;
    }

    var x, y;
    // gf: add more points along the edges so we always use the full canvas,
    for ( x = 0; x < width; x += (100 - accuracy) )
    {
        result.push( [ ~~x, 0 ] );
        result.push( [ ~~x, height ] );
        //result.push( { x: ~~x, y: 0 } );
        //result.push( { x: ~~x, y: height } );
    }

    for ( y = 0; y < height; y += (100 - accuracy) )
    {
        result.push( [ 0, ~~y ] );
        result.push( [ width, ~~y ]);
        //result.push( { x: 0, y: ~~y } );
        //result.push( { x: width, y: ~~y } );
    }

    result.push( [0, height] );
    result.push( [width, height] );
    //result.push( { x: 0, y: height } );
    //result.push( { x: width, y: height } );

    return result;
}

//Triangulate.getRandomZ = function(n){
//var zArray = [];
//for (var i = 0; i < n; i++){
//zArray.push(Math.random() * 100);
//}

//return zArray;
//}

Triangulate.wrapAroundCylinder = function(imageData, vertices){
    var cylinderVertices = [];
    var radius = imageData.width / Math.PI / 2;
    var length = imageData.width;

    for (var i = 0; i < vertices.length; i++){
        var curPoint = vertices[i];
        var newX = radius * Math.cos(curPoint[0] * (2 * Math.PI / length));
        var newY = radius * Math.sin(curPoint[0] * (2 * Math.PI / length));
        var newZ = curPoint[1];

        cylinderVertices.push([newX, newY]);
        Triangulate.vertexHeights[i] = newZ;
    }

    return cylinderVertices;
}

//using hammer aitoff map projection
Triangulate.wrapAroundSphere = function(vertices){
    var sphereVertices = [];
    for (var i = 0; i < vertices.length; i++){
        var latitude = vertices[i][0];
        var longitude = vertices[i][1];

        var zsq = 1 + Math.cos(latitude) * Math.cos(longitude / 2);
        var zunround = Math.sqrt(zsq);

        var xunround = Math.cos(latitude) * Math.sin(longitude / 2) / zunround;
        var yunround = Math.sin(latitude) / zunround;

        var x = Math.round(xunround);
        var y = Math.round(yunround);
        var z = Math.round(zunround);

        sphereVertices.push([x, y]);
        Triangulate.vertexHeights[i] = z;
    }

    return sphereVertices;
}


//Now that triangulate.triangles is set, we use those values to 
//get the color of each face. return in an array of '0xaaaaaa'
Triangulate.getFaceColors = function(){
    faceColors = [];

    var triangles = Triangulate.triangles;
    var vertices = Triangulate.twoVertices;

    for (var i = triangles.length; i; ){
        i--;
        var v1 = vertices[triangles[i]];

        i--;
        var v2 = vertices[triangles[i]];

        i--;
        var v3 = vertices[triangles[i]];

        var centerX = Math.round((v1[0] + v2[0] + v3[0]) * .3333);
        var centerY = Math.round((v1[1] + v2[1] + v3[1]) * .3333);

        var color = Triangulate.image.getPixel(centerY, centerX);
        var colorString = '0x' + color.toHex().substring(1, color.toHex().length);

        faceColors.push(colorString);
    }

    return faceColors;
}
// ほかし用コンボリューション行列を作成
var blur = (function(size) { 
    var matrix = []; 
    var side = size * 2 + 1;
    var i, len = side * side;
    for (i = 0; i < len; i++) matrix[i] = 1;
    return matrix;
})(BLUR_SIZE);

// エッジ検出用コンボリューション行列を作成
var edge = (function(size) {
    var matrix = []; 
    var side = size * 2 + 1;
    var i, len = side * side;
    var center = len * 0.5 | 0;
    for (i = 0; i < len; i++) matrix[i] = i === center ? -len + 1 : 1;
    return matrix;
})(EDGE_SIZE);

function getEdgePoint(imageData, edgeDetectValue) {
    var width  = imageData.width;
    var height = imageData.height;
    var data = imageData.data;

    var E = edgeDetectValue; // local copy

    var points = [];
    var x, y, row, col, sx, sy, step, sum, total;

    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            sum = total = 0;

            for (row = -1; row <= 1; row++) {
                sy = y + row;
                step = sy * width;
                if (sy >= 0 && sy < height) {
                    for (col = -1; col <= 1; col++) {
                        sx = x + col;

                        if (sx >= 0 && sx < width) {
                            sum += data[(sx + step) << 2];
                            total++;
                        }
                    }
                }
            }

            if (total) sum /= total;
            if (sum > E) points.push(new Array(x, y));
        }
    }

    return points;
}


//Triangulate.updateVertices = function(n){
Triangulate.updateVertices = function( paramObject ){
    //get values
    var accuracy = paramObject.accuracy;
    //var blur = paramObject.blur;
    var npoints = paramObject.points;
    var rand = paramObject.rand;
    var sensitivity = paramObject.sensitivity;
    var rate = paramObject.rate;
    console.log(paramObject);
    //if cylinder, we want twice
    var curImage;
    /*
       if (paramObject.meshType == "cylinder"){
       curImage = Triangulate.doubleImage;
       }
       else {
       */
    curImage = Triangulate.image;
    //}

    //make sure we have a fresh copy of the processed data

    //var freshData = Triangulate.context.getImageData(0, 0, Triangulate.imageElement.width, Triangulate.imageElement.height);
    var freshData = new Img(curImage.width, curImage.height, curImage.data.slice());

    //first, we preprocess: blur, greyscale, then edge detect
    //var blurredData = boxBlurCanvas(freshData, blur, false);
    //var greyData = Triangulate.greyscale(blurredData);
    //var edgeData = Triangulate.detectEdges(greyData,  accuracy, 5);

    Filter.grayscaleFilterR(freshData);
    console.log(freshData);
    Filter.convolutionFilterR(blur, freshData, blur.length);

    console.log(freshData);
    Filter.convolutionFilterR(blur, freshData, blur.length);

    console.log(freshData);
    Filter.convolutionFilterR(blur, freshData, blur.length);
    Filter.convolutionFilterR(edge, freshData);

    var temp = getEdgePoint(freshData, sensitivity);
    var detectionNum = temp.length;

    var points = [];
    var i = 0, ilen = temp.length;
    var tlen = ilen;
    var j, limit = Math.round(ilen * rate);
    if (limit > npoints) limit = npoints;

    // ポイントを間引く
    while (i < limit && i < ilen) {
        j = tlen * Math.random() | 0;
        points.push(temp[j]);
        temp.splice(j, 1);
        tlen--;
        i++;
    }

    console.log(points.length);

    var nodePoints = Triangulate.getEdgePoints( freshData, sensitivity, accuracy);
    var nodeArray = Triangulate.getRandomVertices(nodePoints, rate, points, accuracy);
    console.log(nodeArray.length);

    //2d triangles
    Triangulate.twoVertices = [];
    //instead of nodeArray
    Triangulate.twoVertices = points.slice();

    Triangulate.triangles = [];
    Triangulate.triangles = Delaunay.triangulate( Triangulate.twoVertices  ).slice();
    Triangulate.faceColors = Triangulate.getFaceColors();

    Triangulate.threeVertices = [];
    Triangulate.vertexHeights = new Array(points);

    //now we center
    var halfHeight = Math.round(curImage.height / 2);
    var halfWidth = Math.round(curImage.width / 2);

    for (var i = 0; i < Triangulate.twoVertices.length; i++){
        var curVertex = Triangulate.twoVertices[i];
        curVertex[0] = curVertex[0] - halfWidth;
        curVertex[1] = curVertex[1] - halfHeight;
    }

    //handle the object types
    if (paramObject.meshType == "plane"){
        for (var i = 0; i < points.length; i++){
            Triangulate.vertexHeights.push(0);
        }

        Triangulate.threeVertices = Triangulate.twoVertices.slice();
    }

    else if (paramObject.meshType == "mountain"){
        for (var i = 0; i < nodeArray.length; i++){
            if (paramObject.mountainType == "random"){

                Triangulate.vertexHeights.push((Math.random() - .5) * paramObject.mountainHeight);
            }

            else if (paramObject.mountainType == "emboss"){
                var x = Math.min(curImage.width - 1, nodeArray[i][0]);
                var y = Math.min(curImage.height - 1, nodeArray[i][1]);

                var hexValue = curImage.getPixel(y, x).toHex().substring(1, 7);
                var decValue = 16777215 - parseInt(hexValue, 16);
                var heightDiff = decValue/16777215 - .5;

                Triangulate.vertexHeights.push(heightDiff * paramObject.mountainHeight);
            }

            else if (paramObject.mountainType == "engrave"){
                var x = Math.min(curImage.width - 1, nodeArray[i][0]);
                var y = Math.min(curImage.height - 1, nodeArray[i][1]);

                var hexValue = curImage.getPixel(y, x).toHex().substring(1, 7);
                var decValue = parseInt(hexValue, 16);
                var heightDiff = decValue/16777215 - .5;

                Triangulate.vertexHeights.push(heightDiff * paramObject.mountainHeight);
            }


            //random
        }

        Triangulate.threeVertices = Triangulate.twoVertices.slice();
    } 

    else if (paramObject.meshType == "cylinder"){
        Triangulate.threeVertices = Triangulate.wrapAroundCylinder(curImage, Triangulate.twoVertices);
    }

    else if (paramObject.meshType == "mountain_cylinder"){
        Triangulate.threeVertices = Triangulate.wrapAroundCylinder(curImage, Triangulate.twoVertices);
        //add noise to x values
        for (var i = 0; i < Triangulate.threeVertices.length; i++){
            Triangulate.threeVertices[i][0] = Math.round(Triangulate.threeVertices[i][0] + (Math.random() - .5) * paramObject.mountainHeight);
        }
    }

    else if (paramObject.meshType == "sphere"){
        Triangulate.threeVertices = Triangulate.wrapAroundSphere(Triangulate.twoVertices);
    }
    console.log("HI");
}


Triangulate.initImage = function(paramObject){
    var image = new Image();    
    image.src = './img/' + paramObject.imagePath;

    var canvas = document.getElementById('canvas');
    Triangulate.context = canvas.getContext('2d');

    Triangulate.imageElement = document.createElement('img');
    Triangulate.imageElement.src = './img/' + paramObject.imagePath;

    Triangulate.imageElement.onload = function(){
        Triangulate.context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = Triangulate.imageElement.width;
        canvas.height = Triangulate.imageElement.height;

        Triangulate.context.drawImage(Triangulate.imageElement, 0, 0);

        var imageData = Triangulate.context.getImageData(0, 0, Triangulate.imageElement.width, Triangulate.imageElement.height);
        Triangulate.image = new Img(Triangulate.imageElement.width, Triangulate.imageElement.height, imageData.data);
        Triangulate.doubleImage = new Img();
        Triangulate.doubleImage = Triangulate.doubleImage.createImg(Triangulate.imageElement.width * 2, Triangulate.imageElement.height);

        for (var i = 0; i < Triangulate.image.height; i++) {
            for (var j = 0; j < Triangulate.image.width; j++){
                var pixel = Triangulate.image.getPixel(i, j);
                Triangulate.doubleImage.setPixel(i, j, pixel);
                Triangulate.doubleImage.setPixel(i, j + Triangulate.image.width, pixel);
            }
        }

        //make the greyscale image
        Triangulate.processedData = imageData;

        //do the scene load
        //TwoScene.init(Triangulate.image);
        //TwoScene.updateDots(Triangulate.twoVertices);

        ThreeScene.init();
        ThreeScene.update(paramObject);
    };
}

Triangulate.getColorOfFace = function(vertexA, vertexB, vertexC){
    var centerX = Math.round((vertexA.x + vertexB.x + vertexC.x) * .3333);
    var centerY = Math.round((vertexA.y + vertexB.y + vertexC.y) * .3333);

    var color = Triangulate.image.getPixel(centerY, centerX);
    return color;
}

