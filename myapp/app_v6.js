const express = require('express');
const app = express();
const port = 3000;

const path = require("path");
const formidable = require("formidable");
const htmlsFolder = path.join(__dirname, "htmlFiles/")
const version = 6;

//test sending html page
app.get('/upload', function(req, res){
    //res.sendFile(path.join(__dirname, 'upload_v2.html'));
    res.sendFile(path.join(htmlsFolder, 'upload.html'));
    //res.render(path.join(__dirname, '/htmlFiles/upload_v2.html'));
    //the second line is not going to show up,
    //so I guess send is like a return
});


//to parse the post
app.get('/', (req, res) => res.send("hello world, version " + version));


app.post('/handleupload', (req, res)=>{
    new formidable.IncomingForm().parse(req)

        //not really working...
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




app.listen(port, () => console.log(`version ${version}: listen to port : ${port}`));
