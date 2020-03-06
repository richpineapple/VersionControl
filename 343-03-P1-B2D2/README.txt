--Class Name:
    CECS 343 : Intro To Software Engineering
    Section 03/4
--Professor:
    Charles Siska

--Project Name:
    CECS343_VersionControl

--Team name and Members:
    B2D2
    Biao Chen, Donovan Lee, Brian Tran

--Intro
 Create a repository for the given project source tree (including a “snapshot” of “all” its files) within the project

--how to run the program:
    in atom, just run from the file "app.js"
    in windows command line:
        1.node app.js

--Contents:
    343-03-P1-B2D2 (folder)
    App_v7.js
    htmlFiles (folder)
    CreateRepo.html
    MainPage.html


--External Requirements (Node, etc)
    express.js
    node.js





--Setup and Installation:
    -Setup and install Node.js (window)
        -Download Node.js:  https://nodejs.org/en/
        -Install to the folder you like, but remember where you install it
        -GO to: my computer >> right click on any white space >> properties >> Advanced System Settings >> Environment Variables >> On the bottom, select "Path"  >> click "Edit" >> "New" >> put the location of your node.js (in my case, it is      D:\PROGRAMS\nodejs     )
        -If it works, type "node" and press Enter in the command line, it should show the node version, and invoke node
    -Setup and install Express.js, Sample Invocation and results to see (For windows)
        -In order to install express.js, you need to have node.js first
        -then open cmd ( win + r,  type cmd)
        -then command window opens, type "  npm install express --save       "
        -Done

--Sample Invocation and Results
    -Open up browser and in the url type : http://localhost:3000/
    -You will be brought to the main page. Click on "Create Repo Folder", and you will be redirected to the Create Repository.
    -Enter the path of your project that you want to make copies of (keep track of ) into the Source Path box. Then copy and paste the folder path that you would like to save all the copies of all of your contents into the Target Path.
        After that you will see the all contents in your source folder will be copied into the target folder with special names, there will also be a manifest file that shows all of your files' names and their corresponding Artifact ID.

--Features
    -Users can go to the create repo page just by clicking the link in the main page, so they don't have to enter it manually
    -Users can define the project they are working on as the source, so the path to that will be the source path, and they can also decide where they are going to save copies of their source, which is called target path. After user input "sourcePath" and "targetPath" in the create repo page, the state of the files in the source path will be copied to the targetPath for that specific moment and time.

---Bugs:
    None so far.
--References:
    File system api:
    https://nodejs.org/api/fs.html
    How to respond with a html page when user enter url:
    https://codeforgeek.com/render-html-file-expressjs/
