var TwoScene = TwoScene || {};

/*

   to do: 

   Add css for p, shapes
   Add mouseover to triangle/circle to show only triangle & circle & show circle's center?
   Add mouseover to polygons to highlight that polygon & its dot?
   */


var width, height, endOfLastDrag, svg;
var myTwoScene;
var voronoiG, triangles;
var show;
TwoScene.image;

var dotsAttr, drag;
var addMode = true;

TwoScene.initCanvas = function(image){
console.log(image);
    TwoScene.image = image;
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
            TwoScene.updateDot(d3.mouse(this))
        }
    }); 

    myTwoScene = d3.geom.voronoi()
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


    d3.select("#add-mode-on")
        .on("change", function() {
            addMode = !addMode;

            if (addMode){
                svg.on("click", function(){
                    // ignore click if it just happened
                    if(Date.now() - endOfLastDrag > 500){
                        TwoScene.updateDot(d3.mouse(this))
                    }
                })

            } else {
                svg.on("click", function(){

                });
                //update the handlers
                d3.selectAll(".dots").on("dblclick", function(){
                    var x = this.cx.animVal.value;
                    var y = this.cy.animVal.value;

                    var curNode = [];
                    curNode.push(x);
                    curNode.push(y);

                    TwoScene.removeDot(curNode);
                });

            }
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

            TwoScene.updateDot();

        endOfLastDrag = Date.now();
    }
}

TwoScene.removeDot = function(coord) {
    var data = [];

    d3.selectAll(".dots")[0].forEach(function(d){
        if (d.cx.animVal.value != coord[0] && d.cy.animVal.value != coord[1])
        data.push(d.__data__)});

    dots = svg.selectAll(".dots").data(data);

    dots.attr(dotsAttr);

    TwoScene.updateTwoScene(data);
}


TwoScene.updateDot = function(coord) {
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

    TwoScene.updateTwoScene(data);
}

TwoScene.toObjPoint = function(point){
    return {"x": point[0], "y": point[1]};
}

TwoScene.toFlatPoint = function(point){
    return [point.x, point.y];
}

TwoScene.toFlatArray = function(coords){
    var data = [];

    for (var i = 0; i < coords.length; i++){
        data.push(TwoScene.toFlatPoint(coords[i]));
    }

    return data;
}

TwoScene.updateDots = function(coords) {
    if(coords){
        var data = TwoScene.toFlatArray(coords);
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

    TwoScene.updateTwoScene(data);
}

TwoScene.updateTwoScene = function(data) {
    // voronoi
    currentTwoScene = voronoiG
        .selectAll(".voronoi")
        .data(myTwoScene(data));

    currentTwoScene
        .classed("hidden", !show.voronoi)
        .attr("d", function(d) {
            if(typeof(d) != 'undefined'){
                return "M" + d.join("L") + "Z"}
        })
    .style("fill", "pink")
        .datum(function(d) {
            if(typeof(d) != 'undefined'){
                return d.point;
            }});

    currentTwoScene.enter()
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

    currentTwoScene.exit().remove();

    // triangles
    var centerCircles = [];

    myTriangles = triangles
        .selectAll(".triangles")
        .data(myTwoScene.triangles(data));

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
            var color = Triangulate.getColorOfFace(TwoScene.toObjPoint(d[0]),
                TwoScene.toObjPoint(d[1]), 
                TwoScene.toObjPoint(d[2]));
            console.log(color);
            return color;
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


