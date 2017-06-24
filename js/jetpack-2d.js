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
      core_storage_data['corridor-height']
    );

    // Draw player body.
    canvas_buffer.fillStyle = core_storage_data['color'];
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
      && core_keys[87]['state']){
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

    // If game is over, display game over messages.
    if(!game_running){
        canvas_buffer.fillStyle = '#f00';
        canvas_buffer.fillText(
          'You crashed... ☹',
          0,
          125
        );

        if(frame_counter > core_storage_data['score']){
            canvas_buffer.fillStyle = '#fff';
            canvas_buffer.fillText(
              'NEW BEST SCORE!',
              0,
              165
            );
        }
    }
}

function logic(){
    if(!game_running){
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
        var obstacle_width = core_random_integer({
          'max': 15,
        }) + 20;
        obstacles.push({
          'counter': obstacle_counter,
          'height': core_random_integer({
            'max': 15,
          }) + 20,
          'width': obstacle_width,
          'x': canvas_x + obstacle_width,
          'y': core_random_integer({
            'max': core_storage_data['corridor-height'],
          }) - half_corridor_height,
        });
        obstacle_counter += 1;
    }

    // If obstacle frequency increase should happen this frame, do it.
    if(core_storage_data['obstacle-frequency'] > 0
      && frames_per_obstacle > 1
      && frame_counter % core_storage_data['obstacle-increase'] === 0){
        // obstacle frequency increase
        frames_per_obstacle -= 1;
    }

    // If the player has activated jetpack, increase y speed and add smoke...
    if(core_keys[87]['state']){
        player['speed'] += core_storage_data['jetpack-power'];
        smoke.push({
          'x': -20,
          'y': player['y'] - 10,
        });

    // ...else apply gravity.
    }else{
        player['speed'] -= core_storage_data['gravity'];
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
        obstacles[obstacle]['x'] -= core_storage_data['speed'];

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
        smoke[id]['x'] -= core_storage_data['speed'];

        if(smoke[id]['x'] < -canvas_x){
            smoke.splice(
              id,
              1
            );
        }
    }

    core_ui_update({
      'ids': {
        'best': core_storage_data['score'],
        'score': frame_counter,
      },
    });
}

function repo_init(){
    core_repo_init({
      'info': '<input onclick=canvas_setmode({newgame:true}) type=button value="Start New Flight"> Best: <span id=score></span>',
      'keybinds': {
        72: {
          'todo': function(){
              core_storage_save({
                'bests': true,
              });
              canvas_setmode();
          },
        },
        87: {},
      },
      'menu': true,
      'storage': {
        'color': '#009900',
        'corridor-height': 500,
        'gravity': 1,
        'jetpack-power': 2,
        'level': 0,
        'obstacle-frequency': 23,
        'obstacle-increase': 115,
        'score': {
          'default': 0,
          'type': 1,
        },
        'speed': 10,
      },
      'storage-menu': '<table><tr><td><input id=color type=color><td>Color<tr><td><input id=corridor-height><td>Corridor Height<tr><td><input id=gravity><td>Gravity<tr><td><input id=jetpack-power><td>Jetpack Power<tr><td><input id=speed><td>Jetpack Speed<tr><td><select id=level><option value=0>Cave Corridor</option></select><td>Level<tr><td><input id=obstacle-frequency><td>Obstacle Frequency<tr><td><input id=obstacle-increase><td>Obstacle Increase</table>',
      'title': 'Jetpack-2D.htm',
      'ui': '<input id=ui-best>Best<br><input id=ui-score>Score',
    });
    canvas_init();
}

var frame_counter = 0;
var frames_per_obstacle = 0;
var game_running = false;
var half_corridor_height = 0;
var obstacle_counter = 0;
var obstacles = [];
var player = {};
var smoke = [];
