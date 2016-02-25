function addInteractivity(shape) {

    var offset = shape.parent.translation;

    var drag = function(e) {
        e.preventDefault();
        var x = e.clientX - offset.x;
        var y = e.clientY - offset.y;
        shape.translation.set(x, y);
    };
    var touchDrag = function(e) {
        e.preventDefault();
        var touch = e.originalEvent.changedTouches[0];
        drag({
            preventDefault: _.identity,
            clientX: touch.pageX,
            clientY: touch.pageY
        });
        return false;
    };
    var dragEnd = function(e) {
        e.preventDefault();
        $window
            .unbind('mousemove', drag)
            .unbind('mouseup', dragEnd);
    };
    var touchEnd = function(e) {
        e.preventDefault();
        $(window)
            .unbind('touchmove', touchDrag)
            .unbind('touchend', touchEnd);
        return false;
    };

    $(shape._renderer.elem)
        .css({
            cursor: 'pointer'
        })
    .bind('mousedown', function(e) {
        e.preventDefault();
        $window
        .bind('mousemove', drag)
        .bind('mouseup', dragEnd);
    })
    .bind('touchstart', function(e) {
        e.preventDefault();
        $(window)
        .bind('touchmove', touchDrag)
        .bind('touchend', touchEnd);
    return false;
    });

}

