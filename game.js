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

    function random(num) {

        return Math.floor(Math.random() * num) + 1;

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

    function generate_map() {

        var i,
            enemies_list = Object.keys(data.enemies.config),
            map = [];

        for (i = 0; i < 2000; i = i + 1) {

            map.push({

                key: enemies_list[random(enemies_list.length - 1)],
                x: random(1200),
                y: random(200),
                rotate: random(360)

            });

        }

        return map;

    }

    function scene_level(level) {

        var scene_settings = { _x: 0, _y: 80 },
            mario_settings = { _x: 1800, _y: 116 },
            map = generate_map();

        $('.logo').fadeIn(800).delay(1000).fadeOut(800);

        $(mario_settings).delay(2000).animate({ _x: 2350 }, { duration: 2500, easing: 'linear' });

        $(scene_settings).delay(1000).animate({ _x: -2000 }, 2000, function () {

            canvas.classList.add('depressing');

        });
        $(scene_settings).delay(500).animate({ _y: -144 }, 1000);

        function render_scene() {

            context.save();

            context.translate(scene_settings._x, scene_settings._y);

            drawSpriteSheet(level, data.sprites);

            drawSprite(data.mario, 'run', mario_settings._x, mario_settings._y);

            context.translate(1800, 175);

            map.forEach(function (item) {

                context.save();

                context.translate(item.x, item.y);

                context.translate(
                    data.enemies.config[item.key].width,
                    data.enemies.config[item.key].height
                );

                context.rotate(item.rotate * Math.PI / 180);

                context.translate(
                    -data.enemies.config[item.key].width,
                    -data.enemies.config[item.key].height
                );

                drawSprite(
                    data.enemies,
                    item.key,
                    0,
                    0
                );

                context.restore();

            });

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