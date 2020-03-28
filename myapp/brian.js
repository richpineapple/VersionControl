/*
Authors     :   Contact Info
Brian Tran  :   briant7234@gmail.com
Donovan Lee :   donovan10599@gmail.com
Biao Chen   :   siweisijiao.weebly@gmail.com

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


//template part
app.set('view engine', 'ejs');

app.get('/test', function(req, res){


    //change repo path to the actual repo path
    var repoPath = __dirname;

    //only want the name of the files, not the path
    var baseNames = getAllBaseName(repoPath);



    /*
     for line in read(.manlabels.txt):
        lineList = line.split(" ");
        var tempmanName = lineList[0]
        var templabels = lineList[1].split(",")
    */
    var tempmanname = ".tempman";
    var templabels = ['label1', 'label2', 'label100'];

    //the "students.ejs" should already be in the views folder
    //res.render('students', {students: baseNames});
    //res.render('students', {students: templabels});
    res.render('addlabels', {labels: templabels, manname: tempmanname});
    //res.render('addlabels', {manName:tempmanName, labels: templabels});

});


app.get('/test2', (req, res)=>{

    res.sendFile(htmlsFolder + "checkOut.html");

    //the source repo the user want to download
    var sourceRepoPath = req.query.sourceRepoPath;
    var sourceManLabel = req.query.sourceManFile;

    var manLabelsFilePath = path.join(sourceRepoPath, ".manLabel.rc");

    if(!sourceRepoPath || !sourceManLabel){
        return;
    }

    var actualManFileName = getActualManFileName(manLabelsFilePath, sourceManLabel);
    console.log("******************");

    //var manFilePath = path.join(sourceRepoPath, actualManFileName);
    console.log("the acutal man file name: " , actualManFileName);




});

//var getArtNameAndSave = function(file, sourceBaseFolder, targetPath, today, command){
var getActualManFileName = function(sourceLabelsFilePath, label){
    const readline = require("readline");

    var actualManFileName = "NOTFOUND";


    const readInterface = readline.createInterface(
        {
            input : filesystem.createReadStream(sourceLabelsFilePath),
            //output : process.stdout,
            output : false,
            console : false
        }
    );

    var manOrgName = "";
    var manLabelsList = [];

    readInterface.on('line', function(line){
        console.log("the line: ", line);
        var tempList = line.split(" ");
        manOrgName = tempList[0];
        manLabelsList = tempList[1].split(",");


        for(let i = 0; i < manLabelsList.length; i++){
            var currentLabel = manLabelsList[i];
            if(currentLabel == label){
                console.log("found: ", manOrgName);
                return manOrgName;
            }
        }


    });


    //FIXME: how to make this sync..
    return actualManFileName;

}





//copy files according the .man file
app.get('/checkout', (req, res) =>{
    //now we get 2 user input
    res.sendFile(htmlsFolder + "checkOut.html");

    //the source repo the user want to download
    var sourceRepoPath = req.query.sourceRepoPath;
    var sourceManFile = req.query.sourceManFile;

    //the target folder the user want to place the download
    var targetPath = req.query.targetPath;

    //this line is important, because when first loaded, the code will
    //wait for user input and code will keep running, which is not wanted
    if(!sourceRepoPath || !sourceManFile || !targetPath){
        return ;
    }

    //var labelTxt = ".manLabel.rc";
    //FIXME: not sure about the name of the file, may need to change later
    var manLabelsFilePath = path.join(targetPath, ".manLabel.rc");

    //FIXME: the sourceManFile could be any labels, so may need to
    //var sourceManPath = path.join(sourceRepoPath, sourceManFile);
    //get the actual source man path, since the input can be just labels

    //check if both path are valid..
    if (!filesystem.existsSync(sourceRepoPath) || !filesystem.existsSync(targetPath)){
        console.log("---------Input error");
        //res.sendFile(path.join(htmlsFolder, "inputError.html"));
        res.send("input error, check your input");
        return;
    }

    if(!filesystem.existsSync(manLabelsFilePath)){
        console.log("the man labels file does not exist: " , manLabelsFilePath);
        return;
    }

    //find which man file the input label correspond to




    //date and time for names for .man file
    var manCounter = new Date();
    var manFileName = ".man-" + manCounter.getYear() + manCounter.getMonth() + manCounter.getTime()+ ".rc";

    //var manLocation = path.join(targetPath, manFileName);

    //FIXME: remeber to copy to target folder
    //FIXME: save the man file to the sourceRepo folder, then do the copy
    //var resultManPath = path.join(__dirname, manFileName);



    //get the base folder of the sourcePath, because the .man record
    //need to use it as the starting folder in the relative path
    var sourceBaseFolder = path.basename(sourcePath);

    console.log("the source base folder: " + sourceBaseFolder);




    /*
    //call the scan function, and get the result list, all paths
    var results =  getAllFilesFromFolder(sourcePath);


    console.log("finished the search..");

    //used for calculating the ArtID

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
        var oneManRecord = getArtNameAndSave(file, sourceBaseFolder, targetPath, today, "checkin");
        overallManRecord += oneManRecord;
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


    */

});


app.get('/checkin', (req, res) =>{
    //now we get 2 user input
    res.sendFile(htmlsFolder + "checkIn.html");
    var sourcePath = req.query.sourcePath;
    var targetPath = req.query.targetPath;

    //this line is important, because when first loaded, the code will
    //wait for user input and code will keep running, which is not wanted
    if(!sourcePath || !targetPath){
        return ;
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


    console.log("finished the search..");

    //used for calculating the ArtID

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
        var oneManRecord = getArtNameAndSave(file, sourceBaseFolder, targetPath, today, "checkin");
        overallManRecord += oneManRecord;
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



//if first time, it will be create the repo
app.get('/createrepo', (req, res) =>{
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

    //don't do anything is the target folder is not empty
    if(targetFileNames.length > 0){
        console.log("the target folder is not empty..." + targetFileNames.length);
        res.send("the target folder is not empty...");
        return;
    }

    console.log("finished the search..");

    //used for calculating the ArtID
    var count = 0;

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
        var oneManRecord = getArtNameAndSave(file, sourceBaseFolder, targetPath, today, createrepo);
        overallManRecord += oneManRecord;
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


var getArtNameAndSave = function(file, sourceBaseFolder, targetPath, today, command){
    var checkSumNumLoop = [1, 7, 3, 11];
    //ignore dot files
    if (path.basename(file).charAt(0) === "."){
        console.log("file is dot file: " + file);
        return "";
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
    var originalExtension = path.basename(file).split(".").pop();
    artID = artID + "." + originalExtension;


    /*
    //step 4: do comparsion before try to save to the server
    for(let idx = 0; idx < targetFileNames.length; idx++){
        if(targetFileNames[idx] === artID){
            console.log("name repeated..");
            return;
        }
    }
    */


    //then do the save, copy file from source to the target folder with as file with new ARTID name
    console.log("try to save to repo: " + file);
    filesystem.writeFileSync(path.join(targetPath, artID), content);

    //step 5: save to the manifest file
    //var commandRecord = " CreateRepo(" + file + ", " + path.join(targetPath, artID) + ") ";
    var commandRecord = " " + command +"(" + file + ", " + path.join(targetPath, artID) + ") ";
    var manifestRecord = artID + "\t"+ relativePathStr+"\t"+ today + commandRecord+"\n";

    //save all the man command to one String, and save this string later
    //overallManRecord += manifestRecord;

    //return this one record
    return manifestRecord;

};


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




//don't remove this line, it keeps the the listening to the port, not let the app to end
app.listen(port, () => console.log(`version ${version}: listen to port : ${port}`));
