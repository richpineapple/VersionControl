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


//create repo
app.get('/createrepo',(req,res)=>{
    res.sendFile(htmlsFolder + "CreateRepo.html");
    var sourcePath = req.query.sourcePath;
    var targetPath = req.query.targetPath;


    console.log("First Input: "+ source + " Second Input: "+ target);
});

//FIXME: second commit's change not showing up in the manifest file
//now we are able to read the files in certain path, then saving them should not be a problem
app.get('/commit', (req, res) =>{
    //now we get 2 user input
    res.sendFile(htmlsFolder + "CreateRepo.html");
    var sourcePath = req.query.sourcePath;
    var targetPath = req.query.targetPath;

    //this line is important, because when first loaded, the code will
    //wait for user input and code will keep running, which is not wanted
    if(!sourcePath || !targetPath){
        return;
    }

    //date and time for names

    var manCounter = new Date();

    var manFileName = ".man-" + manCounter.getYear() + manCounter.getMonth() + manCounter.getTime()+ ".rc";


    //var manLocation = path.join(__dirname, path.join("/repos/", manFileName));
    var manLocation = path.join(targetPath, manFileName);
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




    var sourceBaseFolder = path.basename(sourcePath);




    //call the scan function, and get the result list, all paths
    var results =  _getAllFilesFromFolder(sourcePath);

    //get what files we already have in the repo part, for comparsion later
    //var repoFiles = _getAllFilesFromFolder(repoPath);
    //var repoFileNames = getAllBaseName(repoPath);
    var targetFileNames = getAllBaseName(targetPath);


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
            if (filePathList[idx] === sourceBaseFolder){
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
        //for(let idx = 0; idx < repoFileNames.length; idx++){
        for(let idx = 0; idx < targetFileNames.length; idx++){
            //if(repoFileNames[idx] === artID){
            if(targetFileNames[idx] === artID){

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
        //filesystem.writeFileSync(path.join(repoPath, artID), content);
        filesystem.writeFileSync(path.join(targetPath, artID), content);

            //step 5: save to the manifest file
            //create a date
            filesystem.appendFile(manLocation, artID + "\t"+ relativePathStr+"\t"+"Commit\t"+today+"\n", function (err) {
                if (err) throw err;
                console.log('Saved!');
            });

    });


    //save copy of .man to the user project root folder
    setTimeout(copyFileTo, 3000, manLocation, path.join(sourcePath, manFileName));

});

var copyFileTo = function(from, to){

    filesystem.copyFile(from, to, (err) => {
        if(err) throw err;
        console.log("copied " + from + " , to " + to );

    });
};




//root
app.get('/', function(req, res){
    res.sendFile(path.join(htmlsFolder, 'MainPage.html'));
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
