var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
const flash = require('express-flash');
const session = require('express-session');
var moment = require('moment');
mongoose.connect('mongodb://localhost/27017');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(flash());
app.set('trust proxy', 1);
app.use(session({
    secret: 'itsasecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.locals.moment = moment;

const CommentSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Comments must have a name."], maxlength: 255},
    comment: { type: String, required: [true, "Comment must have content."], maxlength: 255 }
}, {timestamps: true});

const MessageSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Messages must have a name."], maxlength: 255},
    message: { type: String, required: [true, "Message must have content."], maxlength: 255 },
    comments: [CommentSchema]
}, {timestamps: true});

const Comment = mongoose.model('Comment', CommentSchema);
const Message = mongoose.model('Message', MessageSchema);


app.get('/', function (req, res) {
    Message.find().populate('comments').exec(function(err, messages){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render('index', {messages: messages});
        }
    })
})

app.post('/message', function (req, res) {
    Message.create(req.body, function (err, data) {
        if (err) {
            for (var key in err.errors) {
                req.flash('message', err.errors[key].message);
            }
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }
    })
})

app.post('/comment/:id', function (req, res) {
    Comment.create(req.body, function (err, data) {
        if (err) {
            for (var key in err.errors) {
                req.flash('comment', err.errors[key].message);
            }
            res.redirect('/');
        }
        else {
            Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: data}}, function(err, data)
            {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    res.redirect('/');
                }
            })
        }
    })
})

app.listen(8000, function () {
    console.log("listening on port 8000");
})