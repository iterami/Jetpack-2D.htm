'use strict';

function draw_logic(){
    canvas_buffer.save();
    canvas_buffer.translate(
      canvas_properties['width-half'],
      canvas_properties['height-half']
    );

    // Draw corridor over background.
    canvas_setproperties({
      'properties': {
        'fillStyle': '#000',
      },
    });
    canvas_buffer.fillRect(
      -canvas_properties['width-half'],
      -half_corridor_height,
      canvas_properties['width'],
      core_storage_data['corridor-height']
    );

    // Draw player body.
    canvas_setproperties({
      'properties': {
        'fillStyle': core_storage_data['color-positive'],
      },
    });
    canvas_buffer.fillRect(
      0,
      -core_entities['player']['y'] - 25,
      25,
      50
    );

    // Draw jetpack.
    canvas_setproperties({
      'properties': {
        'fillStyle': '#aaa',
      },
    });
    canvas_buffer.fillRect(
      -25,
      -core_entities['player']['y'] - 15,
      25,
      20
    );

    // Draw activated jetpack fire.
    if(game_running
      && core_keys[core_storage_data['jump']]['state']){
        canvas_setproperties({
          'properties': {
            'fillStyle': '#f00',
          },
        });
        canvas_buffer.fillRect(
          -22,
          -core_entities['player']['y'] + 5,
          18,
          10
        );
    }

    // Draw obstacles.
    core_group_modify({
      'groups': [
        'obstacle',
      ],
      'todo': function(entity){
          canvas_setproperties({
            'properties': {
              'fillStyle': '#555',
            },
          });
          canvas_buffer.fillRect(
            core_entities[entity]['x'],
            core_entities[entity]['y'],
            core_entities[entity]['width'] * 2,
            core_entities[entity]['height'] * 2
          );
          canvas_setproperties({
            'properties': {
              'fillStyle': '#fff',
            },
          });
          canvas_buffer.fillText(
            core_entities[entity]['counter'],
            core_entities[entity]['x'],
            core_entities[entity]['y']
          );
      },
    });

    // Draw smoke trails behind the player.
    canvas_setproperties({
      'properties': {
        'fillStyle': '#777',
      },
    });
    core_group_modify({
      'groups': [
        'smoke',
      ],
      'todo': function(entity){
          canvas_buffer.fillRect(
            core_entities[entity]['x'],
            -core_entities[entity]['y'],
            10,
            10
          );
      },
    });

    canvas_buffer.restore();

    // If game is over, display game over messages.
    if(!game_running){
        canvas_setproperties({
          'properties': {
            'fillStyle': '#f00',
          },
        });
        canvas_buffer.fillText(
          'You crashed... ☹',
          0,
          125
        );
    }
}

function logic(){
    if(!game_running){
        return;
    }

    // Check if player is outside of game boundaries.
    if(core_entities['player']['y'] + 25 > half_corridor_height
      || core_entities['player']['y'] - 25 < -half_corridor_height){
        game_running = false;
        return;
    }

    frame_counter += 1;

    // If new obstacle should be added this frame, add one.
    if(frame_counter % frames_per_obstacle === 0){
        let obstacle_width = core_random_integer({
          'max': 15,
        }) + 20;
        core_entity_create({
          'properties': {
            'counter': obstacle_counter++,
            'height': core_random_integer({
              'max': 15,
            }) + 20,
            'width': obstacle_width,
            'x': canvas_properties['width-half'] + obstacle_width,
            'y': core_random_integer({
              'max': core_storage_data['corridor-height'],
            }) - half_corridor_height,
          },
          'types': [
            'obstacle',
          ],
        });
    }

    // If obstacle frequency increase should happen this frame, do it.
    if(core_storage_data['obstacle-frequency'] > 0
      && frames_per_obstacle > 1
      && frame_counter % core_storage_data['obstacle-increase'] === 0){
        // obstacle frequency increase
        frames_per_obstacle -= 1;
    }

    // If the player has activated jetpack, increase y speed and add smoke...
    if(core_keys[core_storage_data['jump']]['state']){
        core_entities['player']['speed'] += core_storage_data['jetpack-power'];
        core_entity_create({
          'properties': {
            'y': core_entities['player']['y'] - 10,
          },
          'types': [
            'smoke',
          ],
        });

    // ...else apply gravity.
    }else{
        core_entities['player']['speed'] -= core_storage_data['gravity'];
    }

    core_entities['player']['y'] += core_entities['player']['speed'];

    core_group_modify({
      'groups': [
        'obstacle',
      ],
      'todo': function(entity){
          // Move obstacles left at speed.
          core_entities[entity]['x'] -= core_storage_data['speed'];

          // Check for player collision with obstacle.
          if(core_entities[entity]['x'] > -core_entities[entity]['width'] * 2
            && core_entities[entity]['x'] < core_entities[entity]['width']
            && core_entities[entity]['y'] > -core_entities['player']['y'] - 25 - core_entities[entity]['height'] * 2
            && core_entities[entity]['y'] < -core_entities['player']['y'] + 25){
              game_running = false;
          }

          // Delete obstacles that are past left side of screen.
          if(core_entities[entity]['x'] < -canvas_properties['width-half'] - 70){
              core_entity_remove({
                'entities': [
                  entity,
                ],
              });
          }
      },
    });

    // Delete smoke trails past left side of screen.
    core_group_modify({
      'groups': [
        'smoke',
      ],
      'todo': function(entity){
          core_entities[entity]['x'] -= core_storage_data['speed'];

          if(core_entities[entity]['x'] < -canvas_properties['width-half']){
              core_entity_remove({
                'entities': [
                  entity,
                ],
              });
          }
      },
    });

    core_ui_update({
      'ids': {
        'score': frame_counter,
      },
    });
}

function repo_init(){
    core_repo_init({
      'entities': {
        'obstacle': {},
        'player': {
          'properties': {
            'speed': 0,
          },
        },
        'smoke': {
          'properties': {
            'x': -20,
          },
        },
      },
      'events': {
        'start': {
          'onclick': function(){
              canvas_setmode({
                'newgame': true,
              });
          },
        },
      },
      'globals': {
        'frame_counter': 0,
        'frames_per_obstacle': 0,
        'game_running': 0,
        'half_corridor_height': 0,
        'obstacle_counter': 0,
        'smoke': [],
      },
      'info': '<select id=level><option value=0>Cave Corridor</option></select><input id=start type=button value="Start New Flight">',
      'keybinds': {
        72: {
          'todo': canvas_setmode,
        },
      },
      'menu': true,
      'storage': {
        'corridor-height': 500,
        'gravity': 1,
        'jetpack-power': 2,
        'level': 0,
        'obstacle-frequency': 23,
        'obstacle-increase': 115,
        'speed': 10,
      },
      'storage-menu': '<table><tr><td><input id=corridor-height><td>Corridor Height<tr><td><input id=gravity><td>Gravity<tr><td><input id=jetpack-power><td>Jetpack Power<tr><td><input id=speed><td>Jetpack Speed<tr><td><input id=obstacle-frequency><td>Obstacle Frequency<tr><td><input id=obstacle-increase><td>Obstacle Increase</table>',
      'title': 'Jetpack-2D.htm',
      'ui': 'Score: <span id=score></span>',
    });
    canvas_init();

    canvas_properties['clearColor'] = '#333';
}
