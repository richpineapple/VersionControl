const express = require('express');
const app = express();
const port = 3000;



//for uploads.
const multer = require('multer')
const upload = multer({dest: 'repos/'});

//to parse the post
app.use(express.json());
app.get('/', (req, res) => res.send("hello world, version 3"));
app.get('/about', function(req, res){
    res.send("this is the about page..,nonno");
    //the second line is not going to show up,
    //so I guess send is like a return
});

app.post('/uploadmany', upload.array('upfiles', 100), function(req, res, next){

        res.send("works...");
        return;
    });

app.post('/upload', upload.single('upfile'), function(req, res){
        console.log(`new upload = ${req.file.filename}`);
        console.log(req.file);
        res.send("works...");
    });




app.listen(port, () => console.log(`version 2: listen to port : ${port}`));
