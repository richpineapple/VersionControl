const express = require('express');
const app = express();
const port = 3000;

const path = require("path");
const formidable = require("formidable");
const htmlsFolder = path.join(__dirname, "htmlFiles/")


//test sending html page
app.get('/about', function(req, res){
    //res.sendFile(path.join(__dirname, 'upload_v2.html'));
    res.sendFile(path.join(htmlsFolder, 'upload_v2.html'));
    //res.render(path.join(__dirname, '/htmlFiles/upload_v2.html'));
    //the second line is not going to show up,
    //so I guess send is like a return
});






//to parse the post
app.get('/', (req, res) => res.send("hello world, version 5"));


app.post('/upload', (req, res)=>{
    /*
    new formidable.IncomingForm().parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error', err)
      throw err
    }
    console.log('Fields', fields)
    console.log('Files', files)
    for (const file of Object.entries(files)) {
      console.log(file)
    }
  })
  */

    new formidable.IncomingForm().parse(req)
        .on('fileBegin', (name, file) =>{
            file.path = path.join(path.join(__dirname + '/repos/') + file.name);
        })

        .on('file', (name, file) =>{
            console.log("uploaded file: " , name, file);
        })

    res.sendFile(htmlsFolder + 'upload_v2.html');

})




app.listen(port, () => console.log(`version 2: listen to port : ${port}`));
