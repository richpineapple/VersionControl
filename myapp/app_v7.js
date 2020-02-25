const express = require('express');
const app = express();
const port = 3000;
//for dealing with file paths
const path = require("path");

//for handling upload files..
const formidable = require("formidable");

const filesystem = require("fs");
const htmlsFolder = path.join(__dirname, "htmlFiles/");
const helperFilesFolder = path.join(__dirname, "helperFiles/");
const currentFilePath = path.join(__dirname + "/");
const version = 6;


//potential code to accept user input
app.get('/getpathinput', (req, res) =>{
    res.sendFile(htmlsFolder + "getPathInput.html");
    //getting user input from the html user input box
    var userInput = req.query.myInputBox;

    //this line is important, because when first loaded, the code will
    //wait for user input and code will keep running, which is not wanted
    if(!userInput){
        return;
    }

    //fixme delete later
    console.log("the input: " + userInput);

    //call the scan function, and get the result list
    var tempResult = _getAllFilesFromFolder(userInput);

    //FIXME: because of the user form, I can not send another html file..
    res.sendFile(htmlsFolder + 'scanCompleted.html');
    /*
    if(!tempResult.length){
        console.log("the length: " + tempResult.length);
        //res.sendFile(htmlsFolder + "inputError.html");
        res.sendFile(htmlsFolder + 'uploadSuccess.html');
        //res.send("wrong input..");
        return;
    }

    console.log("result: " + tempResult);

    //FIXME: this is just the temporary solution, should formatted in some way
    //in html page or so
    var scanResult = "";
    tempResult.forEach((item) => {
        scanResult = scanResult + item + "\n";
    });

    //save it to server
    //scanResult will be used to upload the files in that location later
    filesystem.writeFile(helperFilesFolder + "scanResult.txt", scanResult,function(err){
        if (err) throw err;
    });

    //FIXME: need to check if repeat
    //the paathToScan.txt is used to save the paths user requests for scanning
    filesystem.writeFile(helperFilesFolder + "pathToScan.txt", userInput ,function(err){
        if (err) throw err;
    });


    res.send("done: " + scanResult);
    */
});


//root
app.get('/', (req, res) => res.send("hello world, version " + version));

//the url that user can upload file(s)
// http://localhost:3000/upload
app.get('/upload', function(req, res){
    res.sendFile(path.join(htmlsFolder, 'upload.html'));
});


//the part that will be activated to accpet any upload when user upload
app.post('/handleupload', (req, res)=>{
    new formidable.IncomingForm().parse(req)

        //error catching not really working...
        .on("error", (err) =>{
            res.sendFile(htmlsFolder + 'uploadFailed.html');
        })

        .on('fileBegin', (name, file) =>{
            file.path = path.join(path.join(__dirname + '/repos/') + file.name);
        })

        .on('file', (name, file) =>{
            console.log("uploaded file: " , name, file);
        })

    res.sendFile(htmlsFolder + 'uploadSuccess.html');

})


//do the scan part
var _getAllFilesFromFolder = function(dir) {
    var results = [];

    try{
        filesystem.readdirSync(dir).forEach(function(file) {

            file = dir+'/'+file;
            var stat = filesystem.statSync(file);

            if (stat && stat.isDirectory()) {
                results = results.concat(_getAllFilesFromFolder(file))
            } else results.push(file);

        });
    }catch(err){
        //catch errors
        console.log("something is wrong..with path");
    }

    return results;

};


//don't remove this line, it keeps the the listening to the port, not let the app to end
app.listen(port, () => console.log(`version ${version}: listen to port : ${port}`));
