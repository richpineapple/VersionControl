const express = require('express');
const app = express();
const port = 3000;



//for uploads.
const multer = require('multer');
const storage = multer.diskStorage({
    //defines how files should be stored
    //cb: call back
    destination: function(req, file, cb){
        cb(null, './repos/');
    },

    filename: function(req, file, cb){
        //cb(null, file.originalname + Date.now());
        cb(null, file.originalname);
    }

});

const fileFilter = (req, file, cb) => {
    //if(file.mimetype === 'image/jpeg'){
    if(file.mimetype === 'text/plain'){
        //accept
        cb(null, true);
    }else{
        //refuse
        cb(null, false);
    }
};



//const upload = multer({storage: storage});
const upload = multer({
    storage: storage,
    limits : {
    //only accept ... bytes
    fileSize: 1024 * 1024 * 1024 
    }
    //uncomment when needed, but need to configure the filter in the right way
    //,fileFilter : fileFilter
});

//to parse the post
app.use(express.json());
app.get('/', (req, res) => res.send("hello world, version 3"));
app.get('/about', function(req, res){
    res.send("this is the about page..,nonno");
    //the second line is not going to show up,
    //so I guess send is like a return
});

//not working.
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
