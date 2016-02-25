$(function() {

    addBackdrop(50);

    var $window = $(window);
    var radius = 40, editColor = 'rgb(79, 128, 255)';
    var type = 'svg';
    var two = new Two({
        type: Two.Types[type],
        fullscreen: true,
        autostart: true
    }).appendTo(document.body);

    var letter = two.interpret(document.querySelector('.assets svg'));
    letter.linewidth = radius;
    letter.cap = letter.join = 'round';
    letter.noFill().stroke = '#333';

    var resize = function() {
        var cx = two.width / 2;
        var cy = two.height / 2;
        var rect = letter.getBoundingClientRect();
        letter.translation.set(cx - rect.width / 2, cy - rect.height / 2);
    };
    two.bind('resize', resize);
    resize();

    _.each(letter.children, function(polygon) {
        _.each(polygon.vertices, function(anchor) {

            var p = two.makeCircle(0, 0, radius / 4);
            var l = two.makeCircle(0, 0, radius / 4);
            var r = two.makeCircle(0, 0, radius / 4);

            p.translation.copy(anchor);
            l.translation.copy(anchor.controls.left).addSelf(anchor);
            r.translation.copy(anchor.controls.right).addSelf(anchor);
            p.noStroke().fill = l.noStroke().fill = r.noStroke().fill = editColor;

            var ll = new Two.Path([
                new Two.Anchor().copy(p.translation),
                new Two.Anchor().copy(l.translation)
                ]);
            var rl = new Two.Path([
                new Two.Anchor().copy(p.translation),
                new Two.Anchor().copy(r.translation)
                ]);
            rl.noFill().stroke = ll.noFill().stroke = editColor;

            letter.add(rl, ll, p, l, r);

            p.translation.bind(Two.Events.change, function() {
                anchor.copy(this);
                l.translation.copy(anchor.controls.left).addSelf(this);
                r.translation.copy(anchor.controls.right).addSelf(this);
                ll.vertices[0].copy(this);
                rl.vertices[0].copy(this);
                ll.vertices[1].copy(l.translation);
                rl.vertices[1].copy(r.translation);
            });
            l.translation.bind(Two.Events.change, function() {
                anchor.controls.left.copy(this).subSelf(anchor);
                ll.vertices[1].copy(this);
            });
            r.translation.bind(Two.Events.change, function() {
                anchor.controls.right.copy(this).subSelf(anchor);
                rl.vertices[1].copy(this);
            });

            // Update the renderer in order to generate the actual elements.
            two.update();

            // Add Interactivity
            addInteractivity(p);
            addInteractivity(l);
            addInteractivity(r);

        });

    });

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

});

