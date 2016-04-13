var Triangulate = Triangulate || {};

Triangulate.image;
Triangulate.processedData;

Triangulate.twoVertices;
Triangulate.threeVertices;
Triangulate.vertexHeights;
Triangulate.triangles;

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

Triangulate.getEdgePoints = function( sensitivity, accuracy )
{
    var multiplier = parseInt( ( accuracy || 0.1 ) * 10, 10 ) || 1;
    console.log("Multiplier " + multiplier);
    var edge_detect_value = sensitivity;
    var width  = Triangulate.image.width;
    var height = Triangulate.image.height;
    var data = Triangulate.processedData;
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

Triangulate.wrapAroundCylinder = function(vertices){
    var cylinderVertices = [];
    var radius = Triangulate.image.width / Math.PI / 2;
    var length = Triangulate.image.width;

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

//Triangulate.updateVertices = function(n){
Triangulate.updateVertices = function (accuracy, blur, points, rand, sensitivity){
    //make sure we have a fresh copy of the processed data
    Triangulate.processedData = Triangulate.image.data.slice();

    //first, we preprocess: blur, greyscale, then edge detect
    //blur uses lib/blur
    Triangulate.processedData = boxBlurCanvas(Triangulate.processedData, blur, false);
    Triangulate.processedData = Triangulate.greyscale(Triangulate.processedData);
    Triangulate.processedData = Triangulate.detectEdges(Triangulate.processedData, accuracy, 5);

    console.log("processed");
    console.log(Triangulate.processedData);

    
    console.log("ORIAINL");
    console.log(Triangulate.image.data);
    var n = Math.floor(points * .0001 * Triangulate.image.width * Triangulate.image.height);
    console.log(n + " points" );
    var nodePoints = Triangulate.getEdgePoints( accuracy, sensitivity);
    var nodeArray = Triangulate.getRandomVertices(nodePoints, .0505, n, sensitivity);

    //also, set up vertex heights
    Triangulate.vertexHeights = new Array(points);
    for (var i = 0; i < points; i++){
        Triangulate.vertexHeights.push(0);
        //Triangulate.vertexHeights.push((Math.random() - .5) * 100);
    }
    //2d triangles
    Triangulate.twoVertices = nodeArray.slice();
    Triangulate.triangles = Delaunay.triangulate( Triangulate.twoVertices  ).slice();


    //now we wrap them
    Triangulate.threeVertices = Triangulate.twoVertices.slice();
}


Triangulate.initImage = function(imagePath, nAccuracy, nBlur, nPoints, nRand, nSensitivity){
    var image = new Image();    
    image.src = './img/' + imagePath;

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var imageElement = document.createElement('img');
    imageElement.src = './img/' + imagePath;

    imageElement.onload = function(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;

        context.drawImage(imageElement, 0, 0);

        var imageData = context.getImageData(0, 0, imageElement.width, imageElement.height);
        Triangulate.image = new Img(imageElement.width, imageElement.height, imageData.data);

        //make the greyscale image
        Triangulate.processedData = imageData;

        //get triangles and vertices
        Triangulate.updateVertices(nAccuracy, nBlur, nPoints, nRand, nSensitivity);

        //do the scene load
        //TwoScene.initCanvas(Triangulate.image);
        ThreeScene.init();
        //TwoScene.updateDots(Triangulate.twoVertices);
        ThreeScene.animate();
    };
}


Triangulate.getColorOfFace = function(vertexA, vertexB, vertexC){
    var centerX = Math.round((vertexA.x + vertexB.x + vertexC.x) * .3333);
    var centerY = Math.round((vertexA.y + vertexB.y + vertexC.y) * .3333);

    var color = Triangulate.image.getPixel(centerY, centerX);
    return color;
}

