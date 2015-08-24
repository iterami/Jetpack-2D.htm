'use strict';

function draw(){
    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    // Draw corridor over grey background.
    buffer.fillStyle = '#000';
    buffer.fillRect(
      0,
      y - settings['corridor-height'] / 2,
      width,
      settings['corridor-height']
    );

    // Draw player body.
    buffer.fillStyle = settings['color'];
    buffer.fillRect(
      x,
      y - player['y'] - 25,
      25,
      50
    );

    // Draw jetpack.
    buffer.fillStyle = '#aaa';
    buffer.fillRect(
      x - 25,
      y - player['y'] - 15,
      25,
      20
    );

    // Draw activated jetpack fire.
    if(game_running
      && key_jetpack){
        buffer.fillStyle = '#f00';
        buffer.fillRect(
          x - 22,
          y - player['y'] + 5,
          18,
          10
        );
    }

    // Draw obstacles.
    buffer.fillStyle = '#555';
    for(var obstacle in obstacles){
        buffer.fillRect(
          obstacles[obstacle]['x'] + x,
          obstacles[obstacle]['y'] + y,
          obstacles[obstacle]['width'] * 2,
          obstacles[obstacle]['height'] * 2
        );
    }

    // Draw smoke trails behind the player.
    buffer.fillStyle = '#777';
    for(var id in smoke){
        buffer.fillRect(
          x + smoke[id]['x'],
          y - smoke[id]['y'],
          10,
          10
        );
    }

    // Setup text display.
    buffer.font = '23pt sans-serif';
    buffer.fillStyle = '#fff';

    // If game is over, display game over messages.
    if(!game_running){
        if(!played_explosion_sound){
            if(settings['audio-volume'] > 0){
                // play_audio('explosion');
            }
            played_explosion_sound = true;
        }

        if(frame_counter > best){
            buffer.fillText(
              'NEW BEST SCORE!',
              5,
              height - 100
            );
        }
        buffer.fillText(
          'You crashed... ☹',
          5,
          height - 70
        );
        buffer.fillText(
          settings['restart-key'] + ' = Restart',
          5,
          height - 40
        );
        buffer.fillText(
          'ESC = Main Menu',
          5,
          height - 10
        );
    }

    // Top frame counter and best text displays.
    buffer.fillText(
      frame_counter,
      5,
      25
    );
    buffer.fillText(
      best,
      5,
      50
    );

    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );

    animationFrame = window.requestAnimationFrame(draw);
}

function logic(){
    // Check if player is outside of game boundaries.
    if(player['y'] + 25 > settings['corridor-height'] / 2
      || player['y'] - 25 < -settings['corridor-height'] / 2){
        game_running = false;
        update_best();
    }

    if(!game_running){
        return;
    }

    frame_counter += 1;

    // If new obstacle should be added this frame, add one.
    if(frame_counter % frames_per_obstacle === 0){
        var obstacle_width = Math.floor(Math.random() * 15) + 20;
        obstacles.push({
          'height': Math.floor(Math.random() * 15) + 20,
          'width': obstacle_width,
          'x': x + obstacle_width,
          'y': Math.floor(Math.random() * settings['corridor-height'])
            - settings['corridor-height'] / 2,
        });
    }

    // If obstacle frequency increase should happen this frame, do it.
    if(settings['obstacle-frequency'] > 0
      && frames_per_obstacle > 1
      && frame_counter % settings['obstacle-increase'] === 0){
        // obstacle frequency increase
        frames_per_obstacle -= 1;
    }

    // If the player has activated jetpack, increase y speed and add smoke...
    if(key_jetpack){
        player['speed'] += settings['jetpack-power'];
        smoke.push({
          'x': -20,
          'y': player['y'] - 10,
        });

    // ...else apply gravity.
    }else{
        player['speed'] -= settings['gravity'];
    }

    player['y'] += player['speed'];

    for(var obstacle in obstacles){
        // Delete obstacles that are past left side of screen.
        if(obstacles[obstacle]['x'] < -x - 70){
            obstacles.splice(
              obstacle,
              1
            );
            continue;
        }

        // Move obstacles left at speed.
        obstacles[obstacle]['x'] -= settings['speed'];

        // Check for player collision with obstacle.
        if(obstacles[obstacle]['x'] <= -obstacles[obstacle]['width'] * 2
          || obstacles[obstacle]['x'] >= obstacles[obstacle]['width']
          || obstacles[obstacle]['y'] <= -player['y'] - 25 - obstacles[obstacle]['height'] * 2
          || obstacles[obstacle]['y'] >= -player['y'] + 25){
            continue;
        }

        game_running = false;
        update_best();
    }

    // Delete smoke trails past left side of screen.
    for(var id in smoke){
        smoke[id]['x'] -= settings['speed'];

        if(smoke[id]['x'] < -x){
            smoke.splice(
              id,
              1
            );
        }
    }
}

