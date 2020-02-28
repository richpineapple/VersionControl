var fs = require('fs');
var path = require("path");
var location = path.join(__dirname + "/repos/manifest.txt");

//checks if manifest file exists
fs.access(location, fs.F_OK, (err) =>{
    if(err)
    {
        console.log("Something is wrong");
        //if it does not create it
        fs.writeFileSync(location, "creator DOosadoooo!\n");
        console.log("Creating file....");
    }
    fs.writeFile(location,"123");
    var readMe = fs.readFileSync(location, 'utf8');
    console.log(readMe);
})




    




