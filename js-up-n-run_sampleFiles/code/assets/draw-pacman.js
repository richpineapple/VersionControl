// Draw Pacman
// Time-stamp: <2019-01-13 19:44:14 Chuck Siska>
// ------------------------------------------------------------

// =================================================== draw_pacman ====
// rzise = radius, ropenness in (0..1) = mouth openness circle fraction.
function draw_pacman( rctx, rx, ry, rsize, ropenness )
{
    var halfopen = ropenness / 2.0;
    var angle_beg = halfopen * Math.PI;
    var angle_end = (2 - halfopen) * Math.PI;

    rctx.save( );
    rctx.beginPath( );
    rctx.arc( rx, ry, rsize, angle_beg, angle_end );
    rctx.lineTo( rx, ry );
    rctx.closePath();
    rctx.fillStyle = "yellow";
    rctx.strokeStyle = "#0";
    rctx.fill();
    rctx.stroke();

    rctx.restore( );
}

function draw_pacmen( rctx, rcnt )
{
    // Listing 3-2. Randomizing in a Loop
    var min_rad = 5;
    var max_rad = 50;
    // var color = , rcolor
    while (0 < rcnt)
    {
        rcnt -= 1;
        let ax = rctx.canvas.width * Math.random();
        let ay = rctx.canvas.height * Math.random();
        let rad = min_rad + (max_rad - min_rad) * Math.random();
        draw_pacman( rctx, ax, ay, rad, 0.8 * Math.random() );
    }
}

