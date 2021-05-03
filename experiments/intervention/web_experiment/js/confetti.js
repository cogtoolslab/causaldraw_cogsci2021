let canvas = document.getElementsByClassName('confetti')[0];

canvas.width = 1600;
canvas.height = 800;

let contextval = canvas.getContext('2d');
let pieces = [];
let NumOfPieces = 150;
let lastUpdateTime = Date.now();

function randColor () {
    let colors = ['#f00', '#0f0', '#00f', '#0ff', '#f0f', '#ff0'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function update () {
    let now = Date.now(),
        dt = now - lastUpdateTime;

    for (let i = pieces.length - 1; i >= 0; i--) {
        let p = pieces[i];

        if (p.y > canvas.height) {
            pieces.splice(i, 1);
            continue;
        }

        p.y += p.gravity * dt;
        p.rotation += p.rotationSpeed * dt;
    }


    while (pieces.length < NumOfPieces) {
        pieces.push(new Piece(Math.random() * canvas.width, -20));
    }

    lastUpdateTime = now;

    setTimeout(update, 1);
}

function draw () {
    contextval.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(function (p) {
        contextval.save();

        contextval.fillStyle = p.color;

        contextval.translate(p.x + p.size / 2, p.y + p.size / 2);
        contextval.rotate(p.rotation);

        contextval.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

        contextval.restore();
    });

    requestAnimationFrame(draw);
}

function Piece (x, y) {
    this.x = x;
    this.y = y;
    this.size = (Math.random() * 0.5 + 0.75) * 12;
    this.gravity = (Math.random() * 0.5 + 0.75) * 0.08;
    this.rotation = (Math.PI * 2) * Math.random();
    this.rotationSpeed = (Math.PI * 2) * (Math.random() - 0.5) * 0.0005;
    this.color = randColor();
}

while (pieces.length < NumOfPieces) {
    pieces.push(new Piece(Math.random() * canvas.width, Math.random() * canvas.height));
}

update();
draw();