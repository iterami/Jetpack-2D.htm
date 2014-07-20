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
        if(settings[4] > 0
          && frames_per_obstacle > 1
          && frames % settings[4] === 0){
            // obstacle frequency increase
            frames_per_obstacle -= 1;
        }

        // if the player has activated jetpack, increase y speed and add smoke
        if(key_jetpack){
            player_speed += settings[2];// jetpack power
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
            player_speed -= settings[1];// gravity
        }

        player_y += player_speed;
    }

    if(settings[9]){// clear?
        buffer.clearRect(
          0,
          0,
          width,
          height
        );
    }

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
                    obstacles[loop_counter][0] -= settings[6];

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
                    smoke[loop_counter][0] -= settings[6];// speed
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
            if(settings[5] > 0){// audio volume
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
          settings[8] + ' = Restart',// restart key
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

    if(settings[9]){// clear?
        canvas.clearRect(
          0,
          0,
          width,
          height
        );
    }
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );
}

function reset(){
    if(confirm('Reset settings?')){
        document.getElementById('audio-volume').value = 1;
        document.getElementById('clear').checked = 1;
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
    var loop_counter = 4;
    do{
        j = [
          'ms-per-frame',
          'obstacle-frequency',
          'obstacle-increase',
          'audio-volume',
          'speed'
        ][loop_counter];

        if(isNaN(document.getElementById(j).value)
          || document.getElementById(j).value < [1, 1, 0, 0, 10][loop_counter]){
            document.getElementById(j).value = [
              30,
              23,
              115,
              1,
              10
            ][loop_counter];
        }
    }while(loop_counter--);

    loop_counter = 6;
    do{
        j = [
          'ms-per-frame',
          'gravity',
          'jetpack-power',
          'obstacle-frequency',
          'obstacle-increase',
          'audio-volume',
          'speed'
        ][loop_counter];

        if(isNaN(document.getElementById(j).value)
          || document.getElementById(j).value === [30, 1, 2, 23, 115, 1, 10][loop_counter]){
            window.localStorage.removeItem('jetpack-' + loop_counter);
            settings[loop_counter] = [
              30,
              1,
              2,
              23,
              115,
              1,
              10
            ][loop_counter];
            document.getElementById(j).value = settings[loop_counter];

        }else{
            settings[loop_counter] = parseFloat(document.getElementById(j).value);
            window.localStorage.setItem(
              'jetpack-' + loop_counter,
              settings[loop_counter]
            );
        }
    }while(loop_counter--);


    if(document.getElementById('jetpack-key').value === 'W'){
        window.localStorage.removeItem('jetpack-7');
        settings[7] = 'W';

    }else{
        settings[7] = document.getElementById('jetpack-key').value;
        window.localStorage.setItem(
          'jetpack-7',
          settings[7]
        );
    }

    if(document.getElementById('restart-key').value === 'H'){
        window.localStorage.removeItem('jetpack-8');
        settings[8] = 'H';

    }else{
        settings[8] = document.getElementById('restart-key').value;
        window.localStorage.setItem(
          'jetpack-8',
          settings[8]
        );
    }

    settings[9] = document.getElementById('clear').checked;
    if(settings[9]){
        window.localStorage.removeItem('jetpack-9');

    }else{
        window.localStorage.setItem(
          'jetpack-9',
          0
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
        frames_per_obstacle = settings[3];// obstacle frequency
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
          settings[0]// ms/frame
        );

    // main menu mode
    }else{
        buffer = 0;
        canvas = 0;

        document.getElementById('page').innerHTML='<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><b>Jetpack.htm</b></div><hr><div class=c><ul><li><a onclick=setmode(1)>Cave Corridor</a> (Best: '
          + best
          + ')</ul></div><hr><div class=c><a onclick="if(confirm(\'Reset best?\')){best=0;frames=0;update_best();setmode(0)}">Reset Best</a></div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c>Jetpack:<ul><li><input disabled style=border:0 value=Click>Activate<li><input id=jetpack-key maxlength=1 value='
          + settings[7] + '>Activate</ul><input disabled style=border:0 value=ESC>Main Menu<br><input id=restart-key maxlength=1 value='
          + settings[8] + '>Restart</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
          + settings[5] + '>Audio<br><label><input '
          + (settings[9] ? 'checked ' : '')+'id=clear type=checkbox>Clear</label><br><input id=gravity value='
          + settings[1] + '>Gravity<br>Jetpack:<ul><li><input id=jetpack-power value='
          + settings[2] + '>Power<li><input id=speed value='
          + settings[6] + '>Speed</ul><input id=ms-per-frame value='
          + settings[0] + '>ms/Frame<br>Obstacle:<ul><li><input id=obstacle-frequency value='
          + settings[3] + '>Frequency<li><input id=obstacle-increase value='
          + settings[4] + '>Increase</ul><a onclick=reset()>Reset Settings</a></div></div>';
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
var settings = [
  window.localStorage.getItem('jetpack-0') === null
    ? 30
    : parseInt(window.localStorage.getItem('jetpack-0')),// ms/frame
  window.localStorage.getItem('jetpack-1') === null
    ? 1
    : parseFloat(window.localStorage.getItem('jetpack-1')),// gravity
  window.localStorage.getItem('jetpack-2') === null
    ? 2
    : parseFloat(window.localStorage.getItem('jetpack-2')),// jetpack power
  window.localStorage.getItem('jetpack-3') === null
    ? 23
    : parseInt(window.localStorage.getItem('jetpack-3')),// obstacle frequency
  window.localStorage.getItem('jetpack-4') === null
    ? 115
    : parseInt(window.localStorage.getItem('jetpack-4')),// obstacle increase
  window.localStorage.getItem('jetpack-5') === null
    ? 1
    : parseFloat(window.localStorage.getItem('jetpack-5')),// audio volume
  window.localStorage.getItem('jetpack-6') === null
    ? 10
    : parseFloat(window.localStorage.getItem('jetpack-6')),// speed
  window.localStorage.getItem('jetpack-7') === null
    ? 'W'
    : window.localStorage.getItem('jetpack-7'),// activate jetpack key
  window.localStorage.getItem('jetpack-8') === null
    ? 'H'
    : window.localStorage.getItem('jetpack-8'),// restart key
  window.localStorage.getItem('jetpack-9') === null// clear?
];
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

            if(key === settings[7]){// activate jetpack key
                key_jetpack = 1;

            }else if(key === settings[8]){// restart key
                update_best();

                best_display = best;
                frames = 0;
                frames_per_obstacle = settings[3];// obstacle frequency
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

    if(String.fromCharCode(key) === settings[7]){// activate jetpack key
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
