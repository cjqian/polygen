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



