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
