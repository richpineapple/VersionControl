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


//important, for man file: man file name with prefix of .man-000 is in, with prefix of .man-111 is out
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


//some necessary global variables
var checkInManPref =  ".man-000";
var checkOutManPref = ".man-111";
var mergeManPref = ".man-222";

//needed to record the path of the version changes
var manHistroyFileName = ".ManHistory.rc";

//list the .man files and their corresponding labels in the target repo
app.get("/listLabels", function(req, res){
    res.sendFile(path.join(htmlsFolder, 'listLabels.html'));

    //checking the input
    var targetRepo = req.query.targetRepo;
    if(!targetRepo){
        return;
    }

    //check the tartget path
    if(!filesystem.existsSync(targetRepo)){
        res.send("target folder not exist: " + targetRepo);
        return;
    }


    //get all the files from target repo
    var allFilesInTarget = getAllFilesFromFolder(targetRepo);

    //the result dictionary we will pass to the template
    var resultDict = {};

    //record of man file name and their labels
    var manLabelsFilePath = path.join(targetRepo, ".manLabel.rc");


    var allFileBaseName = getAllBaseName_List(allFilesInTarget);
    var allManBaseName = [];

    //loop through all the filename in the target folder, only need check in man files
    for(let i = 0; i < allFileBaseName.length; i++){
        if(allFileBaseName[i].includes(checkInManPref)){
            allManBaseName.push(allFileBaseName[i]);
        }
    }

    //if the labels file does not exist, then we can just display the file name
    if(!filesystem.existsSync(manLabelsFilePath)){
        console.log("Man label record not exist: ", manLabelsFilePath);
        resultDict["All Man Files (No Labels Are Added)"] = allManBaseName;
        res.render('listLabels', {manLabelsDict: resultDict, repoPath:targetRepo});

    }else{
        //if the labes file exist, display man file name with labels

        //key: man file name, value: empty list for now
        //so man files with no lables will also be displayed
        for(let k = 0; k < allManBaseName.length; k++){
            resultDict[allFileBaseName[k]] = [];
        }


        //read the labels file into list of lines
        var lines = filesystem.readFileSync(manLabelsFilePath, 'utf-8').split("\n").filter(Boolean);

        //make the man: [labels] to dictionary relationship
        for(let i =0; i< lines.length; i++){
            var currentLine = lines[i];
            var tempList = currentLine.split(" ");
            var manOrgName = tempList[0];
            var manLabelsList = tempList[1].split(",");

            if(manOrgName in resultDict){
                for(let k = 0; k < manLabelsList.length; k ++){
                    //push one label to the dictionary at a time
                    resultDict[manOrgName].push(manLabelsList[k]);
                }
            }else{
                resultDict[manOrgName] = manLabelsList;
            }
        }

        //pass the man:[labels] relationship to the template to display
        res.render('listLabels', {manLabelsDict: resultDict, repoPath:targetRepo});

    }

});

//providing the file with man file label info, and the label user knows,
//return the actual name of the .man file the user really refer to
var getActualManFileName = function(sourceLabelsFilePath, label){
    //if the file is not exist, there is no where to search the origianl man file name
    if(!filesystem.existsSync(sourceLabelsFilePath)){
        return false;
    }

    //read the file into list of lines
    var lines = filesystem.readFileSync(sourceLabelsFilePath, 'utf-8').split("\n").filter(Boolean);

    //look for the .man file name with that label
    for(let i =0; i< lines.length; i++){
        var currentLine = lines[i];
        var tempList = currentLine.split(" ");
        var manOrgName = tempList[0];
        var manLabelsList = tempList[1].split(",");

        //if the label is already the actual man file name, return it
        if(manOrgName == label){
            return manOrgName;
        }

        //do the search by searching the label list
        for(let j = 0; j < manLabelsList.length; j++){
            var currentLabel = manLabelsList[j].replace("\r","");
            if(currentLabel == label){
                return manOrgName;
            }
        }
    }

    return false;

}


