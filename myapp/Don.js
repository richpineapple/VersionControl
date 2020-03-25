var fs = require('fs');
var files = fs.readdirSync('C:\\Users\\Donald\\Desktop\\proh');
console.log(files.length);
var i;
for(i = 0; i < files.length; i++)
{
    if(files[i].includes("man"))
    {
        console.log(files[i]);
    }
}