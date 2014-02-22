/*globals window, document, $ */
/*jslint nomen: true */

(function (canvas) {

    'use strict';

    var context = canvas.getContext('2d'),
        data = {},
        current_scene = null;

    function isArray(obj) {

        return Object.prototype.toString.call(obj) === '[object Array]' ? true : false;

    }

    function loadConfig(file) {

        var http = new window.XMLHttpRequest();

        http.open('get', file, false);

        http.send();

        return JSON.parse(http.responseText);

    }

    function loadSprite(image, config) {

        var img = document.createElement('img');

        img.src = image;

        return {
            image: img,
            config: loadConfig(config)
        };

    }

    function drawSprite(sprite, name, x, y, width, height) {

        context.drawImage(
            sprite.image,
            sprite.config[name].x,
            sprite.config[name].y,
            width,
            height,
            x,
            y,
            width,
            height
        );

    }

    function drawSpriteSheet(data, sprites) {

        data.forEach(function (value) {

            var x = value.x,
                y = value.y,
                width = value.width || sprites.config[value.name].width,
                height = value.height || sprites.config[value.name].height,
                tileX = 0,
                tileY = 0,
                tileX_length = value.tileX || 1,
                tileY_length = value.tileY || 1;

            if (isArray(x)) {

                x = x.reduce(function (a, b) { return a * b; });

            }

            if (isArray(y)) {

                y = y.reduce(function (a, b) { return a * b; });

            }

            context.save();

            if (value.anchor === 'bottom') {

                context.translate(0, -height);

            }

            for (tileX = 0; tileX < tileX_length; tileX = tileX + 1) {

                for (tileY = 0; tileY < tileY_length; tileY = tileY + 1) {

                    drawSprite(
                        sprites,
                        value.name,
                        x + (tileX * width),
                        y + (tileY * height),
                        width,
                        height
                    );

                }

            }

            context.restore();

        });

    }

    function scene_level(level) {

        var scene_offset = { _x: 0, _y: 80 };

        $(scene_offset).delay(1000).animate({ _x: -2000 }, 2000, function () {

            canvas.classList.add('depressing');

        });
        $(scene_offset).delay(300).animate({ _y: -144 }, 1000);

        function render_scene() {

            context.translate(scene_offset._x, scene_offset._y);

            drawSpriteSheet(level, data.sprites);

        }

        render_scene();

        return render_scene;

    }

    function draw() {

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();

        context.scale(2, 2);

        if (!current_scene) {

            current_scene = scene_level(data.level1);

        }

        current_scene();

        context.restore();

        window.requestAnimationFrame(draw);

    }

    data.sprites = loadSprite('images/sprites.png', 'images/sprites.json');
    data.level1 = loadConfig('data/levels/level1.json');

    context.webkitImageSmoothingEnabled = false;

    window.requestAnimationFrame(draw);

}(document.querySelector('canvas')));