//get the list of all [filename, orgRelativePath] list from the man file (for checkout)
var getFileNamesFromMan = function(manFilePath){
    var lines = filesystem.readFileSync(manFilePath, 'utf-8').split("\n").filter(Boolean);
    var resultList = [];
    for (let i = 0; i < lines.length; i++){
        var splitList = lines[i].split("\t");
        var oneFileName = splitList[0];
        var fileOrgPath = splitList[1];
        resultList.push([oneFileName, fileOrgPath]);
    }

    return resultList;
}




var getCheckInManName = function(){
    var manCounter = new Date();
    var manFileName = checkInManPref + manCounter.getYear() + manCounter.getMonth() + manCounter.getTime()+ ".rc";
    return manFileName;
}

var getCheckOutManName = function(){
    var manCounter = new Date();
    var manFileName = checkOutManPref + manCounter.getYear() + manCounter.getMonth() + manCounter.getTime()+ ".rc";
    return manFileName;
}

var getMergeManName = function(){
    var manCounter = new Date();
    var manFileName = mergeManPref + manCounter.getYear() + manCounter.getMonth() + manCounter.getTime()+ ".rc";
    return manFileName;

}

var getTodayForMan = function(){
    var today = new Date().toLocaleDateString(undefined,{
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
    today = today.replace(',','');
    return today;

}

//copy files from repo to target folder according the .man file
app.get('/checkout', (req, res) =>{

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
    if (!filesystem.existsSync(sourceRepoPath) ){
        res.send("source repo path not exist: " + sourceRepoPath);
        return;
    }

    if (!filesystem.existsSync(targetPath)){
        res.send("targetPath not exist: " + targetPath);
        return;
    }

    var manLabelsFilePath = path.join(sourceRepoPath, ".manLabel.rc");


    var actualManFileName = "";

    //if the label user provided is the original name
    if (filesystem.existsSync(path.join(sourceRepoPath,sourceManLabel))){
        actualManFileName = sourceManLabel;

    //check existing labels
    }else if(filesystem.existsSync(manLabelsFilePath)){
        actualManFileName = getActualManFileName(manLabelsFilePath, sourceManLabel);

    }else{
        console.log("either manlabel file not exist or the man file not exist..");
        res.send("either the manfilename or the label you provide not exist: " + sourceManLabel);
        return;
    }

    //find which man file the input label correspond to

    console.log("the acutal man file name: " , actualManFileName);
    var checkoutFromManPath = path.join(sourceRepoPath, actualManFileName);
    //now we have the abs path to the .man file the user want to use to check out


    //check if what we found exist
    if(!filesystem.existsSync(checkoutFromManPath)){
        console.log("the check out from man file not exist: ", checkoutFromManPath);
        return;
    }

    //get the names of the files that we need to copy
    //idx 0 is the artName so far, idx 1 is the original tree structure
    var fileNameList = getFileNamesFromMan(checkoutFromManPath);

    //FIXME: not sure, I guess this can be deleted, need to test for that
    //create a folder with the same name as repo folder under the target folder
    if(!filesystem.existsSync(targetPath)){
        filesystem.mkdirSync(targetPath);
    }

    targetPath = path.join(targetPath, path.basename(sourceRepoPath));

    //target path = originalTargetPath + the base folder of the project
    //so when I copy the man file, copy to under the base folder of the copy
    var targetManFilePath = path.join(targetPath, fileNameList[0][1].split("\\")[0]);

    var manFileName = getCheckOutManName();

    //records the checkout details
    var manLocation = path.join(sourceRepoPath, manFileName);

    //get the base folder of the sourcePath, because the .man record
    //need to use it as the starting folder in the relative path
    var sourceBaseFolder = path.basename(sourceRepoPath);


    //date and time for .man file records
    var today = getTodayForMan();
    var overallManRecord = "";

    //do the copy part: from repo to user target
    for(let i = 0; i < fileNameList.length; i++){
        var currentFilePath = path.join(sourceRepoPath, fileNameList[i][0]);
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



    //writing records to man file
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
                copyFileTo(manLocation, path.join(targetManFilePath, manFileName));
            });
        }
    });

    //write to the record
    var tempHisToWrite = manFileName + ":" + actualManFileName + "," + manFileName + "\n";

    var manHisFilePath = path.join(sourceRepoPath, manHistroyFileName);
    filesystem.appendFile(manHisFilePath, tempHisToWrite, (err)=>{
        if(err){
            console.log("append the man history failed.");
            return;
        }

        console.log("append to man history success: " + tempHisToWrite);
    });



});