function play_audio(id){
    if(settings['audio-volume'] <= 0){
        return;
    }

    document.getElementById(id).currentTime = 0;
    document.getElementById(id).play();
}

function reset(){
    if(!window.confirm('Reset settings?')){
        return;
    }

    document.getElementById('audio-volume').value = 1;
    document.getElementById('color').value = '#009900';
    document.getElementById('corridor-height').value = 500;
    document.getElementById('gravity').value = 1;
    document.getElementById('jetpack-key').value = 'W';
    document.getElementById('jetpack-power').value = 2;
    document.getElementById('ms-per-frame').value = 30;
    document.getElementById('obstacle-frequency').value = 23;
    document.getElementById('obstacle-increase').value = 115;
    document.getElementById('restart-key').value = 'H';
    document.getElementById('speed').value = 10;

    save();
}

function reset_best(){
    if(!window.confirm('Reset best?')){
        return;
    }

    best = 0;
    frame_counter = 0;
    update_best();
    setmode(
      0,
      true
    );
}

function resize(){
    if(mode <= 0){
        return;
    }

    height = window.innerHeight;
    document.getElementById('buffer').height = height;
    document.getElementById('canvas').height = height;
    y = height / 2;

    width = window.innerWidth;
    document.getElementById('buffer').width = width;
    document.getElementById('canvas').width = width;
    x = width / 2;
}

// Save settings into window.localStorage if they differ from default.
function save(){
    if(document.getElementById('audio-volume').value == 1){
        window.localStorage.removeItem('Jetpack-2D.htm-audio-volume');
        settings['audio-volume'] = 1;

    }else{
        settings['audio-volume'] = parseFloat(document.getElementById('audio-volume').value);
        window.localStorage.setItem(
          'Jetpack-2D.htm-audio-volume',
          settings['audio-volume']
        );
    }

    var ids = {
      'color': '#009900',
      'jetpack-key': 'W',
      'restart-key': 'H',
    };
    for(var id in ids){
        if(document.getElementById(id).value === ids[id]){
            window.localStorage.removeItem('Jetpack-2D.htm-' + id);
            settings[id] = ids[id];

        }else{
            settings[id] = document.getElementById(id).value;
            window.localStorage.setItem(
              'Jetpack-2D.htm-' + id,
              settings[id]
            );
        }
    }

    ids = {
      'corridor-height': 500,
      'gravity': 1,
      'jetpack-power': 2,
      'ms-per-frame': 30,
      'obstacle-frequency': 23,
      'obstacle-increase': 115,
      'speed': 10,
    };
    for(id in ids){
        if(document.getElementById(id).value == ids[id]
          || isNaN(document.getElementById(id).value)){
            window.localStorage.removeItem('Jetpack-2D.htm-' + id);
            settings[id] = ids[id];

        }else{
            settings[id] = parseInt(document.getElementById(id).value);
            window.localStorage.setItem(
              'Jetpack-2D.htm-' + id,
              settings[id]
            );
        }
    }
}

