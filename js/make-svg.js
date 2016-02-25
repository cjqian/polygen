var MakeSvg = MakeSvg || {};

MakeSvg.appendTriangle = function(svg, triangle){
    svg.append('path')
        .attr('d', function(d) { 
            var x = triangle.start.x;
            var y = triangle.start.y;

            var ax = triangle.relA.x;
            var ay = triangle.relA.y;

            var bx = triangle.relB.x;
            var by = triangle.relB.y;

            var a = 'M ' + x + ' ' + y;
            var b = ' l ' + ax + ' ' + ay;
            var c = ' l ' + bx + ' ' + by;
            var z = ' z';
            var string = a + b + c + z;
            return string;
        })
    .attr('fill', triangle.color);
}

MakeSvg.renderTriangles = function(svg) {

    for (var i = 0; i < triangleList.length; i++){
        MakeSvg.appendTriangle(svg, triangleList[i]);
    }
}

//need to load nodeList
MakeSvg.render = function(){
    var data = { nodes: nodeList, links: linkList };

    var svg = d3.select("body")    
        .append("svg")
        .attr("width", image.width)
        .attr("height", image.height);
    MakeSvg.renderTriangles(svg);

    var drag = d3.behavior.drag()
        .on("drag", function(d,i) {
            d.x += d3.event.dx
            d.y += d3.event.dy
            d3.select(this).attr("cx", d.x).attr("cy",d.y);

            links.each(function(l,li){ 
                if(l.source==i){
                    d3.select(this).attr("x1",d.x).attr("y1",d.y);        
                } else if(l.target==i){
                    d3.select(this).attr("x2",d.x).attr("y2",d.y);
                } 
            });

            MakeSvg.renderTriangles();
        });

    var links  = svg.selectAll("link")    
        //.data(d3.geom.delaunay(nodeList))
        .data(data.links)
        .enter()
        .append("line")
        .attr("class","link")
        .attr("x1",function(l){ 
            var sourceNode = data.nodes.filter(function(d,i){ return i==l.source })[0];
            d3.select(this).attr("y1",sourceNode.y);
            return sourceNode.x
        })
        .attr("x2",function(l){ 
            var targetNode = data.nodes.filter(function(d,i){ return i==l.target })[0];
            d3.select(this).attr("y2",targetNode.y);
            return targetNode.x
        }) 
        .attr("fill","none")
            .attr("stroke", "white");        

    var nodes  = svg.selectAll("node")    
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("class","node")
        .attr("cx",function(d){ return d.x })
        .attr("cy",function(d){ return d.y })
        .attr("r",5)
        .attr("fill", function(d,i){
            return "black";
            //return d.color;
        })

    .call(drag);
}