app.get('/merge', (req, res) => {
    res.sendFile(path.join(htmlsFolder, "merge.html"))

    var repoPath = req.query.repoPath;
    var repoManLabel = req.query.repoManLabel;
    var targetProjectPath = req.query.targetProjectPath;

    if (!filesystem.existsSync(repoPath)){
        return;
    }

    if(!filesystem.existsSync(targetProjectPath)){
        return;
    }

    var manLabelsFilePath = path.join(repoPath, ".manLabel.rc");
    var actualManFileName = "";

    if(filesystem.existsSync(path.join(repoPath, repoManLabel)) ){
        actualManFileName = repoManLabel;
        //else look for original name in the man label file
    }else if (filesystem.existsSync(manLabelsFilePath)){
        actualManFileName = getActualManFileName(manLabelsFilePath, repoManLabel);
        if(actualManFileName == false){
            res.send("label not exist..");
        }
    }else{
        res.send("label not exist...");
        return;
    }

    console.log("actual man file name: " + actualManFileName);

    //FIXME:
    //1st: mergeout..
    //if autoMergeIn = true, we do it, else, user do it on their own
    var autoMergeIn = mergeOut(targetProjectPath, repoPath, path.join(repoPath, actualManFileName));



})

//var getLatestCheckOutMan = function(path, manPref){
var getLatestMan = function(path, manPref){

    var allFilesInTarget = getAllFilesFromFolder(path);
    var allFileBaseName = getAllBaseName_List(allFilesInTarget);

    var latestManFileName = "";
    var latestManFileVal = 0;

    //loop through all the filename in the target folder, only need check in man files
    for(let i = 0; i < allFileBaseName.length; i++){
        var currentFileName = allFileBaseName[i];
        if(currentFileName.includes(manPref)){
            var tempAfterSplit = currentFileName.split(".")[1];
            var tempCurrentVal= parseInt(tempAfterSplit.slice(manPref.length-1, tempAfterSplit.length));

            console.log("current fileName: " + currentFileName);
            console.log("current val: " + tempCurrentVal + ", lastval: " + latestManFileVal);
            if(tempCurrentVal > latestManFileVal){
                latestManFileVal = tempCurrentVal;
                latestManFileName = currentFileName;
            }
        }

    }

    console.log("==================================");
    console.log("returning last man file with pref " + manPref +" : " + latestManFileName);
    console.log("==================================");
    return latestManFileName;
}


//left will the checkinman file, right
var findCommonAncestorMan = function(repoPath, checkinManName, checkOutManName){
    var manHisPath = path.join(repoPath, manHistroyFileName);
    var historyLines = filesystem.readFileSync(manHisPath, "utf-8").split("\n").filter(Boolean);
    var historyDict = {};

    //read into dictionar first
    for(let i = 0; i < historyLines.length; i++){
        var currentLinePair = historyLines[i].split(":");
        var key = currentLinePair[0];
        var parent = currentLinePair[1].split(",")[0];
        historyDict[key] = parent;
    }

    var maxSerach = historyLines.length + 10;
    var count = 0;

    var leftParent = checkinManName;
    var leftParentList = [];
    var tempPrev = leftParent;
    while(true){
        var tempParent = historyDict[leftParent];
        leftParentList.push(tempParent);
        if(tempParent == tempPrev){
            break;
        }
        tempPrev =tempParent;
    }

    //convert to checkin man file, becase left is a check in man file
    var rightParent = historyDict[checkOutManName];

    for(let j = 0; j < leftParentList.length; j++){

        for(let k = 0; k < leftParentList.length; k++){
            if(leftParentList[k] == rightParent){
                return rightParent;
            }
        }

        rightParent = historyDict[rightParent];
    }

    console.log("XXXXXX---common ancestor failed..");
}

