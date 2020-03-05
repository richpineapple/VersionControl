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
    //date and time for names

    var manCounter = new Date();

    var manFileName = ".man-" + manCounter.getYear() + manCounter.getMonth() + manCounter.getTime()+ ".rc";


    //var location = path.join(__dirname + "/repos/.manifest.txt");
    //var manLocation = path.join(__dirname + "/repos/.manifest.txt");
    var manLocation = path.join(__dirname, path.join("/repos/", manFileName));
    console.log("the manLocation: " + manLocation);
    //check if manifest file exist, if not, create it
    filesystem.access(manLocation, (err) =>{
        if(err)
        {
            filesystem.writeFile(manLocation, "", (err) =>{
                console.log("finished creating");
            });
        }
    });


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
    //var temp = userInput.split('\\');
    //console.log("the userinput basename: " + path.basename(userInput));
    var projectBaseFolder = path.basename(userInput);


    //call the scan function, and get the result list, all paths
    var results =  _getAllFilesFromFolder(userInput);

    //get what files we already have in the repo part, for comparsion later
    //var repoFiles = _getAllFilesFromFolder(repoPath);
    var repoFileNames = getAllBaseName(repoPath);


    console.log("finished the search..");

    //temp variable
    var count = 0;

    var checkSumNumLoop = [1, 7, 3, 11];

    //loop over the files according to all the file paths
    results.forEach(function(file){
        //ignore dot files
        if (path.basename(file).charAt(0) === "."){
            console.log("file is dot file: " + file);
            return;
        }

        var stat = filesystem.statSync(file);
        //content is a long string of everything in the file
        var content = String(filesystem.readFileSync(file));

        var filePathList = file.split("\\");

        var relativePathList = [];

        //the relative path starts from the project folder name..
        for(let idx = 0; idx < filePathList.length; idx++ ){
            if (filePathList[idx] === projectBaseFolder){
                relativePathList = filePathList.slice(idx);
                break;
            }
        };

        //this is for the path count part
        var relativePathStr = "";
        relativePathList.forEach(function(pathPart){
            relativePathStr = path.join(relativePathStr, pathPart);
        });

        console.log("the relative path: " + relativePathStr);


        //the format of artID: Pa-Lb-Cc
        //var artID = "testFile_" + count;
        var artID = "";

        //step 1: do the path sum
        var pathCount = 0;
        for(let idx = 0; idx < relativePathStr.length; idx++){
            //console.log("current char: " + relativePathStr.charAt(idx) + ": " + relativePathStr.charCodeAt(idx));
            pathCount = pathCount + relativePathStr.charCodeAt(idx) * checkSumNumLoop[idx % checkSumNumLoop.length];
        }
        artID = artID + "P" + pathCount + "-";

        //step 2: the length for the artID
        var sizeCount = stat.size;
        artID = artID + "L" + sizeCount + "-";

        //FIXME: step 3: calculate the c for artID here

        var contentCount = 0;
        for(let idx = 0; idx < content.length; idx++){
            contentCount = contentCount + content.charCodeAt(idx) * checkSumNumLoop[idx% checkSumNumLoop.length];

        }
        //makes sure contentCount does not pass 4 places
        contentCount = contentCount%10000;
        artID = artID + "C" + contentCount;

        //make sure they have the origianl extension
        var origianlExtension = path.basename(file).split(".").pop();
        artID = artID + "." + origianlExtension;


        //step 4: do comparsion before try to save to the server
        //var repeated = false;
        for(let idx = 0; idx < repoFileNames.length; idx++){
            if(repoFileNames[idx] === artID){
                console.log("name repeated..");
                return;
                //repeated = true;
                //break;
            }
        }

        var today = new Date().toLocaleDateString(undefined,{
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        today = today.replace(',','');

        //then do the save
        //if(!repeated){
        console.log("try to save to repo: " + file);
        filesystem.writeFileSync(path.join(repoPath, artID), content);

            //step 5: save to the manifest file
            //create a date
            filesystem.appendFile(manLocation, artID + "\t"+ relativePathStr+"\t"+"Commit\t"+today+"\n", function (err) {
                if (err) throw err;
                console.log('Saved!');
            });

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
