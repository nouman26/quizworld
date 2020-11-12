const express=require("express");
const mongoose=require("mongoose");
const path=require("path");
const bodyParser=require("body-parser");
const schema=require("./modules/schema");
const app=express();

// Schemas of DB's
quizschema=schema.quiz;
signschema=schema.sign;
resultschema=schema.resultsch;
classschema=schema.classSch;

// Connection with different Db
const myDBquiz = mongoose.connection.useDb('quiz');
const myDBsign = mongoose.connection.useDb('sign');
const myDBresult = mongoose.connection.useDb('result');
const myDBclass = mongoose.connection.useDb('class');

// Body Parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine','ejs');

app.set('views', path.join(__dirname, 'views'));

// for rendering msg value
var message="";
var sig="";
var mess="";
student_message=""

// for quiz portion
var cls="";
var occu="";
var eml="";
var reslt=0;

app.get("/",function(req,res){
    res.sendFile(__dirname+"/views/main.html")
});

app.get("/signin",function(req,res){
    if (sig=="signup"){
        message=""
    }
    eml=""
    cls=""
    occu=""
    reslt=0;
    res.render("signin",{msg:message})
    message=""
});

app.get("/signup",function(req,res){
    if (sig=="signin"){
        message=""
    }
    eml=""
    cls=""
    occu=""
    reslt=0;
    res.render("signup",{msg:message})
});

// Middleware For class
var validation=function(req,res,next){
    if (occu!==""){
        next()
    }
    else{
    message="";
    signmodel=myDBsign.model(req.body.occupation,signschema);
    if(req.body.form=="signin"){
        sig=req.body.form;
        var para={$and:[{email:req.body.email.trim()},{password:req.body.password.trim()}]}
        var filter1=signmodel.find(para)
        var filter2=signmodel.find({email:req.body.email})
        filter2.exec(function(err,data){
            if (err) throw error;
            if (data==""){
                message="Your Email is not register please Sign Up!";
                res.redirect('/signin');
            }
            else{
                filter1.exec(function(err,data){
                    if (err) throw error;
                    if (data==""){
                        message="Your password is incorrect!";
                        res.redirect('/signin');
                    }
                    else{
                        mess=""
                        student_message=""
                        occu=req.body.occupation
                        eml=req.body.email
                        next()
                    }
                })
            }
        })
    }
    else if(req.body.form=="signup"){
        var filter=signmodel.find({email:req.body.email.trim()})
        sig=req.body.form;
        filter.exec(function(err,data){
            if (err) throw error;
            if (data==""){
                var signobject=new signmodel({
                name: req.body.firstname,
                lname: req.body.lastname,
                email: req.body.email.trim(),
                password:req.body.password
                });
                    signobject.save();
                    message="You have succesfully registered";
                    sig=""
                    res.redirect('/signin');
            }
            else{
                message="This Email is already exits try different Email";
                res.redirect('/signup');
            }  
        })
    }
}   
            }
app.post("/class",validation,function(req,res){
    
    var classmodel=myDBclass.model(eml,classschema);
    if (occu=="teacher"){
        filterclass=classmodel.find({});
        filterclass.exec(function(err,data){
        if (err) throw err;
            res.render("teacherclass",{msg:mess,read:data})
        });
    }
    else if(occu=="student"){
        res.render("studentclass",{msg:student_message});
    }
});

var quizvalidation =function(req,res,next){
    classmodel=myDBclass.model(eml,classschema);
    classsignmodel=myDBsign.model("class",classschema);
if (occu=="student"){
    filterstuclass=classsignmodel.find({class:req.body.classname})
    filterstuclass.exec(function(err,data){
        if (err) throw error;
        if (data == ""){
            student_message="Class name does not exits"
            res.redirect(307,"/class");
        }
        else{
            resultmodel=myDBresult.model(req.body.classname,resultschema);
            filterresult=resultmodel.find({email:eml})
            filterresult.exec(function(err,data){
            if (err) throw err;
            if (data==""){
                student_message="";
                cls=req.body.classname;
                next();
            }
            else{
                student_message="You have already taken this Quiz Thankyou!"
                res.redirect(307,"/class");
            }
        });
        }
    })
}
else if (occu=="teacher"){ 
    if (req.body.writeclass.trim()=="" && req.body.option==undefined){
        mess="Please select Class or Create New Class"
        res.redirect(307,"/class")
    }
    else if(req.body.writeclass.trim()=="" && req.body.option!==""){
        cls=req.body.option;
        mess=""
        next();
    }
    else{
        filtersignclass=classsignmodel.find({class:req.body.writeclass});
        filtersignclass.exec(function(err,data){
            if (err) throw error;
            if (data==""){
            var cm=new classmodel({
                class:req.body.writeclass
                })
            cm.save(function(){
            var cem=new classsignmodel({
                class:req.body.writeclass
            })
            cem.save(function(){
                mess="Your New class has been created successfully";
                res.redirect(307,"/class")
            })
        })
    }
        else{
            mess="class name already exits";
            res.redirect(307,"/class")  
        }
    })
    }
    }
}

app.post("/quiz",quizvalidation,function(req,res){
quizmodel=myDBquiz.model(cls,quizschema);
filterquiz=quizmodel.find({});
    if (occu=="student"){
        filterquiz.exec(function(err,data){
            if (err) throw err;
            res.render("studentquiz",{read:data})
        });   
    }
    else if (occu=="teacher"){
        filterquiz.exec(function(err,data){
        if (err) throw err;
            res.render("teacherquiz",{read:data})
        });
    }
})

app.post("/quiz/teacher",function(req,res){
    filterquiz=quizmodel.find({});
    var qui=new quizmodel({
        question:req.body.question,
        option1:req.body.option1,
        option2:req.body.option2,
        option3:req.body.option3,
        option4:req.body.option4,
        coption:req.body.coption,
        })
        qui.save(function(err,res1){
            filterquiz.exec(function(err,data){
                if (err) throw err;
                res.render("teacherquiz",{read:data})
        });
    });  
})


var check=function(req,res,next){
    var doc;
    quizmodel.countDocuments({}, function(error, numOfDocs) {
        doc=numOfDocs;
        for (var i=0;i<doc;i++){
            const myArray = Object.keys(req.body);
            let myInput = myArray[i];
            let myValue = req.body[myInput];
            quizmodel.find({coption:myValue},function(err,data){
                if(data==""){
                }
                else{
                    reslt++;
                }
            })
            }
            setTimeout(next, 200);
    });
}


app.post("/submit",check,function(req,res){
    resultmodel=myDBresult.model(cls,resultschema);
    quizmodel=myDBquiz.model(cls,quizschema);
    var rs=new resultmodel({
        email:eml,
        result:reslt
    })
    rs.save()
    res.render("final",{score:"Your score is "+reslt,and:"&",msg:"Your score has been submitted succesfully"})   
    res.send("succesfully submitted")
})

app.listen(3000,function(){
    console.log("app is running on port no 3000")
})