var mergeOut = function(tPath, repoPath, repoManPath){

    //if grandma is needed for the collision, then set to false, let use mergein on their own
    var autoMergeIn = true;

    //first, do the checkin
    var repoTManName = getMergeManName();
    var repoTManLocation = path.join(repoPath, repoTManName);
    var tBaseFolder = path.basename(tPath);

    var allFilesPath = getAllFilesFromFolder(tPath);
    //time stamp for man file
    var today = getTodayForMan();

    var overAllManRecord = "";
    var tManDict = {};
    var tManFullRecordDict = {};
    //FIXME: remember to save to the man file at some point later
    allFilesPath.forEach(function(oneFilePath){
        var oneManRecord = getArtNameAndSave(oneFilePath, tBaseFolder, repoPath, today, "mergeout", false);
        if(oneManRecord.length > 0){
            var tempList = oneManRecord.split("\t");
            //key: relative path,   value: result art name
            tManDict[tempList[1]] = tempList[0];
            tManFullRecordDict[tempList[1]] = oneManRecord;

            //overAllManRecord = overAllManRecord + oneManRecord;
        }
    });

    //step two: deal with conflicts

    //read the R man file into list first
    var rManDict = {};
    //if has more files than tManFile, add the extra man record line
    var rManFullRecordDict = {};
    var rManFileLines = filesystem.readFileSync(repoManPath, "utf-8").split("\n").filter(Boolean);

    rManFileLines.forEach(function(oneLine){
        var temp = oneLine.split("\t");
        //key: relative path,  value: art name
        rManDict[temp[1]] = temp[0];
        rManFullRecordDict[temp[1]] = oneLine;
    });

    //--find the common ancestor
    var targetLastCheckOut = getLatestMan(tPath, checkOutManPref);
    var commonAncestorMan = findCommonAncestorMan(repoPath, path.basename(repoManPath),targetLastCheckOut);

    //now we have the name of the man file of the common ancestor
    //read the man file into
    var pManFilePath = path.join(repoPath, commonAncestorMan);
    var pManFileLines = filesystem.readFileSync(pManFilePath, "utf-8").split("\n").filter(Boolean);
    var pManDict = {};
    pManFileLines.forEach(function(oneLine){
        var temp = oneLine.split("\t");
        //key: art name path part, value: full art name
        //pManDict[temp[1]] = temp[0];
        var pathPart = temp[0].split(".")[0].split("-")[0];
        pManDict[pathPart] = temp[0];
    });

    overAllManRecord = "GrandMa Manifest File: " + pManFilePath + "\n";



    //compare the tManDict and rManDict to check the collisions
        //list of list, [rArtName, tArtName]
    var collisionList = [];
    //--CONDITION ONE: if art name is the same, then we just replace/ignore
    for(let oneKey in tManDict){
        if(rManDict.hasOwnProperty(oneKey)){
            //console.log("repeat: " + oneKey);
            var rArtName = rManDict[oneKey];
            var tArtName = tManDict[oneKey];

            if(rArtName == tArtName){
                var relativePath = path.join(path.basename(repoPath), rArtName);
                var fromPath = path.join(repoPath, rArtName);
                var toPath = path.join(path.dirname(tPath), relativePath);
                var oneManRecord = rArtName + "\t" + relativePath+"\t"+ getTodayForMan()+"\t"+ "mergeout("+ fromPath +","+ toPath +")" + "\n";
                overAllManRecord = overAllManRecord + oneManRecord;
            }else{
                console.log("different art name: " + rArtName + ", " + tArtName);
                collisionList.push([rArtName, tArtName, oneKey]);

                //IMPORTANT: then user need to merge in on their own
                autoMergeIn = false;
            }

            //remove the compared part, whatever left in rManDict will be new files we need to add to tMan
            delete rManDict[oneKey];
        }
    }

    //--CONDITION TWO: if has extra files that don't collide, copy it
    //FIXME: may need to change the command, not just copy... do this for now..
    // whatever left in rManDict will be new files we need to add to tManFile
    for(let tempKey in rManDict){
        var tempArtName = rManDict[tempKey];
        var newArtFilePath = path.join(repoPath, rManDict[tempKey]);
        var copyToPath = path.join(tPath, path.basename(tempKey));
        //var tempRelativePath = path.join(path.dirname(newArtFilePath), rManDict[tempKey]);
        var tempRelativePath = path.join(path.basename(repoPath), tempArtName);
        copyFileTo(newArtFilePath, copyToPath);
        //overAllManRecord = overAllManRecord + rManFullRecordDict[tempKey].replace("checkin", "merge") + "\n";
        overAllManRecord = overAllManRecord + tempArtName + "\t" + tempRelativePath+ "\t" + getTodayForMan() + "\t" + "++mergeOut("+newArtFilePath+","+copyToPath + ")\n"
    }

    //FIXME: not finished
    //--CONDITION THREE: if same artname and path, and collide




    //var latestManFileName = getLatestMan(repoPath, checkInManPref);


    for(let i = 0; i < collisionList.length; i++){
        //need to get its path first

        var tempTOrgPath = path.join(path.dirname(tPath), collisionList[i][2]);
        var tempSameNameList = path.basename(collisionList[i][2]).split(".");

        var resultRFileName = tempSameNameList[0] + "_MR" + "." + tempSameNameList[1];
        var mrFrom =path.join(repoPath, collisionList[i][0]);
        var mrTo =path.join(tPath, resultRFileName);
        var mrArtName = collisionList[i][0];
        var mrRelativePath = path.join(path.basename(repoPath), mrArtName);
        //copy rCollided file to target with modified name
        //copyFileTo(path.join(repoPath, collisionList[i][0]), path.join(tPath, resultRFileName));
        copyFileTo(mrFrom, mrTo);
        overAllManRecord = overAllManRecord + mrArtName+ "\t" + mrRelativePath + "\t" + getTodayForMan() + "\t" + "Collide_mergeOut("+mrFrom+","+mrTo+ ")\n"

        var resultTFileName = tempSameNameList[0] + "_MT" + "." + tempSameNameList[1];
        var mtFrom = tempTOrgPath;
        var mtTo =  path.join(tPath, resultTFileName);
        var mtArtName = collisionList[i][1];
        var mtRelativePath = path.join(path.basename(repoPath), mtArtName);
        overAllManRecord = overAllManRecord + mtArtName+ "\t" + mtRelativePath+ "\t" + getTodayForMan() + "\t" + "Collide_mergeOut("+mtFrom+","+mtTo+ ")\n"
        //rename the tCollided file in the target
        //console.log("the temp target path.. " + tempTargetPath);
        //filesystem.rename(tempTOrgPath, path.join(tPath, resultTFileName), (err)=>{
        filesystem.rename(mtFrom, mtTo, (err)=>{
            if(err){
                console.log("renaming failed.");
            }else{
                console.log("Done with renaming for collisions");
            }

        });


        var resultGFileName = tempSameNameList[0] + "_MG" + "." + tempSameNameList[1];

        //copy the grandMa file
        //art path part:
        var artPathPart = collisionList[i][0].split(".")[0].split("-")[0];
        var mgArtName = pManDict[artPathPart]
        var mgRelativePath = path.join(path.basename(repoPath), mgArtName);
        var mgFrom =path.join(repoPath, mgArtName);
        var mgTo =path.join(tPath, resultGFileName);
        //copyFileTo(path.join(repoPath, pManDict[artPathPart]), path.join(tPath, resultGFileName));
        copyFileTo(mgFrom, mgTo);
        //overAllManRecord = overAllManRecord + tempArtName + "\t" + tempRelativePath+ "\t" + getTodayForMan() + "\t" + "++mergeOut("+newArtFilePath+","+copyToPath + ")\n"
        //add the three records to overall record
        overAllManRecord = overAllManRecord + mgArtName+ "\t" + mgRelativePath + "\t" + getTodayForMan() + "\t" + "Collide_mergeOut("+mgFrom+","+mgTo+ ")\n"


        //copy the parent collided file with modified name
        //get all the checkout man files and get the lastest one (which will track back to the parent)

        //int the tProjectFolder, get the lastesst checkout man file, then get the parent version of that file




        return autoMergeIn;
    }






    //save the man file
    filesystem.access(repoTManLocation, (err)=>{
        if(err){
            filesystem.writeFile(repoTManLocation, overAllManRecord, (err)=>{
                if(err){
                    console.log("save overallManrecord failed..");
                    return
                }

                //copy the man file to target
                copyFileTo(repoTManLocation, path.join(tPath, repoTManName));
            })
        }
    })

}

