const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const food_sound = new Audio("pickupCoin.wav");
const collision_sound = new Audio("collision.wav");

const cell_size = 40;
let grid_size = Math.floor(canvas.width / cell_size);

const snake_color = "#ebdbb2";
const food_color = "#cc241d";

let score = 0;

const food = {
    x: 0,
    y: 0,
};

const snake = {
    position: {
        x: 0,
        y: 0,
    },
    // top 0, right 1, bottom 2, left 3
    dir: 1,
    size: 0,
    tail: [],
};

function set_canvas_size(w, h) {
    canvas.width = w;
    canvas.height = h;
}

function clear_canvas(color) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_rectangle(0, 0, canvas.width, canvas.height, color, 4, "#98971a");
}

function draw_rectangle(x, y, w, h, color, stroke_width = 0, stroke_color = "") {
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

function draw_text(text, x, y, font_size, font_family, color) {
    ctx.font = `${font_size} ${font_family}`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function reset() {
    snake.position.x = cell_size / 2 * (grid_size - 1);
    snake.position.y = cell_size / 2 * (grid_size - 1);
    snake.size = 0;
    snake.tail = [];
    snake.dir = 1;

    score = 0;

    speed = 100;

    generate_food();
}

function check_collision(a_x, a_y, b_x, b_y) {
    if (Math.abs(a_x - b_x) < 1 && Math.abs(a_y - b_y) < 1) {
        return true;
    }
    
    return false;
}

function grow_snake() {
    snake.tail.unshift({ x: snake.position.x, y: snake.position.y});
    snake.size++;
}

function move_snake() {
    // Move the tail
    if (snake.size > 0) {
        for(let i = snake.size - 1; i > 0; i--) {
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
            snake.position.y -= grid_size;
            break;

        // Right
        case 1:
            snake.position.x += grid_size;
            break;
        
        // Down
        case 2:
            snake.position.y += grid_size;
            break;

        // Left    
        case 3:
            snake.position.x -= grid_size;
            break;
    }
}

function random(max) {
    return Math.floor(Math.random() * max);
}

function generate_food() {
    const rand_x = Math.floor(Math.random() * grid_size) * cell_size;
    const rand_y = Math.floor(Math.random() * grid_size) * cell_size;

    food.x = rand_x;
    food.y = rand_y;
}