/*globals window, document, $ */
/*jslint nomen: true */

(function (canvas) {

    'use strict';

    var context = canvas.getContext('2d'),
        data = {},
        current_scene = null,
        ftime = null;

    function isArray(obj) {

        return Object.prototype.toString.call(obj) === '[object Array]' ? true : false;

    }

    function showConsoleHeader(text) {

        console.log(
            '%c %c %c ' + text + ' %c %c ',
            'font-size: 1.5em; background: #f0f;',
            'font-size: 1.5em; background: #f0c;',
            'font-size: 1.5em; background: #f0a; color: #fff;',
            'font-size: 1.5em; background: #f0c;',
            'font-size: 1.5em; background: #f0f;'
        );

    }

    function loadConfig(file) {

        var http = new window.XMLHttpRequest();

        http.open('get', file, false);

        http.send();

        return JSON.parse(http.responseText);

    }

    function loadImage(image) {

        var img = document.createElement('img');

        img.src = image;

        return img;

    }

    function loadSprite(image, config) {

        return {
            image: loadImage(image),
            config: loadConfig(config)
        };

    }

    function drawSprite(sprite, name, x, y, width, height) {

        var frame = sprite.config[name];

        if (sprite.config[name].hasOwnProperty('frames')) {

            if (!sprite.config[name].hasOwnProperty('currentFrame')) {

                sprite.config[name].currentFrame = 0;

            } else if (sprite.config[name].currentFrame >= sprite.config[name].frames.length) {

                sprite.config[name].currentFrame = 0;

            }

            frame = frame.frames[sprite.config[name].currentFrame];

            if (!sprite.config[name].ftime || ftime - sprite.config[name].ftime > 120) {

                sprite.config[name].ftime = ftime;

                sprite.config[name].currentFrame = sprite.config[name].currentFrame + 1;

            }

        }

        if (!width) {

            width = frame.width;

        }

        if (!height) {

            height = frame.height;

        }

        context.drawImage(
            sprite.image,
            frame.x,
            frame.y,
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
                width = value.width || null,
                height = value.height || null,
                tileX = 0,
                tileY = 0,
                tileX_length = value.tileX || 1,
                tileY_length = value.tileY || 1,
                tileWidth = sprites.config[value.name].width,
                tileHeight = sprites.config[value.name].height;

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
                        x + (tileX * tileWidth),
                        y + (tileY * tileHeight),
                        width,
                        height
                    );

                }

            }

            context.restore();

        });

    }

    function scene_level(level) {

        var scene_settings = { _x: 0, _y: 80 },
            mario_settings = { _x: 1800 },
            enemies_list = Object.keys(data.enemies);

        $(mario_settings).delay(2000).animate({ _x: 2350 }, 2500, 'linear');

        $(scene_settings).delay(1000).animate({ _x: -2000 }, 2000, function () {

            canvas.classList.add('depressing');

            $('.logo').delay(600).fadeIn(500).delay(1000).fadeOut(500);

        });
        $(scene_settings).delay(300).animate({ _y: -144 }, 1000);

        function render_scene() {

            context.save();

            context.translate(scene_settings._x, scene_settings._y);

            drawSpriteSheet(level, data.sprites);

            drawSprite(data.mario, 'run', mario_settings._x, 116);

            context.translate(2000, 180);



            drawSprite(data.enemies, 'koopa_red_1', 0, 0);

            context.restore();

        }

        render_scene();

        return render_scene;

    }

    function draw(time) {

        ftime = time;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();

        context.scale(2, 2);

        if (!current_scene) {

            current_scene = scene_level(data.level1);

        } else {

            current_scene();

        }

        context.restore();

        window.requestAnimationFrame(draw);

    }

    showConsoleHeader('PURPLE MONKEY GAME JAM — FEB 2014');

    data.sprites = loadSprite('images/sprites.png', 'images/sprites.json');
    data.mario = loadSprite('images/mario.png', 'images/mario.json');
    data.enemies = loadSprite('images/enemies.png', 'images/enemies.json');
    data.level1 = loadConfig('data/levels/level1.json');

    context.webkitImageSmoothingEnabled = false;

    window.requestAnimationFrame(draw);

}(document.querySelector('.stage')));