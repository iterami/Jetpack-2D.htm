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
      y - 250,
      width,
      500
    );

    // Draw player body.
    buffer.fillStyle = settings['color'];
    buffer.fillRect(
      x,
      y - player_y - 25,
      25,
      50
    );

    // Draw jetpack.
    buffer.fillStyle = '#aaa';
    buffer.fillRect(
      x - 25,
      y - player_y - 15,
      25,
      20
    );

    // Draw activated jetpack fire.
    if(game_running
      && key_jetpack){
        buffer.fillStyle = '#f00';
        buffer.fillRect(
          x - 22,
          y - player_y + 5,
          18,
          10
        );
    }

    // Draw obstacles.
    buffer.fillStyle = '#555';
    for(var obstacle in obstacles){
        buffer.fillRect(
          x + obstacles[obstacle][0],
          y + obstacles[obstacle][1],
          obstacles[obstacle][2] * 2,
          obstacles[obstacle][3] * 2
        );
    }

    // Draw smoke trails behind the player.
    buffer.fillStyle = '#777';
    for(var id in smoke){
        buffer.fillRect(
          x + smoke[id][0],
          y - smoke[id][1],
          10,
          10
        );
    }

    // Setup text display.
    buffer.font = '23pt sans-serif';
    buffer.textAlign = 'left';
    buffer.textBaseline = 'top';
    buffer.fillStyle = '#fff';

    // If game is over, display game over messages.
    if(!game_running){
        if(!played_explosion_sound){
            if(settings['audio-volume'] > 0){
                // play_audio('explosion');
            }
            played_explosion_sound = true;
        }

        if(frames > best){
            buffer.fillText(
              'NEW BEST SCORE!',
              5,
              height - 125
            );
        }
        buffer.fillText(
          'You crashed... ☹',
          5,
          height - 95
        );
        buffer.fillText(
          settings['restart-key'] + ' = Restart',
          5,
          height - 65
        );
        buffer.fillText(
          'ESC = Main Menu',
          5,
          height - 35
        );
    }

    // Top frame counter and best text displays.
    buffer.fillText(
      frames,
      5,
      0
    );
    buffer.fillText(
      best,
      5,
      32
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
    if(player_y + 25 > 250
      || player_y - 25 < -250){
        game_running = false;
        update_best();
    }

    if(!game_running){
        return;
    }

    frames += 1;

    // If new obstacle should be added this frame, add one.
    if(frames % frames_per_obstacle === 0){
        var obstalce_width = Math.floor(Math.random() * 15) + 20;
        obstacles.splice(
          0,
          0,
          [
            x + obstalce_width,
            Math.floor(Math.random() * 500) - 250,
            obstalce_width,
            Math.floor(Math.random() * 15) + 20,
          ]
        );
    }

    // If obstacle frequency increase should happen this frame, do it.
    if(settings['obstacle-frequency'] > 0
      && frames_per_obstacle > 1
      && frames % settings['obstacle-increase'] === 0){
        // obstacle frequency increase
        frames_per_obstacle -= 1;
    }

    // If the player has activated jetpack, increase y speed and add smoke...
    if(key_jetpack){
        player_speed += settings['jetpack-power'];
        smoke.splice(
          0,
          0,
          [
            -20,
            player_y - 10,
          ]
        );

    // ...else apply gravity.
    }else{
        player_speed -= settings['gravity'];
    }

    player_y += player_speed;

    for(var obstacle in obstacles){
        // Delete obstacles that are past left side of screen.
        if(obstacles[obstacle][0] < -x - 70){
            delete obstacles[obstacle];
            continue;
        }

        // Move obstacles left at speed.
        obstacles[obstacle][0] -= settings['speed'];

        // Check for player collision with obstacle.
        if(obstacles[obstacle][0] <= -obstacles[obstacle][2] * 2
          || obstacles[obstacle][0] >= obstacles[obstacle][2]
          || obstacles[obstacle][1] <= -player_y - 25 - obstacles[obstacle][3] * 2
          || obstacles[obstacle][1] >= -player_y + 25){
            continue;
        }

        game_running = false;
        update_best();
    }

    // Delete smoke trails past left side of screen.
    for(var id in smoke){
        smoke[id][0] -= settings['speed'];

        if(smoke[id][0] < -x){
            delete smoke[id];
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
    if(!confirm('Reset settings?')){
        return;
    }

    document.getElementById('audio-volume').value = 1;
    document.getElementById('color').value = '#009900';
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
    if(!confirm('Reset best?')){
        return;
    }

    best = 0;
    frames = 0;
    update_best();
    setmode(0);
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
        window.localStorage.removeItem('Jetpack.htm-audio-volume');
        settings['audio-volume'] = 1;

    }else{
        settings['audio-volume'] = parseFloat(document.getElementById('audio-volume').value);
        window.localStorage.setItem(
          'Jetpack.htm-audio-volume',
          settings['audio-volume']
        );
    }

    var ids = {
      'color': '#009900',
      'jetpack-key': 'W',
      'restart-key': 'H',
    };
    for(var id in ids){
        if(document.getElementById(id).value == ids[id]){
            window.localStorage.removeItem('Jetpack.htm-' + id);
            settings[id] = ids[id];

        }else{
            settings[id] = document.getElementById(id).value;
            window.localStorage.setItem(
              'Jetpack.htm-' + id,
              settings[id]
            );
        }
    }

    if(document.getElementById('gravity').value == 1
      || isNaN(document.getElementById('gravity').value)
      || document.getElementById('gravity').value < 1){
        window.localStorage.removeItem('Jetpack.htm-gravity');
        settings['gravity'] = 1;

    }else{
        settings['gravity'] = parseInt(document.getElementById('gravity').value);
        window.localStorage.setItem(
          'Jetpack.htm-gravity',
          settings['gravity']
        );
    }

    if(document.getElementById('jetpack-power').value == 2
      || isNaN(document.getElementById('jetpack-power').value)
      || document.getElementById('jetpack-power').value < 1){
        window.localStorage.removeItem('Jetpack.htm-jetpack-power');
        settings['jetpack-power'] = 2;

    }else{
        settings['jetpack-power'] = parseInt(document.getElementById('jetpack-power').value);
        window.localStorage.setItem(
          'Jetpack.htm-jetpack-power',
          settings['jetpack-power']
        );
    }

    if(document.getElementById('ms-per-frame').value == 30
      || isNaN(document.getElementById('ms-per-frame').value)
      || document.getElementById('ms-per-frame').value < 1){
        window.localStorage.removeItem('Jetpack.htm-ms-per-frame');
        settings['ms-per-frame'] = 30;

    }else{
        settings['ms-per-frame'] = parseInt(document.getElementById('ms-per-frame').value);
        window.localStorage.setItem(
          'Jetpack.htm-ms-per-frame',
          settings['ms-per-frame']
        );
    }

    if(document.getElementById('obstacle-frequency').value == 23
      || isNaN(document.getElementById('obstacle-frequency').value)
      || document.getElementById('obstacle-frequency').value < 1){
        window.localStorage.removeItem('Jetpack.htm-obstacle-frequency');
        settings['obstacle-frequency'] = 23;

    }else{
        settings['obstacle-frequency'] = parseInt(document.getElementById('obstacle-frequency').value);
        window.localStorage.setItem(
          'Jetpack.htm-obstacle-frequency',
          settings['obstacle-frequency']
        );
    }

    if(document.getElementById('obstacle-increase').value == 115
      || isNaN(document.getElementById('obstacle-increase').value)
      || document.getElementById('obstacle-increase').value < 0){
        window.localStorage.removeItem('Jetpack.htm-obstacle-increase');
        settings['obstacle-increase'] = 115;

    }else{
        settings['obstacle-increase'] = parseInt(document.getElementById('obstacle-increase').value);
        window.localStorage.setItem(
          'Jetpack.htm-obstacle-increase',
          settings['obstacle-increase']
        );
    }

    if(document.getElementById('speed').value == 10
      || isNaN(document.getElementById('speed').value)
      || document.getElementById('speed').value < 0){
        window.localStorage.removeItem('Jetpack.htm-speed');
        settings['speed'] = 10;

    }else{
        settings['speed'] = parseInt(document.getElementById('speed').value);
        window.localStorage.setItem(
          'Jetpack.htm-speed',
          settings['speed']
        );
    }
}

function setmode(newmode){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    obstacles = [];
    smoke = [];
    mode = newmode;

    // Play game mode.
    if(mode > 0){
        save();

        frames = 0;
        frames_per_obstacle = settings['obstacle-frequency'];
        game_running = true;
        played_explosion_sound = false;
        player_speed = 0;
        player_y = 0;

        document.getElementById('page').innerHTML = '<canvas id=canvas></canvas><canvas id=buffer style=display:none></canvas>';

        buffer = document.getElementById('buffer').getContext('2d');
        canvas = document.getElementById('canvas').getContext('2d');

        resize();

        animationFrame = window.requestAnimationFrame(draw);
        interval = window.setInterval(
          'logic()',
          settings['ms-per-frame']
        );

    // Main menu mode.
    }else{
        buffer = 0;
        canvas = 0;

        document.getElementById('page').innerHTML='<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><a onclick=setmode(1)>Cave Corridor</a></div><hr><div class=c>Best: '
          + best
          + '<br><a onclick=reset_best()>Reset Best</a></div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c>Jetpack:<ul><li><input disabled style=border:0 value=Click>Activate<li><input id=jetpack-key maxlength=1 value='
          + settings['jetpack-key'] + '>Activate</ul><input disabled style=border:0 value=ESC>Main Menu<br><input id=restart-key maxlength=1 value='
          + settings['restart-key'] + '>Restart</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
          + settings['audio-volume'] + '>Audio<br><input id=color type=color value='
          + settings['color'] + '>Color<br><input id=gravity value='
          + settings['gravity'] + '>Gravity<br>Jetpack:<ul><li><input id=jetpack-power value='
          + settings['jetpack-power'] + '>Power<li><input id=speed value='
          + settings['speed'] + '>Speed</ul><input id=ms-per-frame value='
          + settings['ms-per-frame'] + '>ms/Frame<br>Obstacle:<ul><li><input id=obstacle-frequency value='
          + settings['obstacle-frequency'] + '>Frequency<li><input id=obstacle-increase value='
          + settings['obstacle-increase'] + '>Increase</ul><a onclick=reset()>Reset Settings</a></div></div>';
    }
}

function update_best(){
    if(frames > best){
        best = frames;
    }

    if(best > 0){
        window.localStorage.setItem(
          'Jetpack.htm-best',
          best
        );

    }else{
        window.localStorage.removeItem('Jetpack.htm-best');
    }
}

var animationFrame = 0;
var best = window.localStorage.getItem('Jetpack.htm-best') === null
  ? 0
  : parseInt(window.localStorage.getItem('Jetpack.htm-best'));
var buffer = 0;
var canvas = 0;
var frames = 0;
var game_running = false;
var height = 0;
var interval = 0;
var key_jetpack = false;
var mode = 0;
var obstacles = [];
var played_explosion_sound = false;
var player_speed = 0;
var player_y = 0;
var frames_per_obstacle = 0;
var settings = {
  'audio-volume': window.localStorage.getItem('Jetpack.htm-audio-volume') === null
    ? 1
    : parseFloat(window.localStorage.getItem('Jetpack.htm-audio-volume')),
  'color': window.localStorage.getItem('Jetpack.htm-color') === null
    ? '#009900'
    : window.localStorage.getItem('Jetpack.htm-color'),
  'gravity': window.localStorage.getItem('Jetpack.htm-gravity') === null
    ? 1
    : parseFloat(window.localStorage.getItem('Jetpack.htm-gravity')),
  'jetpack-key': window.localStorage.getItem('Jetpack.htm-jetpack-key') === null
    ? 'W'
    : window.localStorage.getItem('Jetpack.htm-jetpack-key'),
  'jetpack-power': window.localStorage.getItem('Jetpack.htm-jetpack-power') === null
    ? 2
    : parseFloat(window.localStorage.getItem('Jetpack.htm-jetpack-power')),
  'ms-per-frame': window.localStorage.getItem('Jetpack.htm-ms-per-frame') === null
    ? 30
    : parseInt(window.localStorage.getItem('Jetpack.htm-ms-per-frame')),
  'obstacle-frequency': window.localStorage.getItem('Jetpack.htm-obstacle-frequency') === null
    ? 23
    : parseInt(window.localStorage.getItem('Jetpack.htm-obstacle-frequency')),
  'obstacle-increase': window.localStorage.getItem('Jetpack.htm-obstacle-increase') === null
    ? 115
    : parseInt(window.localStorage.getItem('Jetpack.htm-obstacle-increase')),
  'restart-key': window.localStorage.getItem('Jetpack.htm-restart-key') === null
    ? 'H'
    : window.localStorage.getItem('Jetpack.htm-restart-key'),
  'speed': window.localStorage.getItem('Jetpack.htm-speed') === null
    ? 10
    : parseFloat(window.localStorage.getItem('Jetpack.htm-speed')),
};
var smoke = [];
var width = 0;
var x = 0;
var y = 0;

setmode(0);

window.onkeydown = function(e){
    if(mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    // ESC: update best and return to main menu.
    if(key === 27){
        update_best();
        setmode(0);
        return;
    }
        
    key = String.fromCharCode(key);

    if(key === settings['jetpack-key']){
        key_jetpack = true;

    }else if(key === settings['restart-key']){
        update_best();

        frames = 0;
        frames_per_obstacle = settings['obstacle-frequency'];
        game_running = true;
        obstacles = [];
        played_explosion_sound = false;
        player_speed = 0;
        player_y = 0;
        smoke = [];
    }
};

window.onkeyup = function(e){
    var key = String.fromCharCode(e.keyCode || e.which);

    if(key === settings['jetpack-key']){
        key_jetpack = false;
    }
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
