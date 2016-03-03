var Voronoi = Voronoi || {};

/*

   to do: 

   Add css for p, shapes
   Add mouseover to triangle/circle to show only triangle & circle & show circle's center?
   Add mouseover to polygons to highlight that polygon & its dot?
   */


var width, height, endOfLastDrag, svg;
var myVoronoi;
var voronoiG, triangles;
var show;
Voronoi.image;

var dotsAttr, drag;

Voronoi.initCanvas = function(image){
    Voronoi.image = image;
    width = image.width, height = image.height;
    endOfLastDrag = 0;

    svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height)

        svg.append('rect').attr({width: width, height: height, fill: "none", stroke: 'red'})

        // so that touchmove is not scrolling
        document.body.addEventListener('touchmove', function(event) {
            event.preventDefault();
        }, false); 

    svg.on("click", function(){
        // ignore click if it just happened
        if(Date.now() - endOfLastDrag > 500){
            Voronoi.updateDot(d3.mouse(this))
        }
    })

    myVoronoi = d3.geom.voronoi()
        .x(function(d) {
            return d[0];
        })
    .y(function(d) {
        return d[1];
    })
    .clipExtent([[0, 0], [width, height]]);

    show = {voronoi: false, triangles: true}

    // for now, easier to debug when element types are grouped
    voronoiG = svg.append("g");
    triangles = svg.append("g");

    d3.select("#show-voronoi")
        .on("change", function() {
            show.voronoi = this.checked; 
            d3.selectAll(".voronoi").classed("hidden", !show.voronoi);
        });


    d3.select("#show-triangles")
        .on("change", function() {
            show.triangles = this.checked; 
            d3.selectAll(".triangles").classed("hidden", !show.triangles);
        });

    // dot attributes
    dotsAttr = {cx: function(d){return d[0]},
        cy:function(d){return d[1]},
        r: 5,
        fill: "blue"}

    // set up drag for circles
    drag = d3.behavior.drag()
        .on("drag", dragmove);

    function dragmove(d) {
        d3.select(this)
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y);

        this.__data__ = [d3.event.x, d3.event.y]

            Voronoi.updateDot();

        endOfLastDrag = Date.now();
    }
}

Voronoi.updateDot = function(coord) {
    if(coord){
        var data = [coord];
    } else {
        var data = []
    }

    d3.selectAll(".dots")[0].forEach(function(d){data.push(d.__data__)})

        dots = svg.selectAll(".dots").data(data);

    dots.attr(dotsAttr);

    dots.enter()
        .append("circle")
        .attr(dotsAttr)
        .classed("dots", true)
        .call(drag);

    dots.exit().remove();

    Voronoi.updateVoronoi(data);
}

Voronoi.updateDots = function(coords) {
    if(coords){
        var data = coords;
    } else {
        var data = []
    }

    d3.selectAll(".dots")[0].forEach(function(d){data.push(d.__data__)})

        dots = svg.selectAll(".dots").data(data);

    dots.attr(dotsAttr);

    dots.enter()
        .append("circle")
        .attr(dotsAttr)
        .classed("dots", true)
        .call(drag);

    dots.exit().remove();

    Voronoi.updateVoronoi(data);
}

Voronoi.updateVoronoi = function(data) {
    // voronoi
    currentVoronoi = voronoiG
        .selectAll(".voronoi")
        .data(myVoronoi(data));


    currentVoronoi
        .classed("hidden", !show.voronoi)
        .attr("d", function(d) {
            if(typeof(d) != 'undefined'){
                return "M" + d.join("L") + "Z"}
        })
    .datum(function(d) {
        if(typeof(d) != 'undefined'){
            return d.point;
        }});

    currentVoronoi.enter()
        .append("path")
        .attr("d", function(d) {
            if(typeof(d) != 'undefined'){
                return "M" + d.join("L") + "Z"}
        })
    .datum(function(d) {
        if(typeof(d) != 'undefined'){
            return d.point;
        }})
    .attr("class", "voronoi")
        .classed("hidden", !show.voronoi);

    currentVoronoi.exit().remove();

    // triangles
    var centerCircles = [];

    myTriangles = triangles
        .selectAll(".triangles")
        .data(myVoronoi.triangles(data));

    myTriangles
        .attr("points", function(d){
            centerCircles.push(findCenters(d)); return d.join(" ")
        })
    .classed("hidden", !show.triangles);

    myTriangles
        .enter()
        .append("polygon")
        .attr("points", function(d){
            centerCircles.push(findCenters(d)); return d.join(" ")
        })
        .attr("class", "triangles")
        .style("fill", function(d){
            return Triangulate.getAverageColor(Voronoi.image, d);
        })
        .classed("hidden", !show.triangles);

    myTriangles.exit().remove();
}

// circumcenter equation from wikipedia: http://en.wikipedia.org/wiki/Circumscribed_circle
function findCenters(d) {
    var a = d[0], b = d[1], c = d[2];
    var k = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    var cx = (smallCalc(a,b[1],c[1]) + smallCalc(b,c[1],a[1]) + smallCalc(c,a[1],b[1])) / k;
    var cy = (smallCalc(a,c[0],b[0]) + smallCalc(b,a[0],c[0]) + smallCalc(c,b[0],a[0])) / k;

    var radius = Math.sqrt(Math.pow(cx - a[0], 2) + Math.pow(cy - a[1], 2));

    return {cx: cx, cy: cy, radius: radius}
}

// little helper so I don't have to write this over and over
function smallCalc(a,b,c){
    return (a[0] * a[0] + a[1] * a[1]) * (b - c);
}

//ON START


