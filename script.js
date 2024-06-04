let last_time = 0;
var speed = 100;
const interval = 1000 / speed;
var paused = false;

var last_key;

function init() {
    // set_canvas_size(
    //     document.documentElement.clientWidth,
    //     document.documentElement.clientHeight
    // );
    // Generate food at random position
    reset();
}

function on_resize(e) {
    // set_canvas_size(
    //     document.documentElement.clientWidth,
    //     document.documentElement.clientHeight
    // );

    grid_size = Math.floor(canvas.width / cell_size);
}

function on_key_down(e) {
    last_key = e.code;
}

function poll_input() {
    switch (last_key) {
        case "KeyW": {
            snake.dir = (snake.dir != 2) ? 0 : snake.dir;
        } break;
        case "KeyD": {
            snake.dir = (snake.dir != 3) ? 1 : snake.dir;
        } break;
        case "KeyS": {
            snake.dir = (snake.dir != 0) ? 2 : snake.dir;
        } break;
        case "KeyA": {
            snake.dir = (snake.dir != 1) ? 3 : snake.dir;
        } break;
    }
}

function update() {
    poll_input();

    move_snake();

    // Check food and snake collision
    if(check_collision( snake.position.x, snake.position.y, food.x, food.y, )) {
        // Play audio
        food_sound.play();
        
        // Increment score
        score++;
        // Make snake bigger
        grow_snake();
        // Speed-up game
        speed = 100 * Math.exp(-0.01 * score);
        console.log(speed);
        // Change food
        generate_food();
    }

    // Check boundaries collision
    if(snake.position.x < 0 || snake.position.x > canvas.width - grid_size || snake.position.y < 0 || snake.position.y > canvas.height - grid_size) {
        collision_sound.play();
        // paused = true;
        reset();
    }

    // Check self-collision
    for(let i = 2; i < snake.size; i++) {
        if (check_collision(snake.position.x, snake.position.y, snake.tail[i].x, snake.tail[i].y)) {
            collision_sound.play();
            reset();
        }
    }
}

function render() {
    // Clear canvas
    clear_canvas("#282828");

    // Draw score
    draw_text(score, canvas.width / 2, 48, "48px", "Fira Code", "#d79921");

    // Draw food
    draw_rectangle(
        food.x,
        food.y,
        grid_size,
        grid_size,
        food_color
    );

    // Draw snake
    draw_rectangle(
        snake.position.x,
        snake.position.y,
        grid_size,
        grid_size,
        snake_color,
        1,
        "#a89984"
    );
    for(let i = 0; i < snake.size; i++) {
        draw_rectangle(
            snake.tail[i].x,
            snake.tail[i].y,
            grid_size,
            grid_size,
            snake_color,
            1,
            "#a89984"
        );
    }
}

// const MS_PER_UPDATE = 16.6;
// let previous = performance.now();
// let lag = 0.0;
// while (true) {
//     let current = performance.now();
//     let elapsed = current - previous;
//     lag += elapsed;

//     while (lag >= MS_PER_UPDATE) {
//         update();
//         lag -= MS_PER_UPDATE;
//     }
    
//     render();
// }

function run() {
    update();
    render();

    setTimeout(run, speed);
}

// function run(current_time) {
    
//     const dt = current_time - last_time;
    
//     if(!paused) {
//         if(dt >= interval) {
//             last_time = current_time;
//             update();
//         }
        
//         render();
//         window.requestAnimationFrame(run);
//     }
// }

window.addEventListener("resize", on_resize);
window.addEventListener("keydown", on_key_down);

window.addEventListener("DOMContentLoaded", (e) => {
    init();
    run();
})