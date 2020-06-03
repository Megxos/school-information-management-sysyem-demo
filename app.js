const express = require("express"),
            ejs = require("ejs"),
            bodyParser = require("body-parser"),
            mongoose = require("mongoose"),
            Student = require("./models/student"),
            passport = require("passport"),
            passport_local = require("passport-local"),
            flash = require("connect-flash")

mongoose.connect("mongodb://heroku_mh9vhhh5:sea2ho01ikvmlt17mildmbmfls@ds161459.mlab.com:61459/heroku_mh9vhhh5", {
    useNewUrlParser: true, useUnifiedTopology: true
},function(err, success){
    if(err)
        console.log("ERROR!!! We encountered an error, couldn't connect to that database")
    else
        console.log("Successfully connected to database")
})

mongoose.connection.on('error', err => {
    logError(err);
});

//express configurations
const app = express()
app.use(express.static("public"))
app.use(express.static("node_modules"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash())

var forgot = require('password-reset')({
    uri: 'http://localhost:8080/reset-password',
    from: 'password-robot@localhost',
    host: 'localhost',
    port: process.env.PORT || 5000
});
app.use(forgot.middleware);

app.use(require("express-session")({
    secret: "I am a student",
    resave: false,
    saveUninitialized: false
}))


//Student Authentication config
passport.use(new passport_local(Student.authenticate()));
passport.serializeUser(Student.serializeUser())
passport.deserializeUser(Student.deserializeUser())
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user
    res.locals.error = req.flash("error")
    res.locals.success = req.flash("success")
    next()
})


app.get("/", function(req, res){
    res.redirect("/dashboard")
})
app.get("/dashboard", isLoggedIn,function (req, res) {
  res.render("dashboard", { current_page: "Dashboard" });
});
app.get("/profile", isLoggedIn, function (req, res) {
    var currentUser = req.user
    var userId = req.user.id
    Student.findById(userId, function(err, success){
        if(err){
            req.flash("error","An error ocurred!")
            res.redirect("back")
        }
        else{
            res.render("profile", { current_page: "profile",data: success })
        }
    })
})
app.get("/timetable", isLoggedIn, function (req, res) {
    res.render("timetable", { current_page: "timetable" });
})
app.get("/results", isLoggedIn, function (req, res) {
    res.render("results", { current_page: "Results" });
})
app.get("/payments", isLoggedIn, function (req, res) {
    res.render("payments", { current_page: "Payments History" });
})
app.get("/demographics", isLoggedIn, function (req, res) {
    currentUser = req.user
    Student.findById(currentUser.id, function (err, student) {
            if (err){
                 req.flash("error","An error ocurred!")
                 res.redirect("back")
            }
            else {
               var demographics = student.demographics
                res.render("demographics", {
                current_page: "demographics", demographics
                });
            }
    })
})
app.post("/demographics/update", isLoggedIn,function(req, res){
    var today = new Date()
    currentUser = req.user

    Student.findById(currentUser.id, function(err, student){
        if(err){
             req.flash("error","An error ocurred!")
             res.redirect("back")
        }
        else{
            student.demographics.age = req.body.age
            student.demographics.birthday = req.body.birthday
            student.demographics.phone = req.body.phone
            student.demographics.phone_sec = req.body.phone_sec
            student.demographics.religion = req.body.religion
            student.demographics.gender = req.body.gender
            student.demographics.contact_address = req.body.address
            student.save(function(err, success){
                if(err){
                    req.flash("error", "An error ocurred!")
                    res.redirect("back")
                }
                else {
                    req.flash("success", "successfully updated your demographics")
                    toDashboard = () => {
                        res.redirect("/dashboard")
                    }
                    setTimeout(toDashboard, 500)
                }
            })
        }
    })
})

app.get("/examinations", isLoggedIn,function(req, res){
    res.render("examinations", { current_page: "examinations" });
})

app.get("/settings", isLoggedIn, function (req, res) {
    res.render("settings")
})

app.get("/register", function(req,res){
    res.render("register", { current_page: "register"})
})

app.post("/register", function (req, res) {
    var username = req.body.email
    var password = req.body.password
    var newStudent = new Student({})

    newStudent.profile.firstname = req.body.firstname
    newStudent.profile.middlename = req.body.middlename
    newStudent.profile.lastname = req.body.lastname
    newStudent.username = req.body.username
    newStudent.profile.current_level = req.body.current_level
    newStudent.profile.student_id = req.body.student_id
    password = req.body.password

    Student.register(newStudent, password, function (err, result) {
        if (err) {
            var error = err.message
            req.flash("error", err.message)
            return res.redirect("back")
        } else {
            passport.authenticate("local")(req, res, function () {
                // req.flash("success", "You Signed Up Successfully!")
                req.flash("success", "Registration successfull : " + req.body.username)
                res.redirect("/demographics")
            })
        }
    });
})

app.get("/login", function(req, res){
    res.render("login", { current_page: "Login"})
})

app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { 
            req.flash("error", "Sorry! please confirm your password or username")
            return res.redirect('/login'); 
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            req.flash("success", "Welcome back " + user.username)
            return res.redirect('/dashboard');
        });
    })(req, res, next);
});

function isLoggedIn(req,res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}
app.get("/logout", function(req, res){
    req.logout()
    req.flash("success", "You've been logged out!")
    res.redirect("/login")
})

function checkCase(req, res, next) {
    var received = req.body.username.toLowerCase()
    req.body.username = received
    next()
}

app.get("/forgot",function(req, res){
    res.render("forgot-password", { current_page: "forgot password" })
})

app.post('/forgot', function (req, res) {
    var email = req.body.email;
    console.log(email)
    var reset = forgot(email, function (err) {
        if (err){
            req.flash("error", "An error ocurred!" + err)
            return res.redirect("back")
        }
        else{
            req.flash("success", "Reset email sent! Check your inbox for password reset link")
            return res.redirect("back")
        }
    });

    reset.on('request', function (req_, res_) {
        req_.session.reset = { email: email, id: reset.id };
        fs.createReadStream(__dirname + '/reset-password').pipe(res_);
    });
});

app.post('/reset', function (req, res) {
    if (!req.session.reset){
        req.flash("error", "Password reset token not set")
        res.redirect("back")
    } 

    var password = req.body.new_password;
    var confirm = req.body.confirm_password;
    if (password !== confirm){
        req.flash("error", "Passwords do not match! ")
        res.redirect("back")
    }

    // update the user db here

    forgot.expire(req.session.reset.id);
    delete req.session.reset;
    req.flash("success", "Password reset successfully")
    res.redirect("/login")
});




app.listen(process.env.PORT || 5000, function(){
    console.log("Server is up and running >>>")
})