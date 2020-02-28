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
    
})
var today = new Date().toLocaleDateString(undefined,{
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
	minute: '2-digit',
})

fs.appendFile(location, "\nNewUpdate      "+"Commit       " + today, function (err) {
    if (err) throw err;
    console.log('Saved!');
    });





    




