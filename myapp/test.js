const fs = require('fs');
const path = require("path");
var labelTxt = "tester.txt";
var sourcePath = "C:\\Users\\Donald\\Desktop\\MasterCoder\\CECS343_VersionControl\\myapp\\tester.txt";
var lines =fs.readFileSync(sourcePath, 'utf-8').split("\n").filter(Boolean);
for (let i = 0; i< lines.length; i++){
    var currentLine = lines[i];
    var tempList = currentLine.split(" ");
    console.log(tempList);
    var manOrgName = tempList[0];
    var manLabelsList = tempList[1].split(",");
}
console.log(lines);
console.log(tempList);
console.log(manLabelsList);
console.log(manOrgName);



