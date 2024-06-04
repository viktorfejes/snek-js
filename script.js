const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const food_sound = new Audio("assets/pickupCoin.wav");
const collision_sound = new Audio("assets/collision.wav");

const snake_color = "#ebdbb2";

var last_key;

const config = {
    canvas_padding: 20,
    cells: 20,
    food_amount: 3,
    snake_color: "#ebdbb2",
    food_color: [
        "#cc241d",
        "#458588",
        "#b16286",
        "#689d6a",
        "#98971a",
        "#d79921",
        "#d65d0e",
    ],
};

const GAME_STATE_PLAYING = 0;
const GAME_STATE_NEW = 1;
const GAME_STATE_PAUSED = 2;
const GAME_STATE_GAME_OVER = 3;

const state = {
    window: {
        width: 800,
        height: 800,
        aspect_ratio: 1,
    },
    canvas: {
        width: 800,
        height: 800,
        cell_size: 0,
    },
    game: {
        state: GAME_STATE_NEW,
        score: 0,
        is_paused: true,
        last_key: "",
        speed: 100,
        food: [],
        snake: {
            position: {
                x: 0,
                y: 0,
            },
            dir: 1,
            size: 0,
            tail: [],
        },
    },
};

function setup() {
    // Read in the window size
    state.window.width = document.documentElement.clientWidth;
    state.window.height = document.documentElement.clientHeight;

    // Calculate aspect ratio
    state.window.aspect_ratio = state.window.width / state.window.height;

    // Calculate canvas size
    state.canvas.width =
        state.window.width < state.window.height
            ? state.window.width - config.canvas_padding * 2
            : state.window.height - config.canvas_padding * 2;
    state.canvas.cell_size = state.canvas.width / config.cells;
    state.canvas.height = state.canvas.width;

    // Set the actual canvas sizes, applied to canvas
    canvas.width = state.canvas.width;
    canvas.height = state.canvas.height;

    // Add food in the amount set in config
    for (let i = 0; i < config.food_amount; i++) {
        add_food(state.game.food);
    }
}

function init() {
    setup();
}

function set_canvas_size(w, h) {
    const width = Math.min(w, max_canvas_size);

    canvas.width = width;
    canvas.height = width;
}

function clear_canvas(color) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_rectangle(0, 0, canvas.width, canvas.height, color, 0, "#98971a");
}

function draw_rectangle(
    x,
    y,
    w,
    h,
    color,
    stroke_width = 0,
    stroke_color = ""
) {
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    if (stroke_width > 0) {
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
    }
}

function draw_rectangle_rounded(
    x,
    y,
    w,
    h,
    radius,
    color,
    stroke_width = 0,
    stroke_color = ""
) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    if (stroke_width > 0) {
        ctx.lineWidth = stroke_width;
        ctx.strokeStyle = stroke_color;
        ctx.stroke();
    }
}