function setmode(newmode, newgame){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    obstacles = [];
    smoke = [];
    mode = newmode;

    // Play game mode.
    if(mode > 0){
        if(newgame){
            save();
        }

        frame_counter = 0;
        frames_per_obstacle = settings['obstacle-frequency'];
        game_running = true;
        played_explosion_sound = false;
        player = {
          'speed': 0,
          'y': 0,
        };

        if(newgame){
            document.getElementById('page').innerHTML =
              '<canvas id=canvas></canvas><canvas id=buffer></canvas>';

            buffer = document.getElementById('buffer').getContext('2d', {
              'alpha': false,
            });
            canvas = document.getElementById('canvas').getContext('2d');

            resize();
        }

        animationFrame = window.requestAnimationFrame(draw);
        interval = window.setInterval(
          'logic()',
          settings['ms-per-frame']
        );

        return;
    }

    // Main menu mode.
    buffer = 0;
    canvas = 0;

    document.getElementById('page').innerHTML = '<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><a onclick="setmode(1, true)">Cave Corridor</a></div><hr><div class=c>Best: '
      + best
      + '<br><a onclick=reset_best()>Reset Best</a></div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c>Jetpack:<ul><li><input disabled value=Click>Activate<li><input id=jetpack-key maxlength=1 value='
      + settings['jetpack-key'] + '>Activate</ul><input disabled value=ESC>Main Menu<br><input id=restart-key maxlength=1 value='
      + settings['restart-key'] + '>Restart</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
      + settings['audio-volume'] + '>Audio<br><input id=color type=color value='
      + settings['color'] + '>Color<br><input id=corridor-height value='
      + settings['corridor-height'] + '>Corridor Height<br><input id=gravity value='
      + settings['gravity'] + '>Gravity<br>Jetpack:<ul><li><input id=jetpack-power value='
      + settings['jetpack-power'] + '>Power<li><input id=speed value='
      + settings['speed'] + '>Speed</ul><input id=ms-per-frame value='
      + settings['ms-per-frame'] + '>ms/Frame<br>Obstacle:<ul><li><input id=obstacle-frequency value='
      + settings['obstacle-frequency'] + '>Frequency<li><input id=obstacle-increase value='
      + settings['obstacle-increase'] + '>Increase</ul><a onclick=reset()>Reset Settings</a></div></div>';
}

function update_best(){
    if(frame_counter > best){
        best = frame_counter;
    }

    if(best > 0){
        window.localStorage.setItem(
          'Jetpack-2D.htm-best',
          best
        );

    }else{
        window.localStorage.removeItem('Jetpack-2D.htm-best');
    }
}

var animationFrame = 0;
var best = parseInt(window.localStorage.getItem('Jetpack-2D.htm-best')) || 0;
var buffer = 0;
var canvas = 0;
var frame_counter = 0;
var frames_per_obstacle = 0;
var game_running = false;
var height = 0;
var interval = 0;
var key_jetpack = false;
var mode = 0;
var obstacles = [];
var played_explosion_sound = false;
var player = {};
var settings = {
  'audio-volume': window.localStorage.getItem('Jetpack-2D.htm-audio-volume') != null
    ? parseFloat(window.localStorage.getItem('Jetpack-2D.htm-audio-volume'))
    : 1,
  'color': window.localStorage.getItem('Jetpack-2D.htm-color') || '#009900',
  'corridor-height': window.localStorage.getItem('Jetpack-2D.htm-corridor-height') || 500,
  'gravity': window.localStorage.getItem('Jetpack-2D.htm-gravity') != null
    ? parseFloat(window.localStorage.getItem('Jetpack-2D.htm-gravity'))
    : 1,
  'jetpack-key': window.localStorage.getItem('Jetpack-2D.htm-jetpack-key') || 'W',
  'jetpack-power': window.localStorage.getItem('Jetpack-2D.htm-jetpack-power') != null
    ? parseFloat(window.localStorage.getItem('Jetpack-2D.htm-jetpack-power'))
    : 2,
  'ms-per-frame': parseInt(window.localStorage.getItem('Jetpack-2D.htm-ms-per-frame')) || 30,
  'obstacle-frequency': parseInt(window.localStorage.getItem('Jetpack-2D.htm-obstacle-frequency')) || 23,
  'obstacle-increase': parseInt(window.localStorage.getItem('Jetpack-2D.htm-obstacle-increase')) || 115,
  'restart-key': window.localStorage.getItem('Jetpack-2D.htm-restart-key') || 'H',
  'speed': parseFloat(window.localStorage.getItem('Jetpack-2D.htm-speed')) || 10,
};
var smoke = [];
var width = 0;
var x = 0;
var y = 0;

window.onkeydown = function(e){
    if(mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    // ESC: update best and return to main menu.
    if(key === 27){
        update_best();
        setmode(
          0,
          true
        );
        return;
    }
        
    key = String.fromCharCode(key);

    if(key === settings['jetpack-key']){
        key_jetpack = true;

    }else if(key === settings['restart-key']){
        update_best();
        setmode(
          1,
          false
        );
    }
};

window.onkeyup = function(e){
    var key = String.fromCharCode(e.keyCode || e.which);

    if(key === settings['jetpack-key']){
        key_jetpack = false;
    }
};

window.onload = function(e){
    setmode(
      0,
      true
    );
};

window.onmousedown
  = window.ontouchstart = function(e){
    if(mode <= 0){
        return;
    }

    e.preventDefault();
    key_jetpack = true;
};

window.onmouseup
  = window.ontouchend = function(e){
    key_jetpack = false;
};

window.onresize = resize;
