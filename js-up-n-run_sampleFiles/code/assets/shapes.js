// Draw Shapes
// Time-stamp: <2019-09-09 12:28:47 Chuck Siska>
// ------------------------------------------------------------

// FUN. Draw filled rect.
function draw_shapes( ctx )
{
    // List 2-5.
    ctx.save( );
    ctx.beginPath();

    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#00FF00";
    ctx.lineWidth = 2;

    // UR Triangle Pair.
    ctx.moveTo(50, 50);
    ctx.lineTo(150, 250);
    ctx.lineTo(250, 170);
    ctx.lineTo(320, 280);
    ctx.closePath; // optional.
    ctx.stroke();
    // UR Text Coords for Triangle Pair 
    ctx.fillText("(5, 5)", 30, 40);
    ctx.fillText("(15, 25)", 130, 260);
    ctx.fillText("(25, 17)", 255, 175);
    ctx.fillText("(32, 28)", 320, 280);
    ctx.fill();

    // Listing 2-6. -------------------- Closed Shapes
    ctx.beginPath()

    // BL Triangle.
    ctx.moveTo(50, 250);
    ctx.lineTo(50, 350);
    ctx.lineTo(150, 350);
    ctx.closePath();

    // BR Triangle.
    ctx.moveTo(180, 360);
    ctx.lineTo(270, 360);
    ctx.lineTo(270, 310);
    ctx.closePath();

    // UR Triangle.
    ctx.moveTo(250, 50);
    ctx.lineTo(370, 50);
    ctx.lineTo(370, 100);
    ctx.closePath();

    ctx.strokeStyle = "#FFFF00";
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.stroke();

    // Listing 2-7. -------------------- Adding Curves
    ctx.beginPath()

    // BL Triangle.
    ctx.moveTo(150, 250);
    ctx.quadraticCurveTo(25, 300, 50, 350);
    ctx.quadraticCurveTo(100, 375, 150, 350);
    ctx.closePath();

    // BR Triangle.
    ctx.moveTo(230, 360);
    ctx.quadraticCurveTo(255, 340, 270, 360);
    ctx.quadraticCurveTo(255, 340, 270, 310);
    ctx.closePath();

    // UR Triangle.
    ctx.moveTo(250, 170);
    ctx.quadraticCurveTo(310, 60, 370, 50);
    ctx.quadraticCurveTo(400, 75, 370, 100);
    ctx.closePath();

    ctx.strokeStyle = "#FFFF00";
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.stroke();

    // Listing 2-8. -------------------- Bezier Curves
    ctx.beginPath();

    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#00FF00";
    ctx.lineWidth = 2;

    // UR Triangle Pair.
    ctx.moveTo(50, 50);
    ctx.bezierCurveTo(0, 0, 80, 250, 150, 250);
    ctx.bezierCurveTo(250, 250, 250, 250, 250, 170);
    ctx.bezierCurveTo(250, 50, 400, 350, 320, 280);
    ctx.closePath();
    ctx.stroke();

    // UR Text Coords for Triangle Pair 
    ctx.fillText("(5, 5)", 30, 40);
    ctx.fillText("(15, 25)", 130, 260);
    ctx.fillText("(25, 17)", 255, 175);

    ctx.beginPath()

    // BL Triangle.
    ctx.moveTo(250, 250);
    ctx.quadraticCurveTo(25, 300, 50, 350);
    ctx.quadraticCurveTo(100, 375, 150, 350);
    ctx.closePath();

    // BR Triangle.
    ctx.moveTo(330, 360);
    ctx.quadraticCurveTo(255, 340, 270, 360);
    ctx.quadraticCurveTo(255, 340, 270, 310);
    ctx.closePath();

    // UR Triangle.
    ctx.moveTo(250, 80);
    ctx.quadraticCurveTo(310, 160, 370, 50);
    ctx.quadraticCurveTo(400, 75, 370, 100);
    ctx.closePath();

    ctx.strokeStyle = "#FFFF00";
    ctx.fillStyle = "#0000FF";
    ctx.fill();
    ctx.stroke();

    ctx.restore( );
}
