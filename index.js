const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jswt = require("jsonwebtoken");
const secret = "AkYeHoPkd";
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const URL = "mongodb+srv://praveen:prmdb123@cluster0.mpb21.mongodb.net/retryWrites=true&w=majority";


app.use(express.json())
app.use(cors({
    origin: "*"
}))

let authenticate = function (req, res, next) {
    try{
        if (req.headers.authorization) {
            let result = jswt.verify(req.headers.authorization, secret);
            if (result) {
                next();
            }
            else {
                res.json({ message: "token invalid" })
            }
        }
        else {
            res.json({ message: "not authorized" })
        }
    }catch{
        console.log("token expired");
        res.json({ message: "token expired" })
    }
   
}

app.post('/register', async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let user = await db.collection("registeration").findOne({ email: req.body.email });
        if (user) {
            res.json({ message: "Email already exist!" });
            connection.close();
        }
        else {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt);
            req.body.password = hash;
            await db.collection("registeration").insertOne(req.body)
            res.json({ message: "registered" });
            connection.close();
        }
    } catch (error) {
        console.log(error)
        res.json(["error"])
    }
})

app.get("/login", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let attendancedata = await db.collection("registeration").find({}).project({ "_id": 0 }).toArray();
        await connection.close();
        res.json(attendancedata);
    } catch (error) {
        console.log(error)
    }

});

app.post('/login', async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let user = await db.collection("registeration").findOne({ email: req.body.email });
        if (user) {
            let passwordcheck = await bcrypt.compare(req.body.password, user.password)
            if (passwordcheck) {
                let token = jswt.sign({ userid: user._id }, secret, { expiresIn: '1h' });
                res.json({ message: "login", user, token });
            }
            else {
                res.json({ message: "email id or password incorrect" });
            }
        }
        else {
            res.json({ message: "email id or password incorrect" });
        }
        connection.close();

    } catch (error) {
        res.json(["email id or password incorrect"])
    }
})



app.get("/menu",authenticate ,async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let menu = await db.collection("menu").find({}).toArray();
        await connection.close();
        res.json(menu);
    } catch (error) {
        console.log(error)
    }
});

app.get("/menu/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let objId = mongodb.ObjectId(req.params.id)
         let item = await db.collection("menu").find({_id:objId}).toArray();
         await connection.close();
        res.json(item);
    } catch (error) {
        console.log(error)
    }
});

app.post("/cart", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3")
        await db.collection("cart").insertOne(req.body)
         await connection.close();
        res.json({ message: "item Added to cart" })
    } catch (error) {
        console.log(error)
    }
});

app.get("/cart/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let menu = await db.collection("cart").find({email:req.params.id,payment:'not paid'}).toArray();
        await connection.close();
        res.json(menu);
    } catch (error) {
        console.log(error)
    }
});

app.get("/itemcart/:id",authenticate, async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let objId = mongodb.ObjectId(req.params.id)
        console.log(objId)
         let item = await db.collection("cart").find({_id:objId}).toArray();
         console.log(item)
         await connection.close();
        res.json(item);
    } catch (error) {
        console.log(error)
    }
});

app.get("/editcart/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3")
        let objId = mongodb.ObjectId(req.params.id)
        var orderarr = await db.collection("cart").find({ _id: objId }).toArray();
        await connection.close();
        res.json(orderarr);
    } catch (error) {
        console.log(error)
    }
});

app.put("/editcart/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let objId = mongodb.ObjectId(req.params.id)
         var updatedarr = await db.collection("cart").updateOne({ _id: objId }, { $set: req.body })
         await connection.close();
        res.json({ message: "User Updated" })
    } catch (error) {
        res.json(error);
        console.log(error)
    }
});

app.delete("/cart/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let objId = mongodb.ObjectId(req.params.id)
        var deldata = await db.collection("cart").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "User Deleted" })
    } catch (error) {
        console.log(error)
    }
     
});

app.delete("/customcart/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let objId = mongodb.ObjectId(req.params.id)
        var deldata = await db.collection("ytorder").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "User Deleted" })
    } catch (error) {
        console.log(error)
    }
     
});



app.post("/ytorder", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3")
        await db.collection("ytorder").insertOne(req.body)
        await connection.close();
        res.json({ message: "posted :)" })
    } catch (error) {
        console.log(error)
    }
});

app.get("/ytorder" ,async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let menu = await db.collection("ytorder").find({status:'not taken'}).toArray();
        await connection.close();
        res.json(menu);
    } catch (error) {
        console.log(error)
    }
});

app.get("/ytorder/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3")
        let objId = mongodb.ObjectId(req.params.id)
        var orderarr = await db.collection("ytorder").find({ _id: objId }).toArray();
        await connection.close();
        res.json(orderarr);
    } catch (error) {
        console.log(error)
    }
});

app.put("/payorder/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let objId = mongodb.ObjectId(req.params.id)
         var updatedarr = await db.collection("cart").updateOne({ _id: objId }, { $set: {payment:'paid'} })
         await connection.close();
        res.json({ message: "User Updated" })
    } catch (error) {
        res.json(error);
        console.log(error)
    }
});

app.put("/custompayorder/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let objId = mongodb.ObjectId(req.params.id)
        console.log(req.params.id)
        var updatedarr = await db.collection("ytorder").updateOne({ _id: objId }, { $set: {cusconfirm:'yes'} })
        console.log(updatedarr);
        await connection.close();
        res.json({ message: "User Updated" })
    } catch (error) {
        res.json(error);
        console.log(error)
    }
});

app.put("/ytorder/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
        let objId = mongodb.ObjectId(req.params.id)
         var updatedarr = await db.collection("ytorder").updateOne({ _id: objId }, { $set:req.body})
         await connection.close();
        res.json({ message: "User Updated" })
    } catch (error) {
        res.json(error);
        console.log(error)
    }
});

app.get("/confirmedbooking/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
         let menu = await db.collection("cart").find({email:req.params.id,payment:'paid'}).toArray();
         await connection.close();
        res.json(menu);
    } catch (error) {
        console.log(error)
    }
});

app.get("/ytorderstatus/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
         let menu = await db.collection("ytorder").find({email:req.params.id,status:"taken",cusconfirm:'no'}).toArray();
         await connection.close();
        res.json(menu);
    } catch (error) {
        console.log(error)
    }
});

app.get("/mycustomorder/:id", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("project3");
         let menu = await db.collection("ytorder").find({email:req.params.id,status:"taken",cusconfirm:'yes'}).toArray();
         await connection.close();
        res.json(menu);
    } catch (error) {
        console.log(error)
    }
});

app.listen(3003, () => { console.log("app is running") })
