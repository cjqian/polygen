//////////////////////////////////////////////////////////
// PIXEL
//////////////////////////////////////////////////////////

function Pixel( r, g, b, a ) {
    if ( a === undefined ) {
        a = 255;
    }
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

// make sure pixel values are between 0 and 255
Pixel.prototype.clamp = function() {
    this.r = Math.min( 255, Math.max( this.r,  0 ) );
    this.g = Math.min( 255, Math.max( this.g,  0 ) );
    this.b = Math.min( 255, Math.max( this.b,  0 ) );
};

// copy value from web color code like '#a2881f' into pixel
Pixel.prototype.copyFromHex = function( hex ) {
    var bigint = parseInt( hex.substring(1), 16 );
    this.r = ( bigint >> 16 ) & 255;
    this.g = ( bigint >> 8  ) & 255;
    this.b = ( bigint       ) & 255;
    this.a = 255;
};

// convert to hex (returns string)
Pixel.prototype.toHex = function() {
    var r = Math.round(this.r);
    var g = Math.round(this.g);
    var b = Math.round(this.b);
    return '#' + (r < 16 ? '0' : '') + r.toString(16) +
                 (g < 16 ? '0' : '') + g.toString(16) +
                 (b < 16 ? '0' : '') + b.toString(16);
};

// copy value from HSL into pixel
Pixel.prototype.convertFromHSL = function( h, s, l ) {
    var m1, m2;
    m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
    m1 = l * 2 - m2;
    var hueToRGB = function( m1, m2, h ) {
      h = ( h < 0 ) ? h + 1 : ((h > 1) ? h - 1 : h);
      if ( h * 6 < 1 ) return m1 + (m2 - m1) * h * 6;
      if ( h * 2 < 1 ) return m2;
      if ( h * 3 < 2 ) return m1 + (m2 - m1) * (0.66666 - h) * 6;
      return m1;
    };
    this.r = Math.round( hueToRGB( m1, m2, h + 1 / 3 ) * 255 );
    this.g = Math.round( hueToRGB( m1, m2, h         ) * 255 );
    this.b = Math.round( hueToRGB( m1, m2, h - 1 / 3 ) * 255 );
};

// convert to HSL (returns values in an array)
Pixel.prototype.convertToHSL = function() {
    var r = this.r / 255, 
        g = this.g / 255, 
        b = this.b / 255;
    var max = Math.max(r, g, b), 
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if ( max == min ) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch( max ) {
           case r: h = (g - b) / d + (g < b ? 6 : 0); break;
           case g: h = (b - r) / d + 2; break;
           case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
};

// adds argument color to this pixel and returns sum in a new pixel
Pixel.prototype.add = function( p ) {
    var q = new Pixel( 0, 0, 0 );
    q.r = this.r + p.r;
    q.g = this.g + p.g;
    q.b = this.b + p.b;
    q.a = this.a;
    return q;
};

// subtract argument color to this pixel and returns diff in a new pixel
Pixel.prototype.minus = function( p ) {
    var q = new Pixel( 0, 0, 0 );
    q.r = this.r - p.r;
    q.g = this.g - p.g;
    q.b = this.b - p.b;
    q.a = this.a; 
    return q;
};

// scale values by argument m and return result in new pixel
Pixel.prototype.multiply = function( m ) {
    var q = new Pixel( 0, 0, 0 );
    q.r = this.r * m;
    q.g = this.g * m;
    q.b = this.b * m;
    q.a = this.a;
    return q;
};


//////////////////////////////////////////////////////////
// IMAGE
//////////////////////////////////////////////////////////

function Img( width, height, data  ) {
    this.width  = width;
    this.height = height;
    this.data   = data;
}

Img.prototype.createData = function( width, height ) {
    return new Uint8ClampedArray( width * height * 4 );
};

Img.prototype.createImg = function( width, height ) {
    var data = this.createData( width, height );
    // initial value of image is white and fully opaque
    for( var i = 0; i < data.length; i++ ) {
        data[i] = 255;
    }
    return new Img( width, height, data );
};

Img.prototype.copyImg = function() {
    var data = this.createData( this.width, this.height );

    for( var i = 0; i < data.length; i++ ) {
        data[i] = this.data[i];
    }
    return new Img( this.width, this.height, data );
};

Img.prototype.toImgData = function() {
    // this function should be this one-liner, but it only works in firefox and safari:
    // return new ImageData( this.data, this.width, this.height );

    // instead here is an ugly way to convert our data to ImageData object
    // this is a workaround because Chrome does not yet implement the constructor above
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    var imageData = ctx.createImageData( this.width, this.height );
    imageData.data.set( this.data );
    return imageData;
};

// says how to index into the pixel data of the image to get to pixel i,j
Img.prototype.pixelIndex = function( i, j ) {
    return 4 * ( i * this.width + j );
};

Img.prototype.getPixel = function( i, j ) {
    var index = this.pixelIndex( i, j );
    var pixel = new Pixel(
        this.data[index], 
        this.data[index+1], 
        this.data[index+2],
        this.data[index+3]);
    return pixel;
};

Img.prototype.setPixel = function( i, j, pixel ) {
    var index = this.pixelIndex( i, j );
    this.data[index]   = pixel.r;
    this.data[index+1] = pixel.g;
    this.data[index+2] = pixel.b;
    this.data[index+3] = pixel.a;
};
