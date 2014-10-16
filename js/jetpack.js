function draw(){
    if(game_running){
        frames += 1;

        // if new obstacle should be added this frame, add one
        if(frames % frames_per_obstacle === 0){
            var obstalce_width = Math.floor(Math.random() * 15) + 20;
            obstacles.splice(
              0,
              0,
              [
                x + obstalce_width,
                Math.floor(Math.random() * 500) - 250,
                obstalce_width,
                Math.floor(Math.random() * 15) + 20
              ]
            );
        }

        // if obstacle frequency increase should happen this frame, do it
        if(settings['obstacle-frequency'] > 0
          && frames_per_obstacle > 1
          && frames % settings['obstacle-frequency'] === 0){
            // obstacle frequency increase
            frames_per_obstacle -= 1;
        }

        // if the player has activated jetpack, increase y speed and add smoke
        if(key_jetpack){
            player_speed += settings['jetpack-power'];
            smoke.splice(
              0,
              0,
              [
                -20,
                player_y - 10
              ]
            );

        // else apply gravity
        }else{
            player_speed -= settings['gravity'];
        }

        player_y += player_speed;
    }

    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    // draw corridor over grey background
    buffer.fillStyle = '#000';
    buffer.fillRect(
      0,
      y - 250,
      width,
      500
    );

    // draw player body
    buffer.fillStyle = '#090';
    buffer.fillRect(
      x,
      y - player_y - 25,
      25,
      50
    );

    // draw jetpack
    buffer.fillStyle = '#aaa';
    buffer.fillRect(
      x - 25,
      y - player_y - 15,
      25,
      20
    );

    // draw activated jetpack fire
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

    // check if player is outside of game boundaries
    if(player_y + 25 > 250
      || player_y - 25 < -250){
        game_running = 0;
        update_best();
    }

    var loop_counter = obstacles.length - 1;
    if(loop_counter >= 0){
        if(game_running){
            do{
                // delete obstacles that are past left side of screen
                if(obstacles[loop_counter][0] < -x - 70){
                    obstacles.splice(
                      loop_counter,
                      1
                    );

                }else{
                    // move obstacles left at speed
                    obstacles[loop_counter][0] -= settings['speed'];

                    // check for player collision with obstacle
                    if(obstacles[loop_counter][0] > -obstacles[loop_counter][2] * 2
                      && obstacles[loop_counter][0] < obstacles[loop_counter][2]
                      && obstacles[loop_counter][1] > -player_y - 25 - obstacles[loop_counter][3] * 2
                      && obstacles[loop_counter][1] < -player_y + 25){
                        game_running = 0;
                        update_best();
                    }
                }
            }while(loop_counter--);

            // get new amount of obstacles, some may have been spliced
            loop_counter = obstacles.length - 1;
        }

        // draw obstacles
        if(loop_counter >= 0){
            buffer.fillStyle = '#555';
            do{
                buffer.fillRect(
                  x + obstacles[loop_counter][0],
                  y + obstacles[loop_counter][1],
                  obstacles[loop_counter][2] * 2,
                  obstacles[loop_counter][3] * 2
                );
            }while(loop_counter--);
        }
    }

    loop_counter = smoke.length-1;
    if(loop_counter >= 0){
        if(game_running){
            // delete smoke trails past left side of screen, else move left
            do{
                if(smoke[loop_counter][0] < -x){
                    smoke.splice(
                      loop_counter,
                      1
                    );

                }else if(game_running){
                    smoke[loop_counter][0] -= settings['speed'];
                }
            }while(loop_counter--);

            // get new amount of smoke, some may have been spliced
            loop_counter = smoke.length - 1;
        }

        // draw smoke trails behind the player
        if(loop_counter >= 0){
            buffer.fillStyle = '#777';
            do{
                buffer.fillRect(
                  x + smoke[loop_counter][0],
                  y - smoke[loop_counter][1],
                  10,
                  10
                );
            }while(loop_counter--);
        }
    }

    // setup text display
    buffer.font = '23pt sans-serif';
    buffer.textAlign = 'left';
    buffer.textBaseline = 'top';
    buffer.fillStyle = '#fff';

    // if game is over, display game over messages
    if(!game_running){
        if(!played_explosion_sound){
            if(settings['audio-volume'] > 0){
                // play explode sound
            }
            played_explosion_sound = 1;
        }

        if(frames > best_display){
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
          settings['restart-key'] + ' = Restart',// restart key
          5,
          height - 65
        );
        buffer.fillText(
          'ESC = Main Menu',
          5,
          height - 35
        );
    }

    // top frame counter and best text displays
    buffer.fillText(
      frames,
      5,
      0
    );
    buffer.fillText(
      best_display,
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
}

function reset(){
    if(confirm('Reset settings?')){
        document.getElementById('audio-volume').value = 1;
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
}

function resize(){
    if(mode > 0){
        height = window.innerHeight;
        document.getElementById('buffer').height = height;
        document.getElementById('canvas').height = height;
        y = height / 2;

        width = window.innerWidth;
        document.getElementById('buffer').width = width;
        document.getElementById('canvas').width = width;
        x = width / 2;
    }
}

function save(){
    // Save audio-volume setting.
    if(document.getElementById('audio-volume').value === 1){
        window.localStorage.removeItem('Jetpack.htm-audio-volume');
        settings['audio-volume'] = 1;

    }else{
        settings['audio-volume'] = parseFloat(document.getElementById('audio-volume').value);
        window.localStorage.setItem(
          'Jetpack.htm-audio-volume',
          settings['audio-volume']
        );
    }

    // Save gravity setting.
    if(document.getElementById('gravity').value == 1
      || isNaN(document.getElementById('gravity').value)
      || document.getElementById('gravity').value < 1){
        window.localStorage.removeItem('Jetpack.htm-gravity');
        document.getElementById('gravity').value = 1;
        settings['gravity'] = 1;

    }else{
        settings['gravity'] = parseInt(document.getElementById('gravity').value);
        window.localStorage.setItem(
          'Jetpack.htm-gravity',
          settings['gravity']
        );
    }

    // Save jetpack-key setting.
    if(document.getElementById('jetpack-key').value == 'W'){
        window.localStorage.removeItem('Jetpack.htm-jetpack-key');
        settings['jetpack-key'] = 'W';

    }else{
        settings['jetpack-key'] = document.getElementById('jetpack-key').value;
        window.localStorage.setItem(
          'Jetpack.htm-jetpack-key',
          settings['jetpack-key']
        );
    }

    // Save jetpack-power setting.
    if(document.getElementById('jetpack-power').value == 2
      || isNaN(document.getElementById('jetpack-power').value)
      || document.getElementById('jetpack-power').value < 1){
        window.localStorage.removeItem('Jetpack.htm-jetpack-power');
        document.getElementById('jetpack-power').value = 2;
        settings['jetpack-power'] = 2;

    }else{
        settings['jetpack-power'] = parseInt(document.getElementById('jetpack-power').value);
        window.localStorage.setItem(
          'Jetpack.htm-jetpack-power',
          settings['jetpack-power']
        );
    }

    // Save ms-per-frame setting.
    if(document.getElementById('ms-per-frame').value == 30
      || isNaN(document.getElementById('ms-per-frame').value)
      || document.getElementById('ms-per-frame').value < 1){
        window.localStorage.removeItem('Jetpack.htm-ms-per-frame');
        document.getElementById('ms-per-frame').value = 30;
        settings['ms-per-frame'] = 30;

    }else{
        settings['ms-per-frame'] = parseInt(document.getElementById('ms-per-frame').value);
        window.localStorage.setItem(
          'Jetpack.htm-ms-per-frame',
          settings['ms-per-frame']
        );
    }

    // Save obstacle-frequency setting.
    if(document.getElementById('obstacle-frequency').value == 23
      || isNaN(document.getElementById('obstacle-frequency').value)
      || document.getElementById('obstacle-frequency').value < 1){
        window.localStorage.removeItem('Jetpack.htm-obstacle-frequency');
        document.getElementById('obstacle-frequency').value = 23;
        settings['obstacle-frequency'] = 23;

    }else{
        settings['obstacle-frequency'] = parseInt(document.getElementById('obstacle-frequency').value);
        window.localStorage.setItem(
          'Jetpack.htm-obstacle-frequency',
          settings['obstacle-frequency']
        );
    }

    // Save obstacle-increase setting.
    if(document.getElementById('obstacle-increase').value == 115
      || isNaN(document.getElementById('obstacle-increase').value)
      || document.getElementById('obstacle-increase').value < 0){
        window.localStorage.removeItem('Jetpack.htm-obstacle-increase');
        document.getElementById('obstacle-increase').value = 115;
        settings['obstacle-increase'] = 115;

    }else{
        settings['obstacle-increase'] = parseInt(document.getElementById('obstacle-increase').value);
        window.localStorage.setItem(
          'Jetpack.htm-obstacle-increase',
          settings['obstacle-increase']
        );
    }

    // Save restart-key setting.
    if(document.getElementById('restart-key').value == 'H'){
        window.localStorage.removeItem('Jetpack.htm-restart-key');
        settings['restart-key'] = 'H';

    }else{
        settings['restart-key'] = document.getElementById('restart-key').value;
        window.localStorage.setItem(
          'Jetpack.htm-restart-key',
          settings['restart-key']
        );
    }

    // Save speed setting.
    if(document.getElementById('speed').value == 10
      || isNaN(document.getElementById('speed').value)
      || document.getElementById('speed').value < 0){
        window.localStorage.removeItem('Jetpack.htm-speed');
        document.getElementById('speed').value = 10;
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
    clearInterval(interval);

    obstacles = [];
    smoke = [];
    best_display = best;
    mode = newmode;

    // play game mode
    if(mode > 0){
        save();

        frames = 0;
        frames_per_obstacle = settings['obstacle-frequency'];// obstacle frequency
        game_running = 1;
        played_explosion_sound = 0;
        player_speed = 0;
        player_y = 0;

        document.getElementById('page').innerHTML = '<canvas id=canvas></canvas>';
        buffer = document.getElementById('buffer').getContext('2d');
        canvas = document.getElementById('canvas').getContext('2d');

        resize();

        interval = setInterval(
          'draw()',
          settings['ms-per-frame']// ms/frame
        );

    // main menu mode
    }else{
        buffer = 0;
        canvas = 0;

        document.getElementById('page').innerHTML='<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><b>Jetpack.htm</b></div><hr><div class=c><ul><li><a onclick=setmode(1)>Cave Corridor</a> (Best: '
          + best
          + ')</ul></div><hr><div class=c><a onclick="if(confirm(\'Reset best?\')){best=0;frames=0;update_best();setmode(0)}">Reset Best</a></div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c>Jetpack:<ul><li><input disabled style=border:0 value=Click>Activate<li><input id=jetpack-key maxlength=1 value='
          + settings['jetpack-key'] + '>Activate</ul><input disabled style=border:0 value=ESC>Main Menu<br><input id=restart-key maxlength=1 value='
          + settings['restart-key'] + '>Restart</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
          + settings['audio-volume'] + '>Audio<br><input id=gravity value='
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
          'jetpack-best',
          best
        );

    }else{
        window.localStorage.removeItem('jetpack-best');
    }
}

var best = window.localStorage.getItem('jetpack-best') === null
  ? 0
  : parseInt(window.localStorage.getItem('jetpack-best'));
var best_display = 0;
var buffer = 0;
var canvas = 0;
var frames = 0;
var game_running = 0;
var height = 0;
var interval = 0;
var j = 0;
var key_jetpack = 0;
var mode = 0;
var obstacles = [];
var played_explosion_sound = 0;
var player_speed = 0;
var player_y = 0;
var frames_per_obstacle = 0;
var settings = {
  'audio-volume': window.localStorage.getItem('Jetpack.htm-audio-volume') === null
    ? 1
    : parseFloat(window.localStorage.getItem('Jetpack.htm-audio-volume')),
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
    if(mode > 0){
        var key = window.event ? event : e;
        key = key.charCode ? key.charCode : key.keyCode;

        if(key === 27){// ESC
            update_best();
            setmode(0);
        
        }else{
            key = String.fromCharCode(key);

            if(key === settings['jetpack-key']){
                key_jetpack = 1;

            }else if(key === settings['restart-key']){
                update_best();

                best_display = best;
                frames = 0;
                frames_per_obstacle = settings['obstacle-frequency'];
                game_running = 1;
                obstacles = [];
                played_explosion_sound = 0;
                player_speed = 0;
                player_y = 0;
                smoke = [];
            }
        }
    }
};

window.onkeyup = function(e){
    var key = window.event ? event : e;
    key = key.charCode ? key.charCode : key.keyCode;

    if(String.fromCharCode(key) === settings['jetpack-key']){
        key_jetpack = 0;
    }
};

window.onmousedown = function(e){
    if(mode > 0){
        e.preventDefault();
        key_jetpack = 1;
    }
};

window.onmouseup = function(e){
    key_jetpack = 0;
};

window.onresize = resize;
