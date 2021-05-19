const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);


function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function isRowFilled(rowArray) {
    for (let x = 0; x < rowArray.length; ++x) {
        if (rowArray[x] === 0) {
            return false;
        }
    }
    return true;
}

function getFilledRowsNumbers(array) {
    let result = [];
    for (let y = array.length -1; y > 0; --y) {
        if (isRowFilled(array[y])) {
            result.push(y);
        }
    }
    return result;
}
function deleteRowsNumbers(rowNumsArray) {
    let rowCount = 1;
    for(var i = 0; i < rowNumsArray.length; i += 1) {
        const row = arena.splice(rowNumsArray[i], 1)[0].fill(0);
        arena.unshift(row);

        player.score += rowCount * 10;
        rowCount += 2;
    }
} 

function arenaSweep() {
    let rowsToBeDeleted = getFilledRowsNumbers(arena);
    deleteRowsNumbers(rowsToBeDeleted);
}

function collide(arena, player) {
    const matrix = player.matrix;
    const playerPos = player.pos;
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < matrix[y].length; ++x) {
            if (matrix[y][x] !== 0 &&
               (arena[y + playerPos.y] &&
                arena[y + playerPos.y][x + playerPos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    for (var i = h; h > 0; h -= 1) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function drawMatrix(matrix, offset, w, h) {
    for (var row = 0 ; row < matrix.length; row += 1) {
        for( var col = 0; col < matrix[row].length; col += 1 ) {
            var value = matrix[row][col];
            if (value !== 0) {
                context.fillStyle = value !== -1 ? colors[value] : '#000';
                context.fillRect(col + offset.x,
                                 row + offset.y,
                                 w, h);
            }
        }
    }
}

function draw() {
    drawMatrix([[-1]], {x: 0, y: 0}, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0}, 1, 1);
    drawMatrix(player.matrix, player.pos, 1, 1);
}

function merge(arena, player) {
    for (var y = 0; y < player.matrix.length; y += 1) {
        for (var x = 0; x < player.matrix[y].length; x += 1) {
            var value = player.matrix[y][x];
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        for (var i = 0; i < matrix.length; i += 1) {
            matrix[i].reverse();
        }
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena = createMatrix(12, 20);
        player.score = 0;
        updateScore();
    }
}

function fillArrayWith(array, a) {
    for (var i = 0; i < array.length; i += 1) {
        array[i].fill(a);
    }
} 

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // стрелка влево
        playerMove(-1);
    } else if (event.keyCode === 39) { // стрелка вправо
        playerMove(1);
    } else if (event.keyCode === 40) { // стрелка вниз
        playerDrop();
    } else if (event.keyCode === 81) { // W
        playerRotate(-1);
    } else if (event.keyCode === 87) { // Q
        playerRotate(1);
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

arena = createMatrix(12, 20);

player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

playerReset();
updateScore();
update();
