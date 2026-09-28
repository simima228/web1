function isHit({x, y, r}) {
    const rectangle = x >= 0 && x <= r / 2 && y <= 0 && y >= -r;
    const triangle = x >= 0 && y >= 0 && x + 2 * y <= r;
    const circle = x <= 0 && y >= 0 && x * x + y * y <= r * r / 4;
    return rectangle || triangle || circle;
}

function validate({x, y, r}) {
    const errors = {};
    if (x === null) {
        errors.x = "Введите X";
    } else if (x < -5 || x > 5) {
        errors.x = "X должен быть в диапазоне от -5 до 5 включительно"
    }
    if (y === null) {
        errors.y = "Введите Y";
    } else if (!Array.from({length: 9}, (_, i) => -2 + i * 0.5).includes(y)) {
        errors.y = "Y должен быть в диапазоне от -2 до 2 включительно"
    }
    if (r === null) {
        errors.r = "Введите R";
    } else if (!Array.from({length: 5}, (_, i) => i + 1).includes(r)) {
        errors.r = "R должен быть в диапазоне от 1 до 5 включительно"
    }
    return errors;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d")
const SIZE = 400;
const PADDING = 20;
const UNIT_RATIO = 0.35;
const CENTER = SIZE / 2;
const MINOR = 0.5;
const MAJOR = 1;

const points = [];

let hover = null;

function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function step() {
    return (SIZE / 2 - PADDING) * UNIT_RATIO * 2 / getCurrentR();
}

function toCanvasX(x) { return CENTER + x * step(); }
function toCanvasY(y) { return CENTER - y * step(); }

function getCurrentR() {
    return parseFloat(document.querySelector('input[name="r"]:checked')?.value || 2);
}
function drawGrid() {
    const s = step();

    ctx.save();
    ctx.lineWidth = 1;

    for (const [unitStep, color] of [[MINOR, css("--grid-light")], [MAJOR, css("--grid")]]) {
        const cell = unitStep * s;
        if (cell < 6) {
            continue;
        }
        const n = Math.ceil(CENTER / cell);

        ctx.strokeStyle = color;
        ctx.beginPath();

        for (let i = -n; i <= n; i++) {
            if (i === 0) {
                continue
            }
            if (unitStep === MINOR && i % 2 === 0) {
                continue;
            }

            const v = Math.round(toCanvasX(i * unitStep)) + 0.5;
            const h = Math.round(toCanvasY(i * unitStep)) + 0.5;
            ctx.moveTo(v, 0);
            ctx.lineTo(v, SIZE);
            ctx.moveTo(0, h);
            ctx.lineTo(SIZE, h);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawArea() {
    const r = getCurrentR();
    const s = step();

    ctx.save();
    ctx.fillStyle = css("--outline-blue");
    ctx.globalAlpha = 0.35;

    ctx.fillRect(toCanvasX(0), toCanvasY(0), (r / 2) * s, r * s);

    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(r), toCanvasY(0));
    ctx.lineTo(toCanvasX(0), toCanvasY(r / 2));
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.arc(toCanvasX(0), toCanvasY(0), (r / 2) * s, Math.PI, 3 * Math.PI / 2, false);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}
function drawArrow(ctx, fromX, fromY, toX, toY, options = {}) {
    const {
        length = 12,
        width = 5,
        notch = 3,
        color = css("--border-blue"),
    } = options;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(toX, toY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-length, -width);
    ctx.lineTo(-length + notch, 0);
    ctx.lineTo(-length, width);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawAxis(ctx, x1, y1, x2, y2, options = {}) {
    const {color = css("--border-blue"), lineWidth = 2, length = 12} = options;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const endX = x2 - Math.cos(angle) * length;
    const endY = y2 - Math.sin(angle) * length;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    drawArrow(ctx, x1, y1, x2, y2, { color, length, ...options });
}

function drawLabels() {
    const r = getCurrentR();
    const labels = [
        [r, "R"],
        [r / 2, "R/2"],
        [-r / 2, "-R/2"],
        [-r, "-R"],
    ]
    ctx.save();
    ctx.font = "12px Rubik, sans-serif";

    for (const [value, label] of labels) {
        const px = toCanvasX(value);
        const py = toCanvasY(value);

        ctx.strokeStyle = css("--border-blue");
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + 0.5, CENTER - 6);
        ctx.lineTo(px + 0.5, CENTER + 6);
        ctx.moveTo(CENTER - 6, py + 0.5);
        ctx.lineTo(CENTER + 6, py + 0.5);
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = css("--canvas-bg");
        ctx.fillStyle = css("--blue");

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.strokeText(label, px, CENTER + 9);
        ctx.fillText(label, px, CENTER + 9);

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.strokeText(label, CENTER - 9, py);
        ctx.fillText(label, CENTER - 9, py);
    }

    ctx.fillStyle = css("--border-blue");
    ctx.font = "500 14px Rubik, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("X", SIZE - PADDING, CENTER + 9);
    ctx.textAlign = "left";
    ctx.fillText("Y", CENTER + 9, PADDING);

    ctx.restore();
}
function drawPoints() {
    const r = getCurrentR();

    ctx.save();
    for (const p of points) {
        const px = toCanvasX(p.x);
        const py = toCanvasY(p.y);
        if (px < 0 || px > SIZE || py < 0 || py > SIZE) {
            continue;
        }

        const hit = isHit({x: p.x, y: p.y, r});
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);

        if (hit) {
            ctx.fillStyle = css("--hit");
            ctx.fill();
            ctx.strokeStyle = css("--canvas-bg");
        } else {
            ctx.fillStyle = css("--canvas-bg");
            ctx.fill();
            ctx.strokeStyle = css("--miss");
        }
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    ctx.restore();
}

function drawCrosshair() {
    if (!hover) {
        return;
    }

    ctx.save();
    ctx.strokeStyle = css("--outline-blue");
    ctx.globalAlpha = 0.75;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hover.px, 0);
    ctx.lineTo(hover.px, SIZE);
    ctx.moveTo(0, hover.py);
    ctx.lineTo(SIZE, hover.py);
    ctx.stroke();
    ctx.restore();
}

function drawPlane() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    drawGrid();
    drawArea();
    drawAxis(ctx, PADDING, CENTER, SIZE - PADDING, CENTER);
    drawAxis(ctx, CENTER, SIZE - PADDING, CENTER, PADDING);
    drawLabels();
    drawPoints();
    drawCrosshair();

}

function pointerToMath(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const px = (event.clientX - rect.left) * scale;
    const py = (event.clientY - rect.top) * scale;
    return {
        px, py,
        x: (px - CENTER) / step(),
        y: (CENTER - py) / step(),
    };
}

canvas.addEventListener("pointermove", (event) => {
    hover = pointerToMath(event);
    drawPlane();
});

canvas.addEventListener("pointerleave", (event) => {
    hover = null;
    drawPlane();
});

canvas.addEventListener("click", (event) => {
    const {x, y} = pointerToMath(event);
    points.push({
        x: Number(x.toFixed(3)),
        y: Number(y.toFixed(3)),
        r: getCurrentR(),
    });
    drawPlane();
});
document.querySelectorAll('input[name="r"]').forEach(radio => {
    radio.addEventListener('change', drawPlane)
});

drawPlane();
