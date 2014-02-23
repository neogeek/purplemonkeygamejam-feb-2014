/*globals window, document, $, SAT */
/*jslint nomen: true */

(function (canvas) {

    'use strict';

    var context = canvas.getContext('2d'),
        data = {},
        activeKeys = { up: false, down: false, left: false, right: false },
        player_settings = { x: 650, y: 160, width: 16, height: 29 },
        current_scene = null,
        ftime = null,
        speed = 0.2,
        map = [],
        explosivePower = 0;

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
            powerups_list = Object.keys(data.powerups.config),
            map_output = [],
            key;

        for (i = 0; i < 2000; i = i + 1) {

            key = enemies_list[random(enemies_list.length - 1)];

            map_output.push({

                sprite: data.enemies,
                key: key,
                x: random(1200),
                y: random(200),
                width: data.enemies.config[key].width,
                height: data.enemies.config[key].height,
                explosivePower: data.enemies.config[key].explosivePower,
                alpha: 100,
                rotate: random(360)

            });

        }

        key = 'dead';

        for (i = 0; i < 100; i = i + 1) {

            map_output.push({

                sprite: data.mario,
                key: key,
                x: random(1200),
                y: random(200),
                width: data.mario.config[key].width,
                height: data.mario.config[key].height,
                explosivePower: 0,
                alpha: 100,
                rotate: random(360)

            });

        }

        map_output.sort(function () { return 0.5 - Math.random(); });

        for (i = 0; i < 10; i = i + 1) {

            key = powerups_list[random(powerups_list.length - 1)];

            map_output.push({

                sprite: data.powerups,
                key: key,
                x: random(1200),
                y: random(200),
                width: data.powerups.config[key].width,
                height: data.powerups.config[key].height,
                explosivePower: data.powerups.config[key].explosivePower,
                alpha: 100,
                rotate: random(360)

            });

        }

        return map_output;

    }

    function scene_level(level) {

        var scene_settings = { _x: 0, _y: 80 },
            mario_settings = { _x: 1800, _y: 116 };

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

                if (!item) { return false; }

                context.save();

                context.translate(item.x, item.y);

                /*
                context.translate(
                    item.sprite.config[item.key].width,
                    item.sprite.config[item.key].height
                );

                context.rotate(item.rotate * Math.PI / 180);

                context.translate(
                    -item.sprite.config[item.key].width,
                    -item.sprite.config[item.key].height
                );
                */

                context.globalAlpha = item.alpha / 100;

                drawSprite(
                    item.sprite,
                    item.key,
                    0,
                    0
                );

                context.restore();

            });

            drawSprite(data.mario, 'climb', player_settings.x, player_settings.y);

            context.restore();

        }

        render_scene();

        return render_scene;

    }

    function testCollision(test, against) {

        var collisions = [],
            collision_test;

        if (!test._SAT) {

            test._SAT = new SAT.Box(new SAT.Vector(test.x, test.y), test.width, test.height).toPolygon();

        } else if (explosivePower) {

            test._SAT = new SAT.Box(new SAT.Vector(test.x - explosivePower / 2, test.y - explosivePower / 2), test.width + explosivePower, test.height + explosivePower).toPolygon();

            $(canvas).animate({ zoom: 1.01 }, 25).animate({ zoom: 1 }, 25);

            setTimeout(function () { explosivePower = 0; }, 50);

        }

        against.forEach(function (item, key) {

            var response = new SAT.Response();

            if (!item) { return false; }

            if (!item._SAT) {

                item._SAT = new SAT.Box(new SAT.Vector(item.x, item.y), item.width, item.height).toPolygon();

            }

            collision_test = SAT.testPolygonPolygon(test._SAT, item._SAT, response);

            if (collision_test) {

                if (Math.abs(response.overlapV.x) > 5 || Math.abs(response.overlapV.y) > 5) {

                    if (explosivePower) {

                        $(item).stop().animate({
                            x: item.x - (test.x - item.x),
                            y: item.y - (test.y - item.y)
                        }, 100, 'easeOutCubic', (function (item) { item._SAT = null; }(item)));

                    } else {

                        $(item).stop().animate({
                            x: item.x - (test.x - item.x) / 5,
                            y: item.y - (test.y - item.y) / 5
                        }, 300, 'linear', (function (item) { item._SAT = null; }(item)));

                    }

                }

                collisions.push(response);

                if (item.explosivePower) {

                    explosivePower = item.explosivePower;

                    against[key] = null;

                }

            }

        });

        return collisions;

    }

    function draw(time) {

        var collisions;

        ftime = time;

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (!explosivePower) {

            if (activeKeys.up) {

                player_settings.y = player_settings.y - speed;

                player_settings._SAT = null;

            } else if (activeKeys.down) {

                player_settings.y = player_settings.y + speed;

                player_settings._SAT = null;

            }

            if (activeKeys.left) {

                player_settings.x = player_settings.x - speed;

                player_settings._SAT = null;

            } else if (activeKeys.right) {

                player_settings.x = player_settings.x + speed;

                player_settings._SAT = null;

            }

        }

        collisions = testCollision(player_settings, map);

        if (collisions.length > 5) {

            speed = 0.2;

        } else {

            speed = 0.5;

        }

        if (!current_scene) {

            current_scene = scene_level(data.level1);

        } else {

            current_scene();

        }

        window.requestAnimationFrame(draw);

    }

    showConsoleHeader('PURPLE MONKEY GAME JAM — FEB 2014');

    data.sprites = loadSprite('images/sprites.png', 'images/sprites.json');
    data.mario = loadSprite('images/mario.png', 'images/mario.json');
    data.enemies = loadSprite('images/enemies.png', 'images/enemies.json');
    data.powerups = loadSprite('images/powerups.png', 'images/powerups.json');
    data.level1 = loadConfig('data/levels/level1.json');

    context.webkitImageSmoothingEnabled = false;

    context.scale(2, 2);

    window.requestAnimationFrame(draw);

    document.addEventListener('keydown', function (e) {

        if ([37, 28, 39, 40].indexOf(e.keyCode) !== -1) {

            e.preventDefault();

        }

        if (e.keyCode === 38) {

            activeKeys.up = true;
            activeKeys.down = false;

        } else if (e.keyCode === 40) {

            activeKeys.down = true;
            activeKeys.up = false;

        }

        if (e.keyCode === 37) {

            activeKeys.left = true;
            activeKeys.right = false;

        } else if (e.keyCode === 39) {

            activeKeys.right = true;
            activeKeys.left = false;

        }

    });

    document.addEventListener('keyup', function (e) {

        if (e.keyCode === 38) {

            activeKeys.up = false;

        } else if (e.keyCode === 40) {

            activeKeys.down = false;

        } else if (e.keyCode === 37) {

            activeKeys.left = false;

        } else if (e.keyCode === 39) {

            activeKeys.right = false;

        }

    });

    window.draw = draw;

}(document.querySelector('.stage')));