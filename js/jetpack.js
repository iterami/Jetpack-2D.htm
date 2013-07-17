function draw(){
    if(game_running){
        frames += 1;

        // if new obstacle should be added this frame, add one
        if(frames % frames_per_obstacle === 0){
            i = random_number(15) + 20;
            obstacles.splice(
                0,
                0,
                [
                    x + i,
                    random_number(500) - 250,
                    i,
                    random_number(15) + 20
                ]
            );
        }

        // if obstacle frequency increase should happen this frame, do it
        if(settings[4] > 0 && frames_per_obstacle > 1 && frames % settings[4] === 0){
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

    if(settings[8]){// clear?
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
    if(game_running && key_jetpack){
        buffer.fillStyle = '#f00';
        buffer.fillRect(
            x - 22,
            y - player_y + 5,
            18,
            10
        );
    }

    // check if player is outside of game boundaries
    if(player_y + 25 > 250 || player_y - 25 < -250){
        game_running = 0;
        update_best();
    }

    i = obstacles.length - 1;
    if(i >= 0){
        if(game_running){
            do{
                // delete obstacles that are past left side of screen
                if(obstacles[i][0] < -x - 70){
                    obstacles.splice(i, 1);

                }else{
                    // move obstacles left
                    obstacles[i][0] -= 10;

                    // check for player collision with obstacle
                    if(obstacles[i][0] >= -30
                     && obstacles[i][0] <=  obstacles[i][2]
                     && obstacles[i][1] >= -player_y - 25 - obstacles[i][3] * 2
                     && obstacles[i][1] <= -player_y + 25){
                        game_running = 0;
                        update_best();
                    }
                }
            }while(i--);

            // get new amount of obstacles, some may have been spliced
            i = obstacles.length - 1;
        }

        // draw obstacles
        if(i >= 0){
            buffer.fillStyle = '#555';
            do{
                buffer.fillRect(
                    x + obstacles[i][0],
                    y + obstacles[i][1],
                    obstacles[i][2] * 2,
                    obstacles[i][3] * 2
                );
            }while(i--);
        }
    }

    i = smoke.length-1;
    if(i >= 0){
        if(game_running){
            // delete smoke trails past left side of screen, else move left
            do{
                if(smoke[i][0] < -x){
                    smoke.splice(i, 1);

                }else if(game_running){
                    smoke[i][0] -= 10;
                }
            }while(i--);

            // get new amount of smoke, some may have been spliced
            i = smoke.length - 1;
        }

        // draw smoke trails behind the player
        if(i >= 0){
            buffer.fillStyle = '#777';
            do{
                buffer.fillRect(
                    x + smoke[i][0],
                    y - smoke[i][1],
                    10,
                    10
                );
            }while(i--);
        }
    }

    // setup text display
    buffer.font = '23pt sans-serif';
    buffer.textAlign = 'center';
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

        i = y / 2;
        if(frames > best_display){
            buffer.fillText(
                'NEW BEST SCORE!',
                x,
                i - 60
            );
        }
        buffer.fillText(
            'You crashed... ☹',
            x,
            i
        );
        buffer.fillText(
            settings[7] + ' = Restart',// restart key
            x,
            i + 60
        );
        buffer.fillText(
            'ESC = Main Menu',
            x,
            i+120
        );
    }

    // top left text displays
    buffer.textAlign = 'left';
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

    if(settings[8]){// clear?
        canvas.clearRect(
            0,
            0,
            width,
            height
        );
    }
    canvas.drawImage(
        get('buffer'),
        0,
        0
    );
}

function get(i){
    return document.getElementById(i);
}

function random_number(i){
    return Math.floor(Math.random() * i);
}

function resize(){
    if(mode > 0){
        width = window.innerWidth;
        get('buffer').width = width;
        get('canvas').width = width;

        height = window.innerHeight;
        get('buffer').height = height;
        get('canvas').height = height;

        x = width / 2;
        y = height / 2;
    }
}

function save(){
    i = 3;
    do{
        if(isNaN(get(['ms-per-frame', 'obstacle-frequency', 'obstacle-increase', 'audio-volume'][i]).value)
              || get(['ms-per-frame', 'obstacle-frequency', 'obstacle-increase', 'audio-volume'][i]).value < [1, 1, 0, 0][i]){
            get('si').value = [
                30,
                23,
                115,
                1
            ][i];
        }
    }while(i--);

    i = 5;
    do{
        j = [
            'ms-per-frame',
            'gravity',
            'jetpack-power',
            'obstacle-frequency',
            'obstacle-increase',
            'audio-volume'
        ][i];

        if(isNaN(get(j).value) || get(j).value === [30, 1, 2, 23, 115, 1][i]){
            ls.removeItem('jetpack-' + i);
            settings[i] = [
                30,
                1,
                2,
                23,
                115,
                1
            ][i];
            get(j).value = settings[i];

        }else{
            settings[i] = parseFloat(get(j).value);
            ls.setItem(
                'jetpack-' + i,
                settings[i]
            );
        }
    }while(i--);


    if(get('jetpack-key').value === 'W'){
        ls.removeItem('jetpack-6');
        settings[6] = 'W';

    }else{
        settings[6] = get('jetpack-key').value;
        ls.setItem(
            'jetpack-6',
            settings[6]
        );
    }

    if(get('restart-key').value === 'H'){
        ls.removeItem('jetpack-7');
        settings[7] = 'H';

    }else{
        settings[7] = get('restart-key').value;
        ls.setItem(
            'jetpack-7',
            settings[7]
        );
    }

    settings[8] = get('clear').checked;
    if(settings[8]){
        ls.removeItem('jetpack-8');

    }else{
        ls.setItem(
            'jetpack-8',
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

        get('page').innerHTML='<canvas id=canvas></canvas>';
        buffer = get('buffer').getContext('2d');
        canvas = get('canvas').getContext('2d');

        resize();

        interval = setInterval('draw()', settings[0]);// ms/frame

    // main menu mode
    }else{
        buffer = 0;
        canvas = 0;

        get('page').innerHTML='<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><b>Jetpack</b></div><hr><div class=c><a onclick=setmode(1)>Cave Corridor</a> (Best: '
            + best + ')</div><hr><div class=c><a onclick="if(confirm(\'Reset best?\')){best=0;frames=0;update_best();setmode(0)}">Reset Best</a></div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c><input disabled size=9 style=border:0 value="Mouse Click">Activate Jetpack<br><input id=jetpack-key maxlength=1 size=9 value='
            + settings[6] + '>Activate Jetpack<br><input disabled size=9 style=border:0 value=ESC>Main Menu<br><input id=restart-key maxlength=1 size=9 value='
            + settings[7] + '>Restart</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
            + settings[5] + '>Audio<br><label><input '
            + (settings[8] ? 'checked ' : '')+'id=clear type=checkbox>Clear</label><br><a onclick="if(confirm(\'Reset settings?\')){get(\'clear\').checked=get(\'gravity\').value=get(\'audio-volume\').value=1;get(\'jetpack-key\').value=\'W\';get(\'restart-key\').value=\'H\';get(\'jetpack-power\').value=2;get(\'obstacle-frequency\').value=23;get(\'obstacle-increase\').value=115;get(\'ms-per-frame\').value=30;save();setmode(0)}">Reset Settings</a><br><a onclick="get(\'hack-span\').style.display=get(\'hack-span\').style.display===\'none\'?\'inline\':\'none\'">Hack</a><span id=hack-span style=display:none><br><br><input id=gravity size=1 value='
            + settings[1] + '>Gravity<br><input id=jetpack-power size=1 value='
            + settings[2] + '>Jetpack Power<br><input id=ms-per-frame size=1 value='
            + settings[0] + '>ms/Frame<br><input id=obstacle-frequency size=1 value='
            + settings[3] + '>Obstacle Frequency<br><input id=obstacle-increase size=1 value='
            + settings[4] + '>Obstacle Increase</span></div></div>';
    }
}

function update_best(){
    if(frames > best){
        best = frames;
    }

    if(best > 0){
        ls.setItem(
            'jetpack-best',
            best
        );

    }else{
        ls.removeItem('jetpack-best');
    }
}

var ls = window.localStorage;

var best = ls.getItem('jetpack-best') === null ? 0 : parseInt(ls.getItem('jetpack-best'));
var best_display = 0;
var buffer = 0;
var canvas = 0;
var frames = 0;
var game_running = 0;
var height = 0;
var i = 0;
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
    ls.getItem('jetpack-0') === null ?  30 : parseInt(ls.getItem('jetpack-0')),// ms/frame
    ls.getItem('jetpack-1') === null ?   1 : parseFloat(ls.getItem('jetpack-1')),// gravity
    ls.getItem('jetpack-2') === null ?   2 : parseFloat(ls.getItem('jetpack-2')),// jetpack power
    ls.getItem('jetpack-3') === null ?  23 : parseInt(ls.getItem('jetpack-3')),// obstacle frequency
    ls.getItem('jetpack-4') === null ? 115 : parseInt(ls.getItem('jetpack-4')),// obstacle increase
    ls.getItem('jetpack-5') === null ?   1 : parseFloat(ls.getItem('jetpack-5')),// audio volume
    ls.getItem('jetpack-6') === null ? 'W' : ls.getItem('jetpack-6'),// activate jetpack key
    ls.getItem('jetpack-7') === null ? 'H' : ls.getItem('jetpack-7'),// restart key
    ls.getItem('jetpack-8') === null// clear?
];
var smoke = [];
var width = 0;
var x = 0;
var y = 0;

setmode(0);

window.onkeydown = function(e){
    if(mode > 0){
        i = window.event ? event : e;
        i = i.charCode ? i.charCode : i.keyCode;

        if(String.fromCharCode(i) === settings[6]){// activate jetpack key
            key_jetpack = 1;

        }else if(String.fromCharCode(i) === settings[7]){// restart key
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

        }else if(i === 27){// ESC
            update_best();
            setmode(0);
        }
    }
};

window.onkeyup = function(e){
    i = window.event ? event : e;
    i = i.charCode ? i.charCode : i.keyCode;

    if(String.fromCharCode(i) === settings[6]){// activate jetpack key
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