function draw_line(x1, y1, x2, y2, thickness, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function draw_debug_grid() {
    for (let i = 0; i < config.cells; i++) {
        draw_line(
            state.canvas.cell_size * i,
            0,
            state.canvas.cell_size * i,
            canvas.height,
            1,
            "#3c3836"
        );
        draw_line(
            0,
            state.canvas.cell_size * i,
            canvas.width,
            state.canvas.cell_size * i,
            1,
            "#3c3836"
        );
    }
}

function draw_text(text, x, y, font_size, font_family, color) {
    ctx.font = `${font_size} ${font_family}`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function reset() {
    const snake = state.game.snake;

    snake.position.x = (config.cells / 2) * state.canvas.cell_size;
    snake.position.y = (config.cells / 2) * state.canvas.cell_size;
    snake.size = 0;
    snake.tail = [];
    snake.dir = 0;

    state.game.score = 0;
}

function is_colliding(a_x, a_y, b_x, b_y) {
    if (Math.abs(a_x - b_x) < 1 && Math.abs(a_y - b_y) < 1) {
        return true;
    }

    return false;
}

function grow_snake() {
    const snake = state.game.snake;

    snake.tail.unshift({ x: snake.position.x, y: snake.position.y });
    snake.size++;
}

function pos_to_grid(x) {
    return Math.floor(x / cell_width) * cell_width;
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function add_food(arr) {
    const rand_x =
        Math.floor(Math.random() * config.cells) * state.canvas.cell_size;
    const rand_y =
        Math.floor(Math.random() * config.cells) * state.canvas.cell_size;
    const color = config.food_color[random(config.food_color.length)];

    arr.push({ x: rand_x, y: rand_y, color: color });
}

function remove_food(arr, index) {
    arr.splice(index, 1);
}

function move_snake() {
    const snake = state.game.snake;

    // Move the tail
    if (snake.size > 0) {
        for (let i = snake.size - 1; i > 0; i--) {
            snake.tail[i].x = snake.tail[i - 1].x;
            snake.tail[i].y = snake.tail[i - 1].y;
        }
        snake.tail[0].x = snake.position.x;
        snake.tail[0].y = snake.position.y;
    }

    // Move the head
    switch (snake.dir) {
        // Up
        case 0:
            snake.position.y -= state.canvas.cell_size;
            break;

        // Right
        case 1:
            snake.position.x += state.canvas.cell_size;
            break;

        // Down
        case 2:
            snake.position.y += state.canvas.cell_size;
            break;

        // Left
        case 3:
            snake.position.x -= state.canvas.cell_size;
            break;
    }
}

function on_resize(e) {}

function on_key_down(e) {
    if (e.code == "Space") {
        pause_game();
    }

    last_key = e.code;
}

function pause_game() {
    state.game.state = GAME_STATE_PAUSED;
    state.game.is_paused = true;
}

function poll_input() {
    const snake = state.game.snake;

    switch (last_key) {
        case "ArrowUp":
        case "KeyW":
            {
                snake.dir = snake.dir != 2 ? 0 : snake.dir;
            }
            break;
        case "ArrowRight":
        case "KeyD":
            {
                snake.dir = snake.dir != 3 ? 1 : snake.dir;
            }
            break;
        case "ArrowDown":
        case "KeyS":
            {
                snake.dir = snake.dir != 0 ? 2 : snake.dir;
            }
            break;
        case "ArrowLeft":
        case "KeyA":
            {
                snake.dir = snake.dir != 1 ? 3 : snake.dir;
            }
            break;
    }
}

function check_collisions() {
    const snake = state.game.snake;
    const food = state.game.food;

    // Check if we collide with any of the food
    for (let i = 0; i < food.length; i++) {
        const food_collision = is_colliding(
            snake.position.x,
            snake.position.y,
            food[i].x,
            food[i].y
        );
        if (food_collision) {
            // Play audio
            food_sound.play();

            // Remove food
            remove_food(food, i);
            // Add new food
            add_food(food);

            // Increment score
            state.game.score++;

            // Make snake bigger
            grow_snake();

            // Speed-up game
            state.game.speed = 100 * Math.exp(-0.01 * state.game.score);
        }
    }

    // Check boundaries collision
    if (
        snake.position.x < -1e-7 ||
        snake.position.x + state.canvas.cell_size > canvas.width ||
        snake.position.y < -1e-7 ||
        snake.position.y + state.canvas.cell_size > canvas.height
    ) {
        collision_sound.play();
        // state.game.is_paused = true;
        reset();
    }

    // Check self-collision
    for (let i = 2; i < snake.size; i++) {
        if (
            is_colliding(
                snake.position.x,
                snake.position.y,
                snake.tail[i].x,
                snake.tail[i].y
            )
        ) {
            collision_sound.play();
            reset();
        }
    }
}

function start_game() {
    state.game.state = GAME_STATE_PLAYING;
    state.game.is_paused = false;

    document.removeEventListener("pointerdown", start_game);
}

function draw_new_screen() {
    // Clear canvas
    clear_canvas("#282828");

    // Draw title
    const title_font_size = state.canvas.width * 0.035;
    draw_text(
        "gruv_snek!",
        canvas.width - canvas.width * 0.225,
        canvas.height * 0.05,
        `bold ${title_font_size}px`,
        "Fira Code",
        "#3c3836"
    );

    // Draw made-by
    const made_txt = "made by Viktor Fejes";
    ctx.font = "18px Fira Code";
    const made_w = ctx.measureText(made_txt).width;
    draw_text(
        made_txt,
        canvas.width / 2 - made_w / 2,
        canvas.height - 20,
        "18px",
        "Fira Code",
        "#504945"
    );

    // Draw new game button
    const button_width = canvas.width * 0.4;
    const button_height = button_width * 0.33;
    draw_rectangle_rounded(
        canvas.width / 2 - button_width / 2,
        canvas.height / 2 - button_height / 2,
        button_width,
        button_height,
        10,
        "#458588"
    );
    const new_txt = "Start!";
    const new_btn_font_size = state.canvas.width * 0.05;
    ctx.font = `bold ${new_btn_font_size}px Fira Code`;
    const new_w = ctx.measureText(new_txt).width;
    draw_text(
        new_txt,
        canvas.width / 2 - new_w / 2,
        canvas.height / 2 + canvas.height * 0.015,
        `bold ${new_btn_font_size}px`,
        "Fira Code",
        "#ebdbb2"
    );

    document.addEventListener("pointerdown", start_game);
}

function draw_paused_screen() {
    // Clear canvas
    clear_canvas("#282828");

    // Draw title
    const title_font_size = state.canvas.width * 0.035;
    draw_text(
        "gruv_snek!",
        canvas.width - canvas.width * 0.225,
        canvas.height * 0.05,
        `bold ${title_font_size}px`,
        "Fira Code",
        "#3c3836"
    );

    // Draw made-by
    const made_txt = "made by Viktor Fejes";
    ctx.font = "18px Fira Code";
    const made_w = ctx.measureText(made_txt).width;
    draw_text(
        made_txt,
        canvas.width / 2 - made_w / 2,
        canvas.height - 20,
        "18px",
        "Fira Code",
        "#504945"
    );

    // Draw new game button
    const button_width = canvas.width * 0.4;
    const button_height = button_width * 0.33;
    draw_rectangle_rounded(
        canvas.width / 2 - button_width / 2,
        canvas.height / 2 - button_height / 2,
        button_width,
        button_height,
        10,
        "#458588"
    );
    const new_txt = "Start!";
    const new_btn_font_size = state.canvas.width * 0.05;
    ctx.font = `bold ${new_btn_font_size}px Fira Code`;
    const new_w = ctx.measureText(new_txt).width;
    draw_text(
        new_txt,
        canvas.width / 2 - new_w / 2,
        canvas.height / 2 + canvas.height * 0.015,
        `bold ${new_btn_font_size}px`,
        "Fira Code",
        "#ebdbb2"
    );

    document.addEventListener("pointerdown", start_game);
}

function show_pause_screen() {
    switch (state.game.state) {
        case GAME_STATE_NEW:
            draw_new_screen();
            break;
        case GAME_STATE_PAUSED:
            draw_paused_screen();
            break;
        case GAME_STATE_GAME_OVER:
            draw_go_screen();
            break;
    }
}

function update() {
    poll_input();
    check_collisions();
    move_snake();
}

function render() {
    // Clear canvas
    clear_canvas("#282828");

    // Debug grid
    // draw_debug_grid();

    const snake = state.game.snake;
    const food = state.game.food;

    // Draw title
    const title_font_size = state.canvas.width * 0.035;
    draw_text(
        "gruv_snek!",
        canvas.width - canvas.width * 0.225,
        canvas.height * 0.05,
        `bold ${title_font_size}px`,
        "Fira Code",
        "#3c3836"
    );

    // Draw made-by
    const made_txt = "made by Viktor Fejes";
    ctx.font = "18px Fira Code";
    const made_w = ctx.measureText(made_txt).width;
    draw_text(
        made_txt,
        canvas.width / 2 - made_w / 2,
        canvas.height - 20,
        "18px",
        "Fira Code",
        "#504945"
    );

    // Draw score
    ctx.font = "48px Fira Code";
    const score_width = ctx.measureText(state.game.score).width;
    draw_text(
        state.game.score,
        canvas.width / 2 - score_width / 2,
        48,
        "48px",
        "Fira Code",
        "#d79921"
    );

    // Draw food
    for (let i = 0; i < food.length; i++) {
        draw_rectangle(
            food[i].x,
            food[i].y,
            state.canvas.cell_size,
            state.canvas.cell_size,
            food[i].color
        );
    }

    // Draw snake
    draw_rectangle(
        snake.position.x,
        snake.position.y,
        state.canvas.cell_size,
        state.canvas.cell_size,
        snake_color,
        1,
        "#a89984"
    );
    for (let i = 0; i < snake.size; i++) {
        draw_rectangle(
            snake.tail[i].x,
            snake.tail[i].y,
            state.canvas.cell_size,
            state.canvas.cell_size,
            snake_color,
            1,
            "#a89984"
        );
    }
}

function run() {
    if (!state.game.is_paused) {
        update();
        render();
    } else {
        show_pause_screen();
    }

    setTimeout(run, state.game.speed);
}

window.addEventListener("resize", on_resize);
window.addEventListener("keydown", on_key_down);

window.addEventListener("DOMContentLoaded", (e) => {
    init();
    run();
});
