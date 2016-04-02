/**
 * Filter
 */
function getEdgePoints( image_data, sensitivity, accuracy )
{
    var multiplier = parseInt( ( accuracy || 0.1 ) * 10, 10 ) || 1;
    console.log(multiplier);
    var edge_detect_value = sensitivity;
    var width  = image_data.width;
    var height = image_data.height;
    console.log(data);
    var data = image_data;
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
                curPoint = [];
                curPoint.push(x);
                curPoint.push(y);
                points.push(curPoint);
            }
        }
    }

    return points;
}

function getRandomVertices( points, rate, max_num, accuracy, width, height )
{
    console.log(points);
    console.log(rate);
    console.log(max_num);
    console.log(accuracy);
    console.log(width);
    console.log(height);
    var j;
    var result = [ ];
    var i = 0;
    var i_len = points.length;
    var t_len = i_len;
    var limit = Math.round( i_len * rate );

    points = points.slice();

    if ( limit > max_num )
    {
        limit = max_num;
    }

    while ( i < limit && i < i_len )
    {
        j = t_len * Math.random() | 0;
        var curPoint = [];
        curPoint.push(points[j][0]);
        curPoint.push(points[j][1]);
        result.push(curPoint);

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
        var curPoint = [];
        curPoint.push( ~~x);
        curPoint.push(0);
        result.push(curPoint);

        curPoint = [];
        curPoint.push(~~x);
        curPoint.push(height);
        result.push(curPoint);

    }

    for ( y = 0; y < height; y += (100 - accuracy) )
    {
        var curPoint = [];
        curPoint.push(0);
        curPoint.push(~~y);
        result.push(curPoint);

        curPoint = [];
        curPoint.push(width);
        curPoint.push(~~y);
        result.push(curPoint);
    }

    var curPoint = [];
    curPoint.push(0);
    curPoint.push(height);
    result.push(curPoint);

    curPoint = [];
    curPoint.push(width);
    curPoint.push(height);
    result.push(curPoint);


    return result;
}

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



