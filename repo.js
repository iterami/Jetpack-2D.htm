'use strict';

function load_data(id){
    core_mode = 1;
    frame_counter = 0;
    frames_per_obstacle = core_storage_data['obstacle-frequency'];
    half_corridor_height = core_storage_data['corridor-height'] / 2;
    obstacle_counter = 0;

    entity_create({
      'id': 'player',
      'types': [
        'player',
      ],
    });
}

function repo_drawlogic(){
    if(!entity_entities['player']){
        return;
    }

    canvas.save();
    canvas.translate(
      canvas_properties['width-half'],
      canvas_properties['height-half']
    );

    canvas_setproperties({
      'properties': {
        'fillStyle': '#000',
      },
    });
    canvas.fillRect(
      -canvas_properties['width-half'],
      -half_corridor_height,
      canvas_properties['width'],
      core_storage_data['corridor-height']
    );

    canvas_setproperties({
      'properties': {
        'fillStyle': core_storage_data['color-positive'],
      },
    });
    canvas.fillRect(
      0,
      -entity_entities['player']['y'] - 25,
      25,
      50
    );

    canvas_setproperties({
      'properties': {
        'fillStyle': '#aaa',
      },
    });
    canvas.fillRect(
      -25,
      -entity_entities['player']['y'] - 15,
      25,
      20
    );

    if(core_mode === 1
      && core_keys[core_storage_data['jump']]['state']){
        canvas_setproperties({
          'properties': {
            'fillStyle': '#f00',
          },
        });
        canvas.fillRect(
          -22,
          -entity_entities['player']['y'] + 5,
          18,
          10
        );
    }

    entity_group_modify({
      'groups': [
        'obstacle',
      ],
      'todo': function(entity){
          canvas_setproperties({
            'properties': {
              'fillStyle': '#555',
            },
          });
          canvas.fillRect(
            entity_entities[entity]['x'],
            entity_entities[entity]['y'],
            entity_entities[entity]['width'] * 2,
            entity_entities[entity]['height'] * 2
          );
          canvas_setproperties({
            'properties': {
              'fillStyle': '#fff',
            },
          });
          canvas.fillText(
            entity_entities[entity]['counter'],
            entity_entities[entity]['x'],
            entity_entities[entity]['y']
          );
      },
    });

    canvas_setproperties({
      'properties': {
        'fillStyle': '#777',
      },
    });
    entity_group_modify({
      'groups': [
        'smoke',
      ],
      'todo': function(entity){
          canvas.fillRect(
            entity_entities[entity]['x'],
            -entity_entities[entity]['y'],
            10,
            10
          );
      },
    });

    canvas.restore();

    if(core_mode === 0){
        canvas_setproperties({
          'properties': {
            'fillStyle': '#f00',
          },
        });
        canvas.fillText(
          'You crashed... ☹',
          0,
          125
        );
    }
}

function repo_logic(){
    if(core_mode === 0){
        return;
    }

    if(entity_entities['player']['y'] + 25 > half_corridor_height
      || entity_entities['player']['y'] - 25 < -half_corridor_height){
        core_mode = 0;
        return;
    }

    frame_counter += 1;

    if(frame_counter % frames_per_obstacle === 0){
        const obstacle_width = core_random_integer({
          'max': 15,
        }) + 20;
        entity_create({
          'id': 'obstacle-' + obstacle_counter,
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

    if(core_storage_data['obstacle-frequency'] > 0
      && frames_per_obstacle > 1
      && frame_counter % core_storage_data['obstacle-increase'] === 0){
        frames_per_obstacle -= 1;
    }

    if(core_keys[core_storage_data['jump']]['state']){
        entity_entities['player']['speed'] += core_storage_data['jetpack-power'];
        entity_create({
          'properties': {
            'y': entity_entities['player']['y'] - 10,
          },
          'types': [
            'smoke',
          ],
        });

    }else{
        entity_entities['player']['speed'] -= core_storage_data['gravity'];
    }

    entity_entities['player']['y'] += entity_entities['player']['speed'];

    entity_group_modify({
      'groups': [
        'obstacle',
      ],
      'todo': function(entity){
          entity_entities[entity]['x'] -= core_storage_data['speed'];

          if(entity_entities[entity]['x'] > -entity_entities[entity]['width'] * 2
            && entity_entities[entity]['x'] < entity_entities[entity]['width']
            && entity_entities[entity]['y'] > -entity_entities['player']['y'] - 25 - entity_entities[entity]['height'] * 2
            && entity_entities[entity]['y'] < -entity_entities['player']['y'] + 25){
              core_mode = 0;
          }

          if(entity_entities[entity]['x'] < -canvas_properties['width-half'] - 70){
              entity_remove({
                'entities': [
                  entity,
                ],
              });
          }
      },
    });

    entity_group_modify({
      'groups': [
        'smoke',
      ],
      'todo': function(entity){
          entity_entities[entity]['x'] -= core_storage_data['speed'];

          if(entity_entities[entity]['x'] < -canvas_properties['width-half']){
              entity_remove({
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

function repo_escape(){
    if(!entity_entities['player']
      && !core_menu_open){
        core_repo_reset();
    }
}

function repo_init(){
    core_repo_init({
      'events': {
        'start': {
          'onclick': core_repo_reset,
        },
      },
      'globals': {
        'frame_counter': 0,
        'frames_per_obstacle': 0,
        'half_corridor_height': 0,
        'obstacle_counter': 0,
        'smoke': [],
      },
      'info': '<select id=level><option value=0>Cave Corridor</select><input id=start type=button value="Start New Flight">',
      'menu': true,
      'reset': canvas_setmode,
      'storage': {
        'corridor-height': 500,
        'gravity': 1,
        'jetpack-power': 2,
        'level': 0,
        'obstacle-frequency': 23,
        'obstacle-increase': 115,
        'speed': 10,
      },
      'storage-menu': '<table><tr><td><input class=mini id=corridor-height min=1 step=any type=number><td>Corridor Height'
        + '<tr><td><input class=mini id=gravity step=any type=number><td>Gravity'
        + '<tr><td><input class=mini id=jetpack-power step=any type=number><td>Jetpack Power'
        + '<tr><td><input class=mini id=speed step=any type=number><td>Jetpack Speed'
        + '<tr><td><input class=mini id=obstacle-frequency min=1 step=any type=number><td>Obstacle Frequency'
        + '<tr><td><input class=mini id=obstacle-increase min=1 step=any type=number><td>Obstacle Increase</table>',
      'title': 'Jetpack-2D.htm',
      'ui': 'Score: <span id=score></span>',
    });
    entity_set({
      'type': 'obstacle',
    });
    entity_set({
      'properties': {
        'x': -20,
      },
      'type': 'smoke',
    });
    entity_set({
      'properties': {
        'speed': 0,
      },
      'type': 'player',
    });
    canvas_init();

    canvas_properties['clearColor'] = '#333';
}
