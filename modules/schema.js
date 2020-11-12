const mongoose=require("mongoose")
mongoose.connect('mongodb://localhost:27017/default', {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect('mongodb+srv://m001-student:asdfghjkl@sandbox.yaq2o.mongodb.net/default?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

const quizschema = new mongoose.Schema({
    question:String,
    option1:String,
    option2:String,
    option3:String,
    option4:String,
    coption:String
  });

const signschema = new mongoose.Schema({
    name: String,
    lname: String,
    email: String,
    password:String,
    class:String
  });

const resultschema = new mongoose.Schema({
    email:String,
    result: Number
  });

const classsch = new mongoose.Schema({
    class:String,
  });

module.exports.resultsch=resultschema;
module.exports.quiz=quizschema;
module.exports.sign=signschema;
module.exports.classSch=classsch;