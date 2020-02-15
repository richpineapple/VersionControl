// RUN PACKAGES
  const express = require('express');  //app router
  const multer = require('multer'); // file storing middleware
  const bodyParser = require('body-parser'); //cleans our req.body
  const path = require("path");
// SETUP APP
  const app = express();   //This IS an express app
  const port = process.env.PORT || 3000;  //preconfig your port!
  app.use(bodyParser.urlencoded({extended:false})); //handle body requests
  app.use(bodyParser.json()); // let's make JSON work too!
  app.use('/', express.static(__dirname + '/public'));
//let's declare a public static folder,
// this is where our client side static files/output go

//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {

storage: multer.diskStorage({
 //Setup where the user's file will go
 destination: function(req, file, next){
   //next(null, './public/photo-storage');
   next(null, './publice');
   },

    //Then give the file a unique name
    filename: function(req, file, next){
        console.log(file);
        const ext = file.mimetype.split('/')[1];
        next(null, file.fieldname + '-' + Date.now() + '.'+ext);
      }
    }),

    //A means of ensuring only images are uploaded.
    fileFilter: function(req, file, next){
          if(!file){
            next();
          }

          next(null, true);

        /*
        const image = file.mimetype.startsWith('image/');
        if(image){
          console.log('photo uploaded');
          next(null, true);
        }else{
          console.log("file not supported");


          //TODO:  A better message response to user on failure.
          return next();
        }
        */
    }
  };

  /* in App.js File */
//Route 1: serve up the homepage
app.get('/', function(req, res){
    //res.render('upload_v2.html');
    //res.sendFile("upload_v2.html");
    res.sendFile(path.join(__dirname, '/upload_v2.html'));
});
//Route 2: serve up the file handling solution (it really needs a better user response solution. If you try uploading anything but an image it will still say 'complete' though won't actually upload it. Stay tuned for a better solution, or even better, build your own fork/clone and pull request it back to me so we can make this thing better together for everyone out there struggling with it.
app.post('/upload',multer(multerConfig).single('photo'),function(req,res){
   res.send('Complete!');
});
// Please note the .single method calls ('photo'), and that 'photo' is the name of our file-type input field!

app.listen(port, () => console.log(`version 4.5: listen to port : ${port}`));
