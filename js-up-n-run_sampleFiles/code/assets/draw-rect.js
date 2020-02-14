// Draw rectangle
// Time-stamp: <2019-01-21 19:51:28 Chuck Siska>
// ------------------------------------------------------------

// FUN. Draw filled rect.
function draw_rect( ctx, stroke, fill ) 
{
    stroke = stroke || 'lightgrey';
    fill = fill || 'dimgrey';
    ctx.save( );
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    ctx.lineWidth = 5;
    ctx.rect(75, 50, canvas.width - 150, canvas.height - 100);
    ctx.stroke();
    ctx.fill();
    ctx.restore( );
}

// FUN. Draw filled rect.
function draw_title( context ) 
{
    context.save( );
    context.fillStyle = 'lightgrey';
    context.font = "34px Arial";
    context.fillText( "Text", 110, 100 );
    context.restore( );
}
