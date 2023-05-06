const express = require('express') // This line imports the Express framework into the application
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
app.use('/public', express.static('public'));



let db, collection; // 
const url = "mongodb+srv://anaromero88:CEfncNYb3ZUQaEeW@cluster0.nbbybee.mongodb.net/test";
const dbName = "cannabis-board";


app.listen(3000, () => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
      throw error;
    }
    db = client.db(dbName);
    console.log("Connected to `" + dbName + "`!");
  });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public')) // this line serves static files from the 'public' directory


app.get('/', (req, res) => {
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', { messages: result })
  })
}) //  this line sets up a route for the root URL of the application, which renders the 'index.ejs' template and sends the messages retrieved from the database as a parameter


app.post('/messages', (req, res) => {
  // conditional for story time posts
  // (conditional to change color in index.ejs)
  let option = req.body.priority  
    if ( option === 'on') {
      importance = 'high';
    } else {
      importance = 'low'
    }
  db.collection('messages').insertOne(
    {
      msg: req.body.msg,
      thumbUp:0,
      thumbDown:0,
      priority: importance }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
}) // this line sets up a route to handle POST requests to the '/messages' URL - it parses the incoming data, inserts a new message into the database, and redirects the user back to the root URL


app.put('/messages', (req, res) => {
  console.log('message', req.body.msg, 'thumb up', req.body.thumbUp)
  db.collection('messages')
  .findOneAndUpdate({msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
}) //this line sets up a route to handle PUT requests to the '/messages' URL - it updates the message document in the database with a new thumbUp value


app.delete('/messages', (req, res) => {
  console.log('message "' + req.body.msg + '"', 'thumb up', req.body.thumbUp)
  db.collection('messages').findOneAndDelete({ msg: req.body.msg }, (err, result) => {
    if (err) return res.send(500, err)
    console.log(err)
    res.send('Message deleted!')
  })
}) //this line sets up a route to handle DELETE requests to the '/messages' URL - it deletes the message document from the database that matches the specified message and thumbUp value