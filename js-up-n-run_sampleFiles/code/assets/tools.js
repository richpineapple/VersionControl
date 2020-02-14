// Tools
// Time-stamp: <2019-09-09 12:25:22 Chuck Siska>
// ------------------------------------------------------------

// =================================================  draw_triangle ====
// Only build the path, caller does stroke & fill.
function draw_triangle( rctx, rp1x, rp1y, rp2x, rp2y, rp3x, rp3y ) 
{
    rctx.save( );

    // BL Triangle.
    rctx.beginPath( );
    rctx.moveTo( rp1x, rp1y ); // 50, 250
    rctx.lineTo( rp2x, rp2y ); // 50, 350
    rctx.lineTo( rp3x, rp3y ); // 150, 350
    rctx.closePath();
    rctx.stroke();

    rctx.restore( );
}

// =================================================  draw_ship1 ====
// Only build the path, caller does stroke & fill.
function draw_ship1( rctx, rx, ry, rradius, ropts ) 
{
    rctx.save( );

    // optionally draw a guide showing the collision radius
    if( ropts.guide )
    {
        rctx.strokeStyle = "white";
        rctx.fillStyle = "rgba( 0, 0, 0, 0.25 )";
        rctx.lineWidth = 0.5;
        rctx.beginPath( );
        rctx.arc( rx, ry, rradius, 0, 2 * Math.PI );
        rctx.stroke( );
        rctx.fill( );
    }
    // set some default values
    rctx.lineWidth = ropts.lineWidth || 2;
    rctx.strokeStyle = ropts.stroke || "white";
    rctx.fillStyle = ropts.fill || "#FF0000";
    let angle = (ropts.angle || 0.5 * Math.PI) / 2;
    // draw the ship in three lines
    rctx.beginPath( );
    rctx.moveTo( rx + rradius, ry );
    rctx.lineTo( rx + Math.cos(Math.PI - angle) * rradius,
                ry + Math.sin(Math.PI - angle) * rradius );
    rctx.lineTo( rx + Math.cos(Math.PI + angle) * rradius,
                ry + Math.sin(Math.PI + angle) * rradius );
    rctx.closePath();
    rctx.fill();
    rctx.stroke();

    rctx.restore( );
}

// =================================================  draw_ship2 ====
// Only build the path, caller does stroke & fill.
function draw_ship2( rctx, rradius, ropts ) 
{
    ropts = ropts || { };
    rctx.save( );

    // optionally draw a guide showing the collision radius
    if( ropts.guide )
    {
        rctx.strokeStyle = "white";
        rctx.fillStyle = "rgba( 0, 0, 0, 0.25 )";
        rctx.lineWidth = 0.5;
        rctx.beginPath( );
        rctx.arc( 0, 0, rradius, 0, 2 * Math.PI );
        rctx.stroke( );
        rctx.fill( );
    }
    // set some default values
    rctx.lineWidth = ropts.lineWidth || 2;
    rctx.strokeStyle = ropts.stroke || "white";
    rctx.fillStyle = ropts.fill || "#FF0000";
    let angle = (ropts.angle || 0.5 * Math.PI) / 2;
    // draw the ship in three lines
    rctx.beginPath( );
    rctx.moveTo( rradius, 0 );
    rctx.lineTo( Math.cos(Math.PI - angle) * rradius,
                 Math.sin(Math.PI - angle) * rradius );
    rctx.lineTo( Math.cos(Math.PI + angle) * rradius,
                 Math.sin(Math.PI + angle) * rradius );
    rctx.closePath();
    rctx.fill();
    rctx.stroke();

    rctx.restore( );
}

// =====================================================  draw_rot_ships2 ====
function draw_rot_ships2( rctx  ) 
{
  // Listing 4-4. Rotating the Canvas rctx p55.
    let tx = rctx.canvas.width / 20;
    let rx = Math.PI / 500;
    rctx.translate( 0, tx );
    for ( let ix = 0; ix <= 50; ix ++ )
    {
        rctx.rotate( ix * rx );
        draw_ship2( rctx, tx, {guide: true, lineWidth: 1} );
        rctx.translate( tx, 0 );
    }
}

// =====================================================  draw_rot_ships1 ====
function draw_rot_ships1( rctx  ) 
{
  // Listing 4-4. Rotating the Canvas rctx p55.
  rctx.lineWidth = 0.5;
  rctx.strokeStyle = "white";
  let x = rctx.canvas.width * 0.9;
  let y = 0;
  let radius = rctx.canvas.width * 0.1;
  draw_grid( rctx );
  for ( let r = 0; r <= 0.5 * Math.PI; r += 0.05 * Math.PI )
    {
        rctx.save( );
        rctx.rotate( r );
        draw_ship( rctx, x, y, radius, {guide: true} );
        rctx.beginPath( );
        rctx.moveTo( 0, 0 );
        rctx.lineTo( x, 0 );
        rctx.stroke( );
        rctx.restore( );
    }
}

// =====================================================  draw_grid ====
function draw_grid( rctx, rminor, rmajor, rstroke, rfill  ) 
{
    rctx.save( );
    rctx.strokeStyle = rstroke;
    rctx.fillStyle = rfill;
    let width = rctx.canvas.width;
    let height = rctx.canvas.height;
    for ( var ix = 0; ix < width; ix += rminor )
    {
        rctx.beginPath( );
        rctx.moveTo( ix, 0 );
        rctx.lineTo( ix, height );
        rctx.lineWidth = ( ix % rmajor == 0 ) ? 0.5 : 0.25;
        rctx.stroke( );
        if ( ix % rmajor == 0  ) { rctx.fillText( ix/10, ix, 10 ); }
    }
    for ( var iy = 0; iy < height; iy += rminor )
    {
        rctx.beginPath( );
        rctx.moveTo( 0, iy );
        rctx.lineTo( width, iy );
        rctx.lineWidth = ( iy % rmajor == 0 ) ? 0.5 : 0.25;
        rctx.stroke( );
        if ( iy % rmajor == 0  ) {rctx.fillText( iy/10, 0, iy + 10 );}
    }
    rctx.restore( );
}

// =================================================  draw_text ====
// Draw text
function draw_text( ctx, rtext, ropts ) 
{
    if (! ropts) { ropts = { }; }
    ropts.xpos = ropts.xpos || 110;
    ropts.ypos = ropts.ypos || 100;
    ropts.fill = ropts.fill || 'lightgrey';
    ropts.font = ropts.font || "34px Arial";
    ctx.save( );
    context.fillStyle = ropts.fill;
    context.font = ropts.font;
    context.fillText( rtext, ropts.xpos, ropts.ypos);
    ctx.restore( );
}

// =================================================  draw_text ====
// Draw text
// function draw_text( ctx, rtext, ropts )
// {
//     //if (! ropts) { ropts = { }; } // Changed line.
//     ropts.xpos = ropts.xpos || 110;
//     ropts.ypos = ropts.ypos || 100;
//     ropts.fill = ropts.fill || 'lightgrey';
//     ropts.font = ropts.font || "34px Arial";
//     ctx.save( );
//     context.fillStyle = ropts.fill;
//     context.font = ropts.font;
//     context.fillText( rtext, ropts.xpos, ropts.ypos);
//     ctx.restore( );
// }

