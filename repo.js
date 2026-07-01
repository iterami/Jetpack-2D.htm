'use strict';

function draw_obstacle(entity){
    canvas_setproperties({
      'fillStyle': '#555',
    });
    canvas.fillRect(
      entity.x,
      entity.y,
      entity.width * 2,
      entity.height * 2
    );
    canvas_setproperties({
      'fillStyle': '#fff',
    });
    canvas.fillText(
      entity.counter,
      entity.x,
      entity.y
    );
}

function draw_smoke(entity){
    canvas.fillRect(
      entity.x,
      -entity.y,
      10,
      10
    );
}

function move_obstacle(entity){
    entity.x -= core_storage_data.speed;

    if(entity.x > -entity.width * 2
      && entity.x < entity.width
      && entity.y > -entity_entities.player.y - 25 - entity.height * 2
      && entity.y < -entity_entities.player.y + 25){
        core_mode = 0;
    }

    if(entity.x < -canvas_properties.width_half - 70){
        entity_remove({
          'entities': [
            entity.id,
          ],
        });
    }
}

function move_smoke(entity){
    entity.x -= core_storage_data.speed;

    if(entity.x < -canvas_properties.width_half){
        entity_remove({
          'entities': [
            entity.id,
          ],
        });
    }
}

function repo_drawlogic(){
    if(!entity_entities.player){
        return;
    }

    canvas.save();
    canvas.translate(
      canvas_properties.width_half,
      canvas_properties.height_half
    );

    canvas_setproperties({
      'fillStyle': '#000',
    });
    canvas.fillRect(
      -canvas_properties.width_half,
      -half_corridor_height,
      canvas_properties.width,
      core_storage_data.corridor_height
    );

    canvas_setproperties({
      'fillStyle': core_storage_data.player_color,
    });
    canvas.fillRect(
      0,
      -entity_entities.player.y - 25,
      25,
      50
    );

    canvas_setproperties({
      'fillStyle': '#aaa',
    });
    canvas.fillRect(
      -25,
      -entity_entities.player.y - 15,
      25,
      20
    );

    if(core_mode === 1
      && (core_keys[core_storage_data.jump].state
        || core_pointer.down_0)){
        canvas_setproperties({
          'fillStyle': '#f00',
        });
        canvas.fillRect(
          -22,
          -entity_entities.player.y + 5,
          18,
          10
        );
    }

    entity_group_modify({
      'groups': [
        'obstacle',
      ],
      'todo': draw_obstacle,
    });

    canvas_setproperties({
      'fillStyle': '#777',
    });
    entity_group_modify({
      'groups': [
        'smoke',
      ],
      'todo': draw_smoke,
    });

    canvas.restore();

    if(core_mode === 0){
        canvas_setproperties({
          'fillStyle': '#f00',
        });
        canvas.fillText(
          'You crashed... ☹',
          0,
          125
        );
    }
}

function repo_escape(){
    if(!entity_entities.player
      && !core_menu_open){
        start();
    }
}

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': function(event){
            if(score !== 0){
                core_escape(true);
                event.preventDefault();
            }
        },
      },
      'events': {
        'start': {
          'onclick': start,
        },
      },
      'globals': {
        'frames_per_obstacle': 0,
        'half_corridor_height': 0,
        'obstacle_counter': 1,
        'score': 0,
        'smoke': [],
      },
      'info': '<button class=medium id=start type=button>Start New Flight</button><br>'
        + '<select id=level><option value=0>Cave Corridor</select>',
      'menu': true,
      'pointerbinds': {},
      'storage': {
        'corridor_height': 600,
        'gravity': .5,
        'jetpack_power': 1,
        'level': 0,
        'obstacle_frequency': 23,
        'obstacle_increase': 115,
        'player_color': '#206620',
        'speed': 7,
      },
      'storage_controls': true,
      'storage_menu': '<table><tr><td><input class=mini id=corridor_height min=1 step=any type=number><td>Corridor Height'
        + '<tr><td><input class=mini id=gravity step=any type=number><td>Gravity'
        + '<tr><td><input class=mini id=jetpack_power step=any type=number><td>Jetpack Power'
        + '<tr><td><input class=mini id=speed step=any type=number><td>Jetpack Speed'
        + '<tr><td><input class=mini id=obstacle_frequency min=1 step=1 type=number><td>Obstacle Frequency'
        + '<tr><td><input class=mini id=obstacle_increase min=0 step=1 type=number><td>Obstacle Increase'
        + '<tr><td><input id=player_color type=color><td>Player Color</table>',
      'title': 'Jetpack-2D.htm',
      'ui': ' <span id=score></span>',
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
    canvas_init({
      'cursor': 'pointer',
    });

    canvas_properties.clearColor = '#333';
}

function repo_load(id){
    core_mode = 1;
    score = 0;
    frames_per_obstacle = Math.floor(core_storage_data.obstacle_frequency);
    half_corridor_height = core_storage_data.corridor_height / 2;
    obstacle_counter = 1;

    entity_create({
      'id': 'player',
      'types': [
        'player',
      ],
    });
}

function repo_logic(){
    if(core_mode === 0){
        return;
    }

    if(entity_entities.player.y + 25 > half_corridor_height
      || entity_entities.player.y - 25 < -half_corridor_height){
        core_mode = 0;
        return;
    }

    core_ui_update({
      'ids': {
        'score': ++score,
      },
    });

    if(score % frames_per_obstacle === 0){
        const obstacle_width = core_random_integer(15) + 20;
        entity_create({
          'id': 'obstacle_' + obstacle_counter,
          'properties': {
            'counter': obstacle_counter++,
            'height': core_random_integer(15) + 20,
            'width': obstacle_width,
            'x': canvas_properties.width_half + obstacle_width,
            'y': core_random_integer(core_storage_data.corridor_height) - half_corridor_height,
          },
          'types': [
            'obstacle',
          ],
        });
    }

    if(core_storage_data.obstacle_increase > 0
      && frames_per_obstacle > 1
      && score % Math.floor(core_storage_data.obstacle_increase) === 0){
        frames_per_obstacle -= 1;
    }

    if(core_keys[core_storage_data.jump].state
      || core_pointer.down_0){
        entity_entities.player.speed += core_storage_data.jetpack_power;
        entity_create({
          'properties': {
            'y': entity_entities.player.y - 10,
          },
          'types': [
            'smoke',
          ],
        });

    }else{
        entity_entities.player.speed -= core_storage_data.gravity;
    }

    entity_entities.player.y += entity_entities.player.speed;

    entity_group_modify({
      'groups': [
        'obstacle',
      ],
      'todo': move_obstacle,
    });

    entity_group_modify({
      'groups': [
        'smoke',
      ],
      'todo': move_smoke,
    });
}

function start(){
    if(score !== 0
      && !globalThis.confirm('Start new flight?')){
        return;
    }
    canvas_setmode();
}
