/*
Authors     :   Contact Info
Brian Tran  :   briant7234@gmail.com
Donovan Lee :   donovan10599@gmail.com
Biao Chen   :   siweisijiao.weebly@gmail.com

File Description: This file contains functions that create a repo, html pages, and allows users to commit files into the repo.
There are functions that calculate the Artificial ID.
besides that, it also:
Enable the user to Check-in their project to save the status of it at that moment
Enable the user to Check-out, or download a specific version someone checked in earlier, with the help of the specific Manifest file
Enable the user to Add Labels for a Manifest file in a given project repo, so it will works like a nick name when user check out
Enable the user to List All The Labels that already assigned to the Manifest files
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

var students = [
     'Mark',
     'Tom',
     'John'
]
app.get('/test', function(req, res){


    //change repo path to the actual repo path
    var repoPath = "C:\\Users\\Donald\\Desktop\\proh";
    console.log(repoPath);
    //only want the name of the files, not the path
    var labels = getAllBaseName(repoPath);
    var i;
    var baseNames = [];
    for(i = 0; i < labels.length; i++)
    {
        console.log(labels[i]);
        if(labels[i].includes("man"))
        {
            baseNames.push(labels[i]);
        }
    }
    console.log(baseNames);
    //the "students.ejs" should already be in the views folder
    res.render('students', {students: baseNames});

});

app.get("/test2", (req, res)=>{
    res.sendFile(path.join(htmlsFolder, 'listLabels.html'));
    var targetRepo = req.query.targetRepo;
    if(!targetRepo){
        return;
    }

    if(!filesystem.existsSync(targetRepo)){
        console.log("target repo not exist");
        return;
    }


    var allFilesInTarget = getAllFilesFromFolder(targetRepo);
    //console.log("all files in target: ", allFilesInTarget);

    //res.render('listLabels', {labels: allFilesInTarget, manFiles: allFilesInTarget});

    var manLabelsFilePath = path.join(targetRepo, ".manLabel.rc");
    if(!filesystem.existsSync(manLabelsFilePath)){
        var sampleDict = new Object();
        sampleDict['1'] = ["this is one", "another one"];
        sampleDict['2'] = ["this is two", "another two"];
        sampleDict['3'] = ["this is three", "another three"];


        console.log("not exist: ", manLabelsFilePath);
        res.render('test', {sampleDict : sampleDict});
        //else, only display the .man file names

    }else{
    //if the labels file exist, then we can just use the file
        console.log("exist: ", manLabelsFilePath);
    }

});

app.get("/listLabels", function(req, res){
    res.sendFile(path.join(htmlsFolder, 'listLabels.html'));
    var targetRepo = req.query.targetRepo;
    if(!targetRepo){
        return;
    }

    if(!filesystem.existsSync(targetRepo)){
        console.log("target repo not exist");
        return;
    }


    var allFilesInTarget = getAllFilesFromFolder(targetRepo);
    //console.log("all files in target: ", allFilesInTarget);

    //res.render('listLabels', {labels: allFilesInTarget, manFiles: allFilesInTarget});

    var resultDict = {};

    var manLabelsFilePath = path.join(targetRepo, ".manLabel.rc");
    if(!filesystem.existsSync(manLabelsFilePath)){
        var allFileBaseName = getAllBaseName_List(allFilesInTarget);
        var allManBaseName = [];
        for(let i = 0; i < allFileBaseName.length; i++){
            if(allFileBaseName[i].includes(".man")){
                allManBaseName.push(allFileBaseName[i]);
            }
        }
        console.log("not exist: ", manLabelsFilePath);
        resultDict["All Man Files (No Labels Are Added)"] = allManBaseName;
        res.render('listLabels', {manLabelsDict: resultDict, repoPath:targetRepo});
        //else, only display the .man file names

    }else{
    //if the labels file exist, then we can just use the file
        console.log("exist: ", manLabelsFilePath);



        //convert the file into list of lines
        var lines = filesystem.readFileSync(manLabelsFilePath, 'utf-8').split("\n").filter(Boolean);

        for(let i =0; i< lines.length; i++){
            var currentLine = lines[i];
            var tempList = currentLine.split(" ");
            manOrgName = tempList[0];
            manLabelsList = tempList[1].split(",");

            if(manOrgName in resultDict){
                for(let k = 0; k < manLabelsList.length; k ++){
                    //push one label to the dictionary at a time
                    resultDict[manOrgName].push(manLabelsList[k]);
                }
            }else{
                resultDict[manOrgName] = manLabelsList;
            }


        }

        console.log("the dictionary: ", resultDict);


        res.render('listLabels', {manLabelsDict: resultDict, repoPath:targetRepo});

    }

});

//providing the file with manFileName and labels, and label user provide,
//return the actual name of the .man file the user means
var getActualManFileName = function(sourceLabelsFilePath, label){
    //if the file is not exist, there is no where to search the origianl man file name
    if(!filesystem.existsSync(sourceLabelsFilePath)){
        return false;
    }

    //convert the file into list of lines
    var lines = filesystem.readFileSync(sourceLabelsFilePath, 'utf-8').split("\n").filter(Boolean);

    for(let i =0; i< lines.length; i++){
        var currentLine = lines[i];
        var tempList = currentLine.split(" ");
        manOrgName = tempList[0];
        manLabelsList = tempList[1].split(",");

        if(manOrgName == label){
            return manOrgName;
        }

        for(let j = 0; j < manLabelsList.length; j++){
            //var currentLabel = manLabelsList[j];
            var currentLabel = manLabelsList[j].replace("\r","");
            if(currentLabel == label){
                console.log("found: ", manOrgName);
                return manOrgName;
            }
        }
    }

    return "Not FOUND";


}

var getFileNamesFromMan = function(manFilePath){
    var lines = filesystem.readFileSync(manFilePath, 'utf-8').split("\n").filter(Boolean);
    var resultList = [];
    for (let i = 0; i < lines.length; i++){
        //var oneFileName = lines[i].split("\s")[0];
        //var splitList = lines[i].split(/(\s+)/);
        var splitList = lines[i].split("\t");
        //var oneFileName = lines[i].split(/(\s+)/)[0];
        console.log("the split list: ", splitList);
        var oneFileName = splitList[0];
        var fileOrgPath = splitList[1];
        //resultList.push(oneFileName);
        resultList.push([oneFileName, fileOrgPath]);
    }

    console.log("the file name list: ", resultList);
    return resultList;
}





//copy files according the .man file
app.get('/checkout', (req, res) =>{

    //now we get 2 user input
    res.sendFile(htmlsFolder + "checkOut.html");

    //the source repo the user want to download
    var sourceRepoPath = req.query.sourceRepoPath;
    var sourceManLabel = req.query.sourceManFile;

    //the target folder the user want to place the download
    var targetPath = req.query.targetPath;

    //this line is important, because when first loaded, the code will
    //wait for user input and code will keep running, which is not wanted
    if(!sourceRepoPath || !sourceManLabel || !targetPath){
        return ;
    }

    //check if both path are valid..
    if (!filesystem.existsSync(sourceRepoPath) || !filesystem.existsSync(targetPath)){
        console.log("---------Input error");
        //res.sendFile(path.join(htmlsFolder, "inputError.html"));
        res.send("input error, check your input");
        return;
    }

    var manLabelsFilePath = path.join(sourceRepoPath, ".manLabel.rc");


    var actualManFileName = "";

    //either the label user provided is the original name, or part of the labels already exist
    //else return
    if (filesystem.existsSync(path.join(sourceRepoPath,sourceManLabel))){
        actualManFileName = sourceManLabel;
    }else if(filesystem.existsSync(manLabelsFilePath)){
        console.log("the man labels file does not exist: " , manLabelsFilePath);
        return;
        console.log("******************");
        actualManFileName = getActualManFileName(manLabelsFilePath, sourceManLabel);
    }else{
        console.log("either manlabel file not exist or the man file not exist..");
        return;
    }

    //find which man file the input label correspond to

    console.log("the acutal man file name: " , actualManFileName);
    var checkoutFromManPath = path.join(sourceRepoPath, actualManFileName);
    //now we have the abs path to the .man file the user want to use to check out


    //FIXME: for now, don't think about record to the man yet..
    if(!filesystem.existsSync(checkoutFromManPath)){
        console.log("the check out from man file not exist: ", checkoutFromManPath);
        return;
    }

    //get the names of the files that we need to copy
    //idx 0 is the artName so far, idx 1 is the original tree structure
    var fileNameList = getFileNamesFromMan(checkoutFromManPath);

    console.log("the origianl targetPath: ", targetPath);
    targetPath = path.join(targetPath, path.basename(sourceRepoPath));
    console.log("the result targetPath: ", targetPath);
    //create a folder with the same name as repo folder under the target folder
    if(!filesystem.existsSync(targetPath)){
        filesystem.mkdirSync(targetPath);
    }

    console.log("filename[0][1]: ", fileNameList[0][1]);


    //date and time for names for .man file
    var manCounter = new Date();
    var manFileName = ".man-" + manCounter.getYear() + manCounter.getMonth() + manCounter.getTime()+ ".rc";

    //records the checkout details
    var manLocation = path.join(sourceRepoPath, manFileName);

    //get the base folder of the sourcePath, because the .man record
    //need to use it as the starting folder in the relative path
    var sourceBaseFolder = path.basename(sourceRepoPath);


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

    //FIXME:..
    for(let j = 0; j < fileNameList.length; j++){

    }
    //targetPath = path.join(targetPath, originalProjectFolderName);

    //do the copy part: from repo to user target
    for(let i = 0; i < fileNameList.length; i++){
        var currentFilePath = path.join(sourceRepoPath, fileNameList[i][0]);
        //copyFileTo(currentFilePath, path.join(targetPath, fileNameList[i]));
        var fileOrgRelativePathDir = path.dirname(fileNameList[i][1]);

        var currentTargetDir = path.join(targetPath, fileOrgRelativePathDir);

        //create the dir if they don't exist
        filesystem.mkdirSync(currentTargetDir, {recursive: true}, (error) =>{
            if(error){
                console.log("error when creating: ", error ," : ", currentTargetDir);
            }else{
                console.log("create target dir: ", currentTargetDir);
            }
        });
        copyFileTo(currentFilePath, path.join(currentTargetDir, path.basename(fileNameList[i][1])));

        //the .man part
        var currentFileName = fileNameList[i][0];
        var relativePath = path.join(sourceBaseFolder, currentFileName);
        var oneCommand = currentFileName + '\t' + relativePath + "\t" + today +
            "\t" + "checkout(" + path.join(sourceRepoPath, currentFileName) +"," +
            path.join(currentTargetDir, path.basename(fileNameList[i][1])) + ")\n";
        overallManRecord += oneCommand;
    }






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
                copyFileTo(manLocation, path.join(targetPath, manFileName));
            });
        }
    });



});


app.get('/checkin', (req, res) =>{
    //now we get 2 user input
    res.sendFile(htmlsFolder + "checkin.html");
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
        var oneManRecord = getArtNameAndSave(file, sourceBaseFolder, targetPath, today, "createrepo");
        overallManRecord += oneManRecord;
    });

    //check if manifest file exist, if not, create it, and append the commands
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

//calculate the artID and then save to  target folder
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
    var origianlExtension = path.basename(file).split(".").pop();
    artID = artID + "." + origianlExtension;


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
    var manifestRecord = artID + "\t"+ relativePathStr+"\t"+ today +"\t"+ commandRecord+"\n";

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


//add labels for manifest files
app.get('/addLabel', function(req, res){
    res.sendFile(path.join(htmlsFolder, 'addLabel.html'));

    var sourcePath = req.query.sourcePath;
    var searchMan = req.query.manName;
    var labelOne = req.query.label1;
    var labelTwo = req.query.label2;
    var labelThree = req.query.label3;
    var labelFour = req.query.label4;
    var labelTxt = ".manLabel.rc";

    if(!sourcePath){
        return ;
    }

    if (!filesystem.existsSync(sourcePath) ){
        console.log("---------Input error");
        //res.sendFile(path.join(htmlsFolder, "inputError.html"));
        res.send("input error, check your input");
        return;

    }
    //gets manifest path
    var manLabelsFilePath = path.join(sourcePath, ".manLabel.rc");

    var actualManFileName = "";

    //if the the man label file  exist, then it is the original name
    if(filesystem.existsSync(path.join(sourcePath, searchMan)) ){
        actualManFileName = searchMan;
        //else look for original name in the man label file
    }else if (filesystem.existsSync(manLabelsFilePath)){
        actualManFileName = getActualManFileName(manLabelsFilePath, searchMan);
    }else{
        //if both condition is false, then the given labels is neither a orig name nor a correct label
        console.log("the label or the file does not exist...", searchMan);
        return;
    }

    console.log("-----------the actual file name: ", actualManFileName);

    var manFilePath = path.join(sourcePath, actualManFileName);

    var labelLocation = path.join(sourcePath, labelTxt);
    //var man_label = actualManFileName+" ";
    var manLabel = actualManFileName+" ";
    //sets user_labels as an array
    var user_labels = [];
    //checks if label inputs were null
    if(labelOne.length > 0)
    {
        user_labels.push(labelOne);
    }
    if(labelTwo.length > 0)
    {
        user_labels.push(labelTwo);
    }
    if(labelThree.length > 0)
    {
        user_labels.push(labelThree);
    }
    if(labelFour.length > 0)
    {
        user_labels.push(labelFour);
    }

    //the first one does not start with comma
    if(user_labels.length > 0){
        manLabel = manLabel + user_labels[0].replace(" ","");
    }

    for(let j = 1; j < user_labels.length; j++){
        manLabel = manLabel + ","+user_labels[j].replace(" ","");
    }

    console.log("the man label: ", manLabel);

    //new line at the end of the line
    manLabel += "\n";



    filesystem.appendFile(labelLocation, manLabel, (err) =>{
        if(err){
            filesystem.writeFile(labelLocation, manLabel, (err)=>{
                if(err){
                    console.log("failed to create: ", labelLocation);
                }
                console.log(labelTxt + " (new) is now updated");
            })
        }else{
            console.log(labelTxt + " (append) is now updated");
        }
        copyFileTo(labelLocation, path.join(sourcePath, labelTxt));
    });

});




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

var getAllBaseName_List = function(aList){
    var resultList = [];
    for(let i = 0; i < aList.length; i++){
        resultList.push(path.basename(aList[i]));
    }
    return resultList;
}


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
