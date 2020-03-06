/* Authors: Brian Tran, Donovan Lee, Biao Chen
   Contact Info: siweisijiao.weebly@gmail.com
                  donovan10599@gmail.com
                  briant7234@gmail.com
   File Description: This file contains functions that create a repo, html pages, and allows users to commit files into the repo.
   There are functions that calculate the Artificial ID.
*/
const express = require('express');
const app = express();
const port = 3000;
//for dealing with file paths
const path = require("path");


const filesystem = require("fs");
const htmlsFolder = path.join(__dirname, "htmlFiles/");
const version = 8;



//if first time, it will be create the repo
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

    //check if both path are valid..
    if (!filesystem.existsSync(sourcePath) || !filesystem.existsSync(targetPath)){
        console.log("---------Input error");
        //res.sendFile(path.join(htmlsFolder, "inputError.html"));
        res.send("input error, check your input");
        return;

    }

    //date and time for names for .man file
    var manCounter = new Date();
    var manFileName = ".man-" + manCounter.getYear() + manCounter.getMonth() + manCounter.getTime()+ ".rc";

    var manLocation = path.join(targetPath, manFileName);



    //get the base folder of the sourcePath, because the .man record
    //need to use it as the starting folder in the relative path
    var sourceBaseFolder = path.basename(sourcePath);




    //call the scan function, and get the result list, all paths
    var results =  getAllFilesFromFolder(sourcePath);

    //get what files we already have in the repo part, for comparsion (check repeat) later
    var targetFileNames = getAllBaseName(targetPath);

    console.log("finished the search..");

    //used for calculating the ArtID
    var count = 0;
    var checkSumNumLoop = [1, 7, 3, 11];

    //date and time for .man file records
    var today = new Date().toLocaleDateString(undefined,{
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
    today = today.replace(',','');

    var overallManRecord = "";
    //loop over all the filePath in the sourcePath, one at a time
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
        var artID = "";

        //step 1: do the path sum
        var pathCount = 0;
        for(let idx = 0; idx < relativePathStr.length; idx++){
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
        for(let idx = 0; idx < targetFileNames.length; idx++){
            if(targetFileNames[idx] === artID){
                console.log("name repeated..");
                return;
            }
        }


        //then do the save, copy file from source to the target folder with as file with new ARTID name
        console.log("try to save to repo: " + file);
        filesystem.writeFileSync(path.join(targetPath, artID), content);

        //step 5: save to the manifest file
        var commandRecord = " CreateRepo(" + file + ", " + path.join(targetPath, artID) + ") ";
        var manifestRecord = artID + "\t"+ relativePathStr+"\t"+ today + commandRecord+"\n";

        //save all the man command to one String, and save this string later
        overallManRecord += manifestRecord;
    });

    //check if manifest file exist, if not, create it
    filesystem.access(manLocation, (err) =>{
        if(err)
        {
            filesystem.writeFile(manLocation, overallManRecord, (err)=>{
                if(err){
                    console.log("save overallManRecord failed..: " + err);
                    return;
                };


                //save all the man records at this snapshot
                console.log("finished creating man file: " + manFileName);
                copyFileTo(manLocation, path.join(sourcePath, manFileName));
            });
        }
    });



});

//should work with setTimeOut, save file in a slower manner, so the file to save to
//will eventually exist
var appendToFile = function(filePath, content){
    filesystem.appendFile(filePath, content, function (err) {
        console.log("recording manRecord: " + content);
        if (err) throw err;
        console.log('Saved!');
    });

};

//should work with setTimeOut, copy file in a slower manner,
//so the file will be updated and will keep copying after main loop exit
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
    var allFilesPath = getAllFilesFromFolder(dir);
    var allBaseNames = [];
    allFilesPath.forEach(function(filePath){
        allBaseNames.push(path.basename(filePath));
    });

    return allBaseNames;
};


//do the scan part
var getAllFilesFromFolder = function(dir) {
    //the in searching path, the last element should be the project base folder
    var results = [];

    try{
        filesystem.readdirSync(dir).forEach(function(file) {

            file = path.join(dir, '/'+file);
            var stat = filesystem.statSync(file);

            if (stat && stat.isDirectory()) {
                results = results.concat(getAllFilesFromFolder(file));
            } else results.push(file);

        });
    }catch(err){
        //catch errors
        console.log("something is wrong..with path");
    }


    return results;

};



app.get('/main', function(req, res){
    res.sendFile(path.join(htmlsFolder, 'MainPage.html'));
});

//don't remove this line, it keeps the the listening to the port, not let the app to end
app.listen(port, () => console.log(`version ${version}: listen to port : ${port}`));
