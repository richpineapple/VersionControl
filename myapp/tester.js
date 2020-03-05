const fs = require('fs');
var hello = 0;
const dir = 'C:/Users/Donald/Desktop/testJava/hello'+hello;
boolean gogo = True;
while(go)
{
    try{
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir); 
            console.log('File Created!');
        }
    }
    catch (err)
    {
        console.log('File Exists!');
        hello++;
    }
}







    




