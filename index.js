const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
var cors = require('cors')
const app = express();
const MongoClient = require('mongodb');
const url = 'mongodb://localhost:27017';
const saltRounds = 10;

app.use(cors());

app.use(bodyparser.json()) //middle ware 



app.get('/view', function (req, res) {
    //res.json(myData)
    MongoClient.connect(url, (err, client) => {
        if (err) return console.log(err);
        var db = client.db("busDB");
        var usersData = db.collection('model').find().toArray();
        usersData
            .then(function (data) {
                client.close();
                res.json(data);
            })
            .catch(function (err) {
                client.close();
                res.status(500).json({
                    message: "error"
                })
            })

    })
});
app.post('/bus', function (req, res) {
    console.log(req.body);

    MongoClient.connect(url, (err, client) => {
        if (err) return console.log(err);

        var db = client.db("busDB");
        db.collection('model').insertOne(req.body, (err, result) => {
            if (err) throw err;
            client.close();

            res.json({
                message: "success"
            })
        })

    })

})

app.put('/update/:id', function (req, res) {
    console.log(req.params.id);
    let param_id = req.params.id
    console.log(req.body);
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;
        var db = client.db('busDB');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('model').updateOne(
            { _id: new ObjectId(param_id) },
            { $set: { model: req.body.model, busNum: req.body.busNum, seats: req.body.seats, date: req.body.date, source: req.body.source, destination: req.body.destination, departureTime: req.body.departureTime, arrivalTime: req.body.arrivalTime } }, { upsert: true }, (err, result) => {
                if (err) throw err;
                client.close();
                res.json({
                    message: "updated"
                })
            });

    });
});

app.delete('/delete/:id', function (req, res) {
    console.log(req.params.id);
    let param_id = req.params.id
    console.log(req.body);
    MongoClient.connect(url, (err, client) => {
        if (err) return console.log(err);

        var db = client.db("busDB");
        var ObjectId = require('mongodb').ObjectID;
        db.collection('model').findOneAndDelete({ _id: new ObjectId(param_id) }, (err, result) => {
            if (err) throw err;
            client.close();

            res.json({
                message: "Deleted successfully"
            })
        })
    })
})

app.get('/searchbus/:src/:dest/:date', function (req, res) {
    console.log(req.params.src);
    console.log(req.params.dest);
    console.log(req.params.date);
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        var busData = db.collection("model").find({ source: req.params.src, destination: req.params.dest, date: req.params.date }).toArray();
        busData.then(function (data) {
            client.close();
            res.json(data);
        })
            .catch(function (err) {
                client.close();
                res.json({
                    message: "error"
                })
            });
    });
});

// Update Seats Info
app.put('/editSeats/:busNum', function (req, res) {
    console.log(req.params.busNum);
    console.log(req.body);
    var blockedSeats=req.body;
    var updateSeats={
        seat1: blockedSeats.includes('seat1') ? true:false,
        seat2: blockedSeats.includes('seat2') ? true:false, 
        seat3: blockedSeats.includes('seat3') ? true:false, 
        seat4: blockedSeats.includes('seat4') ? true:false, 
        seat5: blockedSeats.includes('seat5') ? true:false, 
        seat6: blockedSeats.includes('seat6') ? true:false, 
        seat7: blockedSeats.includes('seat7') ? true:false, 
        seat8: blockedSeats.includes('seat8') ? true:false, 
        seat9: blockedSeats.includes('seat9') ? true:false, 
        seat10: blockedSeats.includes('seat10') ? true:false, 
        seat11: blockedSeats.includes('seat11') ? true:false, 
        seat12: blockedSeats.includes('seat12') ? true:false,
        seat13: blockedSeats.includes('seat13') ? true:false,
        seat14: blockedSeats.includes('seat14') ? true:false,
        seat15: blockedSeats.includes('seat15') ? true:false,
        seat16: blockedSeats.includes('seat16') ? true:false
    }
    console.log(updateSeats)
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        //var ObjectId = require('mongodb').ObjectID;
        db.collection("model").updateOne({ busNum: req.params.busNum },
            { $set: { seatstatus: updateSeats } }, function (err, result) {
                if (err) throw err;
                client.close();
                res.json({
                    message: "Seats Updated"
                })
            });

    });
});
// get blocked seats 
app.get('/seatstatus/:busnum', function (req, res) {
    console.log(req.params.busnum)
    
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        var busData = db.collection("model").findOne({busNum: req.params.busnum});
        busData.then(function (data) {
            console.log(data);            
            client.close();
            res.json(data);
        })
            .catch(function (err) {
                client.close();
                res.json({
                    message: "error"
                })
            });
    });
});

//REGISTER FORM API
app.post('/register', function (req, res) {
    console.log(req.body);

    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;
        var db = client.db("loginDB");

        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) throw err;

            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err) throw err;

                db.collection('users').insertOne({ name: req.body.name, email: req.body.email, password: hash, contact: req.body.contact }, (err, result) => {
                    if (err) throw err; 
                    client.close();

                    res.json({
                        message: "success"
                    })
                })
            })
        })

    })

})

app.post('/login', function (req, res) {
    console.log(req.body)
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;
        var db = client.db("loginDB");
        db.collection('users').findOne({ email: req.body.email }, (err, user) => {
            if (err) throw err;
            //console.log(user)
            if (!user) {
                res.json({
                    message: "Invalid User"
                })
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) throw err;
                if (result) {

                    res.json({user})
                }
                else {
                    res.json({
                        message: "Incorrect password"
                    })
                }
            })
        })
    })
});


app.listen(3000, function () {
    console.log("port is running")
});