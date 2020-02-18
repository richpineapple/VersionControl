const express = require('express');
const app = express();
const port = 3000;

const path = require("path");
const formidable = require("formidable");

const htmlsFolder = path.join(__dirname, "htmlFiles/")
const version = 6;


//the scan user's folder's part
app.get('/scan', (req, res) => {
    //res.sendFile(path.join(htmlsFolder, 'scanFolder.html'));

    ///*
    var _getAllFilesFromFolder = function(dir) {

        var filesystem = require("fs");
        var results = [];

        filesystem.readdirSync(dir).forEach(function(file) {

            file = dir+'/'+file;
            var stat = filesystem.statSync(file);

            if (stat && stat.isDirectory()) {
                results = results.concat(_getAllFilesFromFolder(file))
            } else results.push(file);

        });

        console.log("the results: " , results);

        return results;

    };

    //var userPath = prompt("please enter your file path: ");
    //console.log("the user path: " , userPath);

    //_getAllFilesFromFolder(userPath);
    //hard code now, need user input later
    var tempResult = _getAllFilesFromFolder("C:\\Users\\siwei\\Desktop\\college_stuff\\GitHub\\helloWorld\\CECS343_VersionControl\\myapp\\repos");
    //var tempResult = _getAllFilesFromFolder("C:\\Users\\siwei\\Desktop\\college_stuff\\GitHub\\helloWorld\\CECS343_VersionControl");

    console.log("Done with scan");

    var resultToSend = "\nFolder Structure List ---->";
    tempResult.forEach((item) => {
        resultToSend = resultToSend + item + "\n";
    });

    res.send("done: " + resultToSend);
    //*/
})

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




//don't remove this line, it keeps the the listening to the port, not let the app to end
app.listen(port, () => console.log(`version ${version}: listen to port : ${port}`));
