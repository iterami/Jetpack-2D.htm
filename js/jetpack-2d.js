'use strict';

function draw_logic(){
    // Draw background.
    canvas_buffer.fillStyle = '#333';
    canvas_buffer.fillRect(
      0,
      0,
      canvas_width,
      canvas_height
    );

    canvas_buffer.save();
    canvas_buffer.translate(
      canvas_x,
      canvas_y
    );

    // Draw corridor over background.
    canvas_buffer.fillStyle = '#000';
    canvas_buffer.fillRect(
      -canvas_x,
      -half_corridor_height,
      canvas_width,
      storage_data['corridor-height']
    );

    // Draw player body.
    canvas_buffer.fillStyle = storage_data['color'];
    canvas_buffer.fillRect(
      0,
      -player['y'] - 25,
      25,
      50
    );

    // Draw jetpack.
    canvas_buffer.fillStyle = '#aaa';
    canvas_buffer.fillRect(
      -25,
      -player['y'] - 15,
      25,
      20
    );

    // Draw activated jetpack fire.
    if(game_running
      && key_jetpack){
        canvas_buffer.fillStyle = '#f00';
        canvas_buffer.fillRect(
          -22,
          -player['y'] + 5,
          18,
          10
        );
    }

    // Draw obstacles.
    for(var obstacle in obstacles){
        canvas_buffer.fillStyle = '#555';
        canvas_buffer.fillRect(
          obstacles[obstacle]['x'],
          obstacles[obstacle]['y'],
          obstacles[obstacle]['width'] * 2,
          obstacles[obstacle]['height'] * 2
        );
        canvas_buffer.fillStyle = '#fff';
        canvas_buffer.fillText(
          obstacles[obstacle]['counter'],
          obstacles[obstacle]['x'],
          obstacles[obstacle]['y']
        );
    }

    // Draw smoke trails behind the player.
    canvas_buffer.fillStyle = '#777';
    for(var id in smoke){
        canvas_buffer.fillRect(
          smoke[id]['x'],
          -smoke[id]['y'],
          10,
          10
        );
    }

    canvas_buffer.restore();

    canvas_buffer.fillStyle = '#fff';

    // Draw current frame count.
    canvas_buffer.fillText(
      frame_counter,
      5,
      25
    );
    canvas_buffer.fillText(
      storage_data['score'],
      5,
      50
    );

    // If game is over, display game over messages.
    if(!game_running){
        if(!played_explosion_sound){
            if(storage_data['audio-volume'] > 0){
                // play_audio('explosion');
            }
            played_explosion_sound = true;
        }

        canvas_buffer.fillText(
          storage_data['restart-key'] + ' = Restart',
          5,
          canvas_height - 40
        );
        canvas_buffer.fillText(
          'ESC = Main Menu',
          5,
          canvas_height - 10
        );

        if(frame_counter > storage_data['score']){
            storage_data['score'] = frame_counter;
            canvas_buffer.fillStyle = '#0f0';
            canvas_buffer.fillText(
              'NEW BEST SCORE!',
              5,
              canvas_height - 100
            );
        }

        canvas_buffer.fillStyle = '#f00';
        canvas_buffer.fillText(
          'You crashed... ☹',
          5,
          canvas_height - 70
        );
    }
}

function logic(){
    if(!game_running
      || canvas_menu){
        return;
    }

    // Check if player is outside of game boundaries.
    if(player['y'] + 25 > half_corridor_height
      || player['y'] - 25 < -half_corridor_height){
        game_running = false;
        return;
    }

    frame_counter += 1;

    // If new obstacle should be added this frame, add one.
    if(frame_counter % frames_per_obstacle === 0){
        var obstacle_width = random_integer({
          'max': 15,
        }) + 20;
        obstacles.push({
          'counter': obstacle_counter,
          'height': random_integer({
            'max': 15,
          }) + 20,
          'width': obstacle_width,
          'x': canvas_x + obstacle_width,
          'y': random_integer({
            'max': storage_data['corridor-height'],
          }) - half_corridor_height,
        });
        obstacle_counter += 1;
    }

    // If obstacle frequency increase should happen this frame, do it.
    if(storage_data['obstacle-frequency'] > 0
      && frames_per_obstacle > 1
      && frame_counter % storage_data['obstacle-increase'] === 0){
        // obstacle frequency increase
        frames_per_obstacle -= 1;
    }

    // If the player has activated jetpack, increase y speed and add smoke...
    if(key_jetpack){
        player['speed'] += storage_data['jetpack-power'];
        smoke.push({
          'x': -20,
          'y': player['y'] - 10,
        });

    // ...else apply gravity.
    }else{
        player['speed'] -= storage_data['gravity'];
    }

    player['y'] += player['speed'];

    for(var obstacle in obstacles){
        // Delete obstacles that are past left side of screen.
        if(obstacles[obstacle]['x'] < -canvas_x - 70){
            obstacles.splice(
              obstacle,
              1
            );
            continue;
        }

        // Move obstacles left at speed.
        obstacles[obstacle]['x'] -= storage_data['speed'];

        // Check for player collision with obstacle.
        if(obstacles[obstacle]['x'] <= -obstacles[obstacle]['width'] * 2
          || obstacles[obstacle]['x'] >= obstacles[obstacle]['width']
          || obstacles[obstacle]['y'] <= -player['y'] - 25 - obstacles[obstacle]['height'] * 2
          || obstacles[obstacle]['y'] >= -player['y'] + 25){
            continue;
        }

        game_running = false;
    }

    // Delete smoke trails past left side of screen.
    for(var id in smoke){
        smoke[id]['x'] -= storage_data['speed'];

        if(smoke[id]['x'] < -canvas_x){
            smoke.splice(
              id,
              1
            );
        }
    }
}