app.get('/test', (req, res)=>{
    var tempDict = {"create repo man: " : [{"check in man1" : []}, {"check in man2":[]}, {"check out man1" : []}, {"check out man2":[]} ]};

    //var tempDict = {"create repo man" : ["data1", "data2", "data3"]};
    var dictString = JSON.stringify(tempDict);
    console.log("string: " + dictString);
    filesystem.writeFile("test.json", dictString, (err)=>{
        if(err){
            console.log("write dict failed");
            return;
        }else{
            console.log("json file created..");
            return;
        }

    });

    res.send("finished");
});

//save the files status to the repo at that specific moment to the repo
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
    if (!filesystem.existsSync(sourcePath)){
        res.send("source path not exist: " + sourcePath);
        return;

    }
    if (!filesystem.existsSync(targetPath)){
        res.send("target path not exist: " + targetPath);
        return;

    }

    var manFileName = getCheckInManName();

    var manLocation = path.join(targetPath, manFileName);

    //get the base folder of the sourcePath, because the .man record
    //need to use it as the starting folder in the relative path
    var sourceBaseFolder = path.basename(sourcePath);


    //call the scan function, and get the result list, all paths
    var results =  getAllFilesFromFolder(sourcePath);



    //used for calculating the ArtID

    //date and time for .man file records
    var today = getTodayForMan();

    var overallManRecord = "";
    //loop over all the files with their paths, and given them art names and save
    results.forEach(function(file){
        var oneManRecord = getArtNameAndSave(file, sourceBaseFolder, targetPath, today, "checkin", true);
        overallManRecord += oneManRecord;
    });

    //record to the man file
    filesystem.access(manLocation, (err) =>{
        if(err)
        {
            filesystem.writeFile(manLocation, overallManRecord, (err)=>{
                if(err){
                    console.log("save overallManRecord failed..: " + err);
                    return;
                };


                //copy man file to the source
                copyFileTo(manLocation, path.join(sourcePath, manFileName));
            });
        }
    });



    //write to the record
    //var tempHisToWrite = manFileName + ":" + actualManFileName + "," + manFileName + "\n";
    //FIXME: not finished.
    var manHisFilePath = path.join(targetPath, manHistroyFileName);

    //to find the parent
    //---1st, find the latest checkout man file in the target (if check in from the same folder as create repo)
    var lastCheckOutManName = getLatestMan(sourcePath, checkOutManPref);

    //2nd, if failed, user the create repo man file (if check in from the same folder as create repo)
    if(lastCheckOutManName.length == 0){
        var lines = filesystem.readFileSync(manHisFilePath, 'utf-8').split("\n").filter(Boolean);
        lastCheckOutManName = lines[0].split(":")[0];
    }


    var tempHisToWrite = manFileName + ":" + lastCheckOutManName + "," + manFileName + "\n";


    filesystem.appendFile(manHisFilePath, tempHisToWrite, (err)=>{
        if(err){
            console.log("append the man history failed.");
            return;
        }

        console.log("append to man history success: " + tempHisToWrite);
    });


});



