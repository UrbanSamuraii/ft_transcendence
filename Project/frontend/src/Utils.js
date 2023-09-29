export function drawGrid(ctx, offsetX, offsetY, gameWidth, gameHeight) {
    ctx.strokeStyle = 'grey';  // Color of the grid lines

    // Vertical lines
    for (let i = 0; i <= 100; i++) {
        const x = offsetX + i * gameWidth / 100;
        ctx.strokeStyle = (i % 10 === 0) ? 'red' : 'grey';
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, offsetY + gameHeight);
        ctx.stroke();
    }

    // If you want horizontal lines too:
    for (let i = 0; i <= 100; i++) {
        const y = offsetY + i * gameHeight / 100;
        ctx.strokeStyle = (i % 10 === 0) ? 'red' : 'grey';
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(offsetX + gameWidth, y);
        ctx.stroke();
    }
}