function setmode_logic(newgame){
    obstacle_counter = 0;
    obstacles = [];
    smoke = [];

    // Main menu mode.
    if(canvas_mode === 0){
        storage_save({
          'bests': true,
        });
        document.body.innerHTML = '<div><div><a onclick=canvas_setmode({mode:1,newgame:true})>Cave Corridor</a></div><hr><div>Best: '
          + storage_info['score']['best']
          + '<br><a onclick=storage_reset({bests:true});canvas_setmode({mode:0})>Reset Best</a></div></div>'
          + '<div class=right><div>Jetpack:<ul><li><input disabled value=Click>Activate'
          + '<li><input id=jetpack-key maxlength=1>Activate</ul>'
          + '<input disabled value=ESC>Menu<br>'
          + '<input id=restart-key maxlength=1>Restart</div><hr>'
          + '<div><input id=audio-volume max=1 min=0 step=0.01 type=range>Audio<br>'
          + '<input id=color type=color>Color<br>'
          + '<input id=corridor-height>Corridor Height<br>'
          + '<input id=gravity>Gravity<br>'
          + 'Jetpack:<ul><li><input id=jetpack-power>Power'
          + '<li><input id=speed>Speed</ul>'
          + '<input id=ms-per-frame>ms/Frame<br>'
          + 'Obstacle:<ul><li><input id=obstacle-frequency>Frequency'
          + '<li><input id=obstacle-increase>Increase</ul>'
          + '<a onclick=storage_reset()>Reset Settings</a></div></div>';
        storage_update();

    // Play game mode.
    }else{
        if(newgame){
            storage_save();
        }

        frame_counter = 0;
        frames_per_obstacle = storage_data['obstacle-frequency'];
        game_running = true;
        half_corridor_height = storage_data['corridor-height'] / 2;
        played_explosion_sound = false;
        player = {
          'speed': 0,
          'y': 0,
        };
    }
}

var frame_counter = 0;
var frames_per_obstacle = 0;
var game_running = false;
var half_corridor_height = 0;
var key_jetpack = false;
var obstacle_counter = 0;
var obstacles = [];
var played_explosion_sound = false;
var player = {};
var smoke = [];

window.onload = function(){
    storage_init({
      'data': {
        'audio-volume': 1,
        'color': '#009900',
        'corridor-height': 500,
        'gravity': 1,
        'jetpack-key': 'W',
        'jetpack-power': 2,
        'ms-per-frame': 30,
        'obstacle-frequency': 23,
        'obstacle-increase': 115,
        'restart-key': 'H',
        'score': {
          'default': 0,
          'type': 1,
        },
        'speed': 10,
      },
      'prefix': 'Jetpack-2D.htm-',
    });
    canvas_init();

    window.onkeydown = function(e){
        if(canvas_mode <= 0){
            return;
        }

        var key = e.keyCode || e.which;

        // ESC: menu.
        if(key === 27){
            canvas_menu_toggle();
            return;
        }

        key = String.fromCharCode(key);

        if(key === storage_data['jetpack-key']){
            key_jetpack = true;

        }else if(key === storage_data['restart-key']){
            storage_save({
              'bests': true,
            });
            canvas_setmode({
              'mode': 1,
            });

        }else if(key === 'Q'){
            canvas_menu_quit();
        }
    };

    window.onkeyup = function(e){
        var key = String.fromCharCode(e.keyCode || e.which);

        if(key === storage_data['jetpack-key']){
            key_jetpack = false;
        }
    };

    window.onmousedown
      = window.ontouchstart = function(e){
        if(canvas_mode <= 0){
            return;
        }

        e.preventDefault();
        key_jetpack = true;
    };

    window.onmouseup
      = window.ontouchend = function(e){
        key_jetpack = false;
    };
};
