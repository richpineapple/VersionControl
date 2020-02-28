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
const repoPath = path.join(__dirname + "/repos/");
const version = 7;

//now we are able to read the files in certain path, then saving them should not be a problem
app.get('/commit', (req, res) =>{

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
    var results =  _getAllFilesFromFolder(userInput);

    //get what files we already have in the repo part, for comparsion later
    //var repoFiles = _getAllFilesFromFolder(repoPath);
    var repoFileNames = getAllBaseName(repoPath);


    console.log("finished the search..");

    //temp variable
    var count = 0;

    //loop over the files according to all the file paths
    results.forEach(function(file){
        console.log("read file: " + file);
        var stat = filesystem.statSync(file);
        //content is a long string of everything in the file
        var content = filesystem.readFileSync(file);

        //the format of artID: Pa-Lb-Cc
        var artID = "testFile_" + count;

        //step 1: do the path sum

        //step 2: the length for the artID
        //stat.size;

        //FIXME: step 3: calculate the c for artID here

        content.forEach(function(character){
            //console.log("current char: " + character);
        });

        var repeated = false;
        //step 4: do comparsion before try to save to the server
        repoFileNames.forEach(function(fileName){
            console.log("the file name in server: " + fileName);

            //check if the artID already exist in the server
            if(fileName === artID){
                console.log("name repeated..");
                repeated = true;
                return;
            }
        });

        //then do the save
        if(!repeated){
            console.log("try to save to repo: " + file);
            filesystem.writeFileSync(path.join(repoPath, artID), content);

        }
        //temp variable
        count++;

        //step 5: save to the manifest file
        var artiFact_file = artID;
        var manifesto = 0;
        var locate_manifesto = filesystem.readFileSync(repoPath);
    });

});


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

});

var getAllBaseName = function(dir){
    var allFilesPath = _getAllFilesFromFolder(dir);
    var allBaseNames = [];
    allFilesPath.forEach(function(filePath){
        allBaseNames.push(path.basename(filePath));
    });

    return allBaseNames;
};


//do the scan part
var _getAllFilesFromFolder = function(dir) {
    //the in searching path, the last element should be the project base folder
    var results = [];

    try{
        filesystem.readdirSync(dir).forEach(function(file) {

            file = path.join(dir, '/'+file);
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

//becase the path sum is the relative path, so we need to know where is the starting point
//in this case , the starting point should be current Project paths
//different projects will have different starting points
var saveFileToServer = function(absFilePath, projectPath){
    //do we save and calculate the art ID at the same time so we don't go over the same file twice
};


app.get('/main', function(req, res){
    res.sendFile(path.join(htmlsFolder, 'MainPage.html'));
});

//don't remove this line, it keeps the the listening to the port, not let the app to end
app.listen(port, () => console.log(`version ${version}: listen to port : ${port}`));
