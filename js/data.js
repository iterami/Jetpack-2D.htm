'use strict';

function load_data(id){
    frame_counter = 0;
    frames_per_obstacle = core_storage_data['obstacle-frequency'];
    core_mode = 1;
    half_corridor_height = core_storage_data['corridor-height'] / 2;

    entity_create({
      'id': 'player',
      'types': [
        'player',
      ],
    });
}
