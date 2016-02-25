var MakeSvg = MakeSvg || {};

//we assume a global svg
var svg;

MakeSvg.appendTriangle = function(triangle){
    svg.append('path')
        .attr('d', function(d) { 
            return Triangulate.getSvgStringFromTriangle(triangle);
        })
    .attr('fill', triangle.color)
        .attr('class', triangle.class);
}

//update the triangles touching node index i
MakeSvg.updateTriangles = function(i){
    var triangles = svg.selectAll(".t" + i)[0];
    for (var i = 0; i < triangles.length; i++){
        var curTriangle = triangles[i];
        var dStr = Triangulate.updateTriangleSvgString(curTriangle);
        curTriangle.setAttribute('d', dStr);
    }
}

MakeSvg.addSvg = function(){
    svg = d3.select("body")    
        .append("svg")
        .attr("width", image.width)
        .attr("height", image.height);
}

//need to load nodeList
MakeSvg.render = function(){
    var data = { nodes: nodeList, links: linkList };

    MakeSvg.addSvg();

    for (var i = 0; i < triangleList.length; i++){
        MakeSvg.appendTriangle(triangleList[i]);
    }


    var drag = d3.behavior.drag()
        .on("drag", function(d,i) {
            MakeSvg.updateTriangles(i);

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

        });

    var links  = svg.selectAll("link")    
        //.data(d3.geom.delaunay(nodeList))
        .data(data.links)
        .enter()
        .append("line")
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
    .attr("class", function(l){
        return "link " + l.class;
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
        .attr("id", function(d){ return d.id })
        .attr("fill", function(d,i){
            return "black";
            //return d.color;
        })

    .call(drag);
}



