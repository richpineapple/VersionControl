//for validation, Joi is a class
const Joi = require('joi');

const express = require('express');
const app = express();
const port = 3000;

//to parse the post
app.use(express.json());
const courses = [
    {id: 1, name : 'course1'},
    {id: 2, name : 'course2'},
    {id: 3, name : 'course3'},
    {id: 4, name : 'course4'}
]

app.use(express.static('public'));
app.get('/', (req, res) => res.send("hello world, version 2"));
app.get('/about', function(req, res){
    res.send("this is the about page..,nonno");
    //the second line is not going to show up,
    //so I guess send is like a return
})


function validateCourse(course){
    const schema={
        name : Joi.string().min(3).required()
    };
    return Joi.validate(course, schema);
}


app.get('/downloads', function(req, res){
    res.download('./public/testfile.html');
    //res.send("this is download page");
})

app.delete('/courses/:id', function(req, res){
    //look up the course
    //if not existing,return 404
    var course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course){
        res.status(404).send("The course with given ID was not Found");
        return;
    }

    //Delete
    const index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);
})


app.put('/courses/:id', function(req, res){
    //look up the course
    //if not existing,return 404
    var course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course){
        res.status(404).send("The course with given ID was not Found");
        return;
    }


    //validate
    //if invalid, return 404 - bad request
    const result = validateCourse(req.body);
    if(result.error){
        //res.status(400).send(result.error);
        res.status(400).send(result.error.details[0].message);
        return;
    }


    //update course
    //return the updated course
    course.name = req.body.name;
    res.send(course);
})


app.post('/courses', function(req, res){

    //const result = validateCourse(req.body);
    //object destructor
    const {error} = validateCourse(req.body);
    //if(result.error){
    if(error){
        //res.status(400).send(result.error);
        //res.status(400).send(result.error.details[0].message);
        res.status(400).send(error.details[0].message);
        return;
    }

    /*
    if(!req.body.name || req.body.name.length < 3){
        //400 bad request
        res.status(400).send("name should be more name 3 characters.");
        return;
    }
    */
    //adding new course to existing courses
    const course = {
        id : courses.length + 1,
        name : req.body.name
    };

    courses.push(course);
    res.send(course);
})




app.get('/courses/all', function(req, res){
    res.send(courses);
})
app.get('/courses/:id', function(req, res){
    var targetCourse = courses.find(c => c.id === parseInt(req.params.id));
    if(!targetCourse){
        res.status(404).send("The course with given ID was not Found");
    }else{
        res.send(targetCourse);
    }
})


app.get('/echo/:msg', function(req, res){
    res.send(req.params.msg);
})

app.get('/echomany/:year/:month', function(req, res){
    //res.send(req.params);
    res.send(req.query);
})

app.listen(port, () => console.log(`version 2: listen to port : ${port}`));
