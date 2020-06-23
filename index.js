const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
var cors = require('cors')
const app = express();
const MongoClient = require('mongodb');
// const url = 'mongodb://localhost:27017';
const url ='mongodb+srv://ramyabtech19:jaisriram@ecomdb-t8ic5.mongodb.net/test?retryWrites=true&w=majority';
const saltRounds = 10;

app.use(cors());

app.set('PORT',process.env.PORT);

app.use(bodyparser.json())


/* Bus Operator view the bus*/
app.get('/view', function (req, res) {
    MongoClient.connect(url, (err, client) => {
        if (err) return console.log(err);
        var db = client.db("busDB");
        var busData = db.collection('bus').find().toArray();
        busData
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
/* Bus Operator add the bus*/
app.post('/bus', function (req, res) {
    //console.log(req.body);

    MongoClient.connect(url, (err, client) => {
        if (err) return console.log(err);

        var db = client.db("busDB");
        db.collection('bus').insertOne(req.body, (err, result) => {
            if (err) throw err;
            client.close();

            res.json({
                message: "success"
            })
        })

    })

})
/* Bus Operator update the particular bus*/
app.put('/update/:id', function (req, res) {
    //console.log(req.params.id);
    let param_id = req.params.id
    //console.log(req.body);
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;
        var db = client.db('busDB');
        var ObjectId = require('mongodb').ObjectID;
        db.collection('bus').updateOne(
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
/* Bus Operator delete the particular bus*/
app.delete('/delete/:id', function (req, res) {
    //console.log(req.params.id);
    let param_id = req.params.id
    //console.log(req.body);
    MongoClient.connect(url, (err, client) => {
        if (err) return console.log(err);

        var db = client.db("busDB");
        var ObjectId = require('mongodb').ObjectID;
        db.collection('bus').findOneAndDelete({ _id: new ObjectId(param_id) }, (err, result) => {
            if (err) throw err;
            client.close();

            res.json({
                message: "Deleted successfully"
            })
        })
    })
})
/* users search to find the bus*/
app.get('/searchbus/:src/:dest/:date', function (req, res) {
    // console.log(req.params.src);
    // console.log(req.params.dest);
    // console.log(req.params.date);
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        var busData = db.collection("bus").find({ source: req.params.src, destination: req.params.dest, date: req.params.date }).toArray();
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

/* Update Seats Info*/
app.put('/editSeats/:busNum/:avail_seats', function (req, res) {
    //console.log(req.params.busNum);
    //console.log(req.params.avail_seats);
    var blockedSeats = req.body;
    if (blockedSeats.length == 16) {
        var bal_seats = 0
    }
    else {
        var bal_seats = 16 - blockedSeats.length;
    }
    var updateSeats = {
        s1: blockedSeats.includes('s1') ? true : false,
        s2: blockedSeats.includes('s2') ? true : false,
        s3: blockedSeats.includes('s3') ? true : false,
        s4: blockedSeats.includes('s4') ? true : false,
        s5: blockedSeats.includes('s5') ? true : false,
        s6: blockedSeats.includes('s6') ? true : false,
        s7: blockedSeats.includes('s7') ? true : false,
        s8: blockedSeats.includes('s8') ? true : false,
        s9: blockedSeats.includes('s9') ? true : false,
        s10: blockedSeats.includes('s10') ? true : false,
        s11: blockedSeats.includes('s11') ? true : false,
        s12: blockedSeats.includes('s12') ? true : false,
        s13: blockedSeats.includes('s13') ? true : false,
        s14: blockedSeats.includes('s14') ? true : false,
        s15: blockedSeats.includes('s15') ? true : false,
        s16: blockedSeats.includes('s16') ? true : false
    }
    // console.log(updateSeats)
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        db.collection("bus").updateOne({ busNum: req.params.busNum },
            { $set: { seatstatus: updateSeats, seats: bal_seats } }, function (err, result) {
                if (err) throw err;
                client.close();
                res.json({
                    message: "Seats Updated"
                })
            });

    });
});

/* get blocked seats */
app.get('/seatstatus/:busnum', function (req, res) {
    //console.log(req.params.busnum)
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        var busData = db.collection("bus").findOne({ busNum: req.params.busnum });
        busData.then(function (data) {
            //console.log(data);
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
/* Add ticket  */
app.post('/addticket', function (req, res) {
    console.log(req.body);
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        db.collection("tickets").insertOne((req.body), function (err, result) {
            if (err) throw err;
            client.close();
            res.send({
                result: result,
                message: 'Bus Data Added'
            });
        });
    });

});
/* Get Tickets */
app.get('/getTicket/:userEmail', function (req, res) {
    //console.log(req.params.userEmail);
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        var busData = db.collection("tickets").find({ userEmail: req.params.userEmail}).toArray();
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
/* Cancel the Tickets */
app.put('/cancelTicket/:tickId', function (req, res) {
    console.log(req.params.tickId)
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        db.collection("tickets").updateOne({ ticketId: req.params.tickId },
            { $set: { status: "Cancelled"} }, function (err, result) {
                if (err) throw err;
                client.close();
                res.json({
                    message: "Cancelled Successfully"                    
                })
            });

    });
});
/* Get Cancelled Tickets */
app.get('/getCancelTicket', function (req, res) {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        var busData = db.collection("tickets").find({ status: "Cancelled"}).toArray();
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
/* Enable the seats for book from cancel tickets */
app.put('/freeseats/:busNum/:freeseats', function (req, res) {
    console.log(req.params.busNum);
    console.log(req.params.freeseats);
    var freeSeats=req.params.freeseats.split(',')
    console.log(req.body);
    var blockedSeats=req.body;
    var bal_seats;  

    freeSeats.forEach((item)=>{
        if (blockedSeats.includes(item))
        {
            var index=blockedSeats.indexOf(item);
            blockedSeats.splice(index,1)
        }
    })
    console.log(blockedSeats);

    if (blockedSeats.length == 12) {
        bal_seats = 0
    }
    else {
        bal_seats = 12 - blockedSeats.length
    }    
    
    var updateSeats = {
        s1: blockedSeats.includes('s1') ? true : false,
        s2: blockedSeats.includes('s2') ? true : false,
        s3: blockedSeats.includes('s3') ? true : false,
        s4: blockedSeats.includes('s4') ? true : false,
        s5: blockedSeats.includes('s5') ? true : false,
        s6: blockedSeats.includes('s6') ? true : false,
        s7: blockedSeats.includes('s7') ? true : false,
        s8: blockedSeats.includes('s8') ? true : false,
        s9: blockedSeats.includes('s9') ? true : false,
        s10: blockedSeats.includes('s10') ? true : false,
        s11: blockedSeats.includes('s11') ? true : false,
        s12: blockedSeats.includes('s12') ? true : false,
        s13: blockedSeats.includes('s13') ? true : false,
        s14: blockedSeats.includes('s14') ? true : false,
        s15: blockedSeats.includes('s15') ? true : false,
        s16: blockedSeats.includes('s16') ? true : false
    }    

    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("busDB");
        db.collection("bus").updateOne({ busNum: req.params.busNum },
            { $set: { seatstatus: updateSeats, seats: bal_seats}}, function (err, result) {
                if (err) throw err;
                console.log("Seats Enabled");

                client.close();
                res.json({
                    result: result,
                    message: "Seats Enabled"
                })
            });

    });
});


/*Register FORM */
app.post('/register', function (req, res) {
    //console.log(req.body);

    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;
        var db = client.db("loginDB");

        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) throw err;

            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err) throw err;

                db.collection('users').insertOne({ unique_id: genUniqueId(), name: req.body.name, email: req.body.email, password: hash, contact: req.body.contact }, (err, result) => {
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
/*Login FORM */
app.post('/login', function (req, res) {
    //console.log(req.body)
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;
        var db = client.db("loginDB");
        var loginType =
        {
            $or: [{ email: req.body.email }, { contact: req.body.email }, { unique_id: req.body.email }]
        }
        db.collection('users').findOne(loginType, (err, user) => {
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

                    res.json({ user })
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

/* Edit Profile */
app.put('/editProfile/:id', function (req, res) {
    console.log(req.params.id)
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("loginDB");
        db.collection("users").updateOne({ unique_id: req.params.id },
            { $set: { name: req.body.name, email: req.body.email, contact: req.body.contact} }, function (err, result) {
                if (err) throw err;
                client.close();
                res.json({
                    message: "Profile Updated"                    
                })
            });

    });
});

/* Port */
app.listen(app.get('PORT'), function () {
    console.log(app.get('PORT'))
});

/* Generate unique id for users*/
function genUniqueId() {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charLen = characters.length;
    for (var i = 0; i < 5; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charLen)
        );
    }
    //console.log(result);
    return result;
}