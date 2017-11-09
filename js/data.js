'use strict';

function load_data(id){
    frame_counter = 0;
    frames_per_obstacle = core_storage_data['obstacle-frequency'];
    game_running = true;
    half_corridor_height = core_storage_data['corridor-height'] / 2;

    core_entity_create({
      'id': 'player',
      'types': [
        'player',
      ],
    });
}