//this is the first step for the version control, create a repo and the first version of the snapshot of the project
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
    if (!filesystem.existsSync(sourcePath)){
        res.send("source path not exist: " + sourcePath);
        return;

    }

    if (!filesystem.existsSync(targetPath)){
        res.send("target path not exist: " + targetPath);
        return;

    }

    //same rule as check in man name
    var manFileName = getCheckInManName();

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
    var today = getTodayForMan();

    var overallManRecord = "";
    //loop over all the filePath in the sourcePath, one at a time
    results.forEach(function(file){
        var oneManRecord = getArtNameAndSave(file, sourceBaseFolder, targetPath, today, "createrepo", true);
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

    //take care of the record for later use

    var manHisFilePath = path.join(targetPath, manHistroyFileName);
    var historyToWrite = manFileName + ":" + manFileName + "\n";
    filesystem.writeFile(manHisFilePath, historyToWrite, (err)=>{
        if(err){
            console.log("err when write to man history: " + err);
            return;
        }

        console.log("man history added: " + historyToWrite);
    })


});

//var getArtNameAndSave = function(file, sourceBaseFolder, targetPath, today, command){
var getArtName = function(file, sourceBaseFolder, targetPath, today, command){

    var checkSumNumLoop = [1, 7, 3, 11];
    //ignore dot files
    if (path.basename(file).charAt(0) === "."){
        console.log("file is dot file: " + file);
        return [];
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

    return [artID, content, relativePathStr];
}

//calculate the artID and then save to  target folder
//var getArtNameAndSave = function(file, sourceBaseFolder, targetPath, today, command){
var getArtNameAndSave = function(file, sourceBaseFolder, targetPath, today, command, save){


    var tempResult = getArtName(file, sourceBaseFolder, targetPath, today, command);
    if(tempResult.length == 0){
        return "";
    }
    var artID = tempResult[0];
    var content = tempResult[1];
    var relativePathStr = tempResult[2];


    //then do the save, copy file from source to the target folder with as file with new ARTID name
    if(save == true){
        filesystem.writeFileSync(path.join(targetPath, artID), content);
    }

    //step 5: save to the manifest file
    var commandRecord = "" + command +"(" + file + ", " + path.join(targetPath, artID) + ")";
    var manifestRecord = artID + "\t"+ relativePathStr+"\t"+ today +"\t"+ commandRecord+"\n";


    //return this one record
    return manifestRecord;

};



//should work with setTimeOut, copy file in a slower manner,
//so the file will be updated and will keep copying after main loop exit
var copyFileTo = function(from, to){

    filesystem.copyFile(from, to, (err) => {
        if(err) throw err;
        console.log("copied " + from + " , to " + to );

    });
};


//add labels for manifest files (nickname)
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
        res.send("Source Path in not valid: " + sourcePath);
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
        res.send("the label or the file does not exist: " + searchMan);
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




//root, return the main html page
app.get('/', function(req, res){
    res.sendFile(path.join(htmlsFolder, 'MainPage.html'));
});


//return list of base name with parameter of one dir path(here it will do the search)
var getAllBaseName = function(dir){
    var allFilesPath = getAllFilesFromFolder(dir);
    var allBaseNames = [];
    allFilesPath.forEach(function(filePath){
        allBaseNames.push(path.basename(filePath));
    });

    return allBaseNames;
};

//return list of base name with parameter of list of dir path,(it does not do the search)
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
