function renderCanvas(img){
    //change the canvas width and height

    //var canvas = document.getElementById("canvas");
    //console.log("a" + canvas.width);
    //canvas.width = img.width;
    //canvas.height = img.height;

    var g = { nodes: [], edges: [] };
    var nodeIdx = 0;
    g.nodes.push({ id: 'n' + nodeIdx++,
        x: 0,
        y:  0,
        size: 1,
        color: "black"});
    g.nodes.push({ id: 'n' + nodeIdx++,
        x: img.width,
        y: 0,
        size: 1,
        color: "black"});
    g.nodes.push({ id: 'n' + nodeIdx++,
        x: 0,
        y: img.height,
        size: 1,
        color: "black"});

    g.nodes.push({ id: 'n' + nodeIdx++,
        x: img.width,
        y:  img.height,
        size: 1,
        color: "black"});
    document.getElementById("canvas-container").style.width = img.width + "px";
    document.getElementById("canvas-container").style.height = img.height + "px";


    var s = new sigma({ 
        graph: g,
        container: 'canvas-container',
        settings: {
            defaultNodeColor: '#ec5148'
        }
    });

    //possible: overnode, outNode, doubleClickNode, rightClickNode
    s.bind('click', function(e) {
        console.log(e.data.x);
        s.graph.addNode({ id: 'n' + nodeIdx++,
            x: e.data.x,
            y: e.data.y,
            size: 1,
            color: "black"});
        console.log(s.graph.nodes());
        //console.log(e.type, e.data.node.label, e.data.captor);
        //var newNode = {id: 'n' + (i++), label: "hello", color: "pink", x: e.data.x, y: e.data.y, size: 5};
        //console.log(newNode);
        //s.graph.nodes().push(newNode);
        //console.log(s.graph.nodes());

        s.refresh();
    });

    s.bind('rightClick', function(e) {
        s.graph.dropNode(getIdFromCoordinates(e.data.x, e.data.y));
        //console.log(e.type, e.data.node.label, e.data.captor);
        //var newNode = {id: 'n' + (i++), label: "hello", color: "pink", x: e.data.x, y: e.data.y, size: 5};
        //console.log(newNode);
        //s.graph.nodes().push(newNode);
        //console.log(s.graph.nodes());

        s.refresh();
    });
i
    function getIdFromCoordinates(x, y){
        for (var i = 0; i < s.graph.nodes().length; i++){
            if (s.graph.nodes()[i].x == x && 
                s.graph.nodes()[i].y == y) return s.graph.nodes()[i].id;
        }
    
        return -1;
    }
    console.log("rendering canvas");
}

function triangulateImage(img){
    for (var i = 0; i < img.width; i++){
        for (var j = 0; j < img.height; j++){
            console.log(raster.getPixel(i, j));
        }
    }
    console.log("HELLO");
}
