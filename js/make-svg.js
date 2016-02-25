var MakeSvg = MakeSvg || {};
//need to load nodeList
MakeSvg.render = function(){
console.log(linkList);
       var data = { nodes: nodeList, links: linkList };

       console.log(data.nodes);
       var svg = d3.select("body")    
       .append("svg")
       .attr("width", image.width)
       .attr("height", image.height);

    //pink for debugging purposes
    svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "pink");

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
    return d.color;
    })
    .call(drag);

//link parser: d3.geom.voronomi().links(vertices);

}
