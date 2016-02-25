
function addBackdrop(d) {

    var dimensions = d || 50;
    var two = new Two({
        type: Two.Types.canvas,
        width: dimensions,
        height: dimensions
    });

    var r = dimensions / 10;
    var center = dimensions / 2;

    var a = two.makeLine(center - r, center, center + r, center);
    var b = two.makeLine(center, center - r, center, center + r);

    a.stroke = b.stroke = '#aaa';
    a.linewidth = b.linewidth = 0.25;

    two.update();

    _.extend(document.body.style, {
        backgroundImage: 'url(' + two.renderer.domElement.toDataURL() + ')',
                             backgroundRepeat: 'repeat',
                             backgroundSize: dimensions + 'px ' + dimensions + 'px'
                             });

        }


