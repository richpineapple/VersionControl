const fs = require('fs');

var gogo = true;
var hello = 0;
while(gogo)
{
    const dir = 'C:/Users/Donald/Desktop/testJava/hello'+hello;
    if(!fs.existsSync(dir)){
            fs.mkdirSync(dir); 
            console.log('File Created!');
            gogo = false;
    
    }
    else
    {
        console.log('File Exists!');
        hello++;
    }
}







    




