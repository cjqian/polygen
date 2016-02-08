var s;
var g;
var nodeIdx;

function renderCanvas(img){
    //change the canvas width and height

    //var canvas = document.getElementById("canvas");
    //console.log("a" + canvas.width);
    //canvas.width = img.width;
    //canvas.height = img.height;

    g = { nodes: [], edges: [] };
    nodeIdx = 0;
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


    s = new sigma({ 
        graph: g,
      container: 'canvas-container',
      settings: {
          defaultNodeColor: '#ec5148'
      }
    });

    //possible: overnode, outNode, doubleClickNode, rightClickNode
    s.bind('click', function(e) {
        console.log("a" + e.data.x);
        console.log("b" + sigma.utils.getX(e));

        s.graph.addNode({ id: 'n' + nodeIdx++,
            x: e.data.x,
            y: e.data.y,
            size: 1,
            color: getColorInPhoto(e.data.x, e.data.y, img)});
        console.log(s.graph.nodes());
        //console.log(e.type, e.data.node.label, e.data.captor);
        //var newNode = {id: 'n' + (i++), label: "hello", color: "pink", x: e.data.x, y: e.data.y, size: 5};
        //console.log(newNode);
        //s.graph.nodes().push(newNode);
        //console.log(s.graph.nodes());

        s.refresh();
    });
    /*
     *
     *    s.bind('clickNode', function(e) {
     *        s.graph.dropNode(e.data.node.id);
     *        //console.log(e.type, e.data.node.label, e.data.captor);
     *        //var newNode = {id: 'n' + (i++), label: "hello", color: "pink", x: e.data.x, y: e.data.y, size: 5};
     *        //console.log(newNode);
     *        //s.graph.nodes().push(newNode);
     *        //console.log(s.graph.nodes());
     *
     *        s.refresh();
     *    });
     */
}

function updateTool(selectedTool){
    console.log(selectedTool);
    if (selectedTool == "add-tool"){
        s.bind('click', function(e) {
            console.log("a" + e.data.x);
            console.log("b" + sigma.utils.getX(e));

            s.graph.addNode({ id: 'n' + nodeIdx++,
                x: e.data.x,
                y: e.data.y,
                size: 1});
                //color: getColorInPhoto(e.data.x, e.data.y, img)});
            console.log(s.graph.nodes());
            //console.log(e.type, e.data.node.label, e.data.captor);
            //var newNode = {id: 'n' + (i++), label: "hello", color: "pink", x: e.data.x, y: e.data.y, size: 5};
            //console.log(newNode);
            //s.graph.nodes().push(newNode);
            //console.log(s.graph.nodes());

            s.refresh();
        });
    }
}

function getColorInPhoto(x, y, img){
    return '#eee';
}

function triangulateImage(img){
    for (var i = 0; i < img.width; i++){
        for (var j = 0; j < img.height; j++){
            console.log(raster.getPixel(i, j));
        }
    }
    console.log("HELLO");
}
