console.log("HI");
//jsdo ithttp://jsdo.it/akm2/xoYx
var Triangulate = Triangulate || {};

Triangulate.image;

Triangulate.vertices;
Triangulate.vertexHeights;
Triangulate.triangles;
Triangulate.getEdgePoints = function( sensitivity, accuracy )
{
    var multiplier = parseInt( ( accuracy || 0.1 ) * 10, 10 ) || 1;
    console.log("Multiplier " + multiplier);
    var edge_detect_value = sensitivity;
    var width  = Triangulate.image.width;
    var height = Triangulate.image.height;
    var data = Triangulate.image.data;
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
        // points.splice( j, 1 );

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

Triangulate.getRandomZ = function(n){
    var zArray = [];
    for (var i = 0; i < n; i++){
        zArray.push(Math.random() * 100);
    }

    return zArray;
}

//Triangulate.getVertices = function(n){
Triangulate.getVertices = function (accuracy, points, rand, sensitivity){
       var n = Math.floor(points * .0001 * Triangulate.image.width * Triangulate.image.height);
       var nodePoints = Triangulate.getEdgePoints( accuracy, sensitivity);
       var nodeArray = Triangulate.getRandomVertices(nodePoints, .0505, n, sensitivity);

        //also, set up vertex heights
        Triangulate.vertexHeights = new Array(points);
        for (var i = 0; i < points; i++){
            Triangulate.vertexHeights.push((Math.random() - .5) * 100);
        }

       return nodeArray;
    /*
    var vertices = new Array(n),
        i, x, y;

    for(i = vertices.length; i--; ) {
        x = Math.random() * 1000;
        y = Math.random() * 1000;
             vertices[i] = [x, y];
    }

    return vertices;
    */
}

Triangulate.getTriangles = function ( vertices ){
    var triangles = Delaunay.triangulate( vertices );
    return triangles;
}


Triangulate.initImage = function(imagePath, nAccuracy, nPoints, nRand, nSensitivity){
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
        console.log("IMAG LOADED");
        console.log(Triangulate.image);
        

        //get triangles and vertices
       Triangulate.vertices = Triangulate.getVertices(nAccuracy, nPoints, nRand, nSensitivity);
    Triangulate.triangles = Triangulate.getTriangles(Triangulate.vertices);

        //do the scene load
        init();
        animate();


    };

    /*
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext('2d');
    var image_data = context.getImageData(0, 0, canvas.style.width, canvas.style.height);

    Triangulate.image = new Img(image.width, image.height, image_data);

    console.log(Triangulate.image); 
    */
    //now, set it up
    //var vertices = Triangulate.getVertices(nAccuracy, nPoints, nRand, nSensitivity);
 }



