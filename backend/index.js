const express = require('express');
const app = express();
const port = 4002;
const morgan=require("morgan")
app.use(morgan("combined"))
const bodyParser=require("body-parser")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const cors=require("cors");
app.use(cors({ origin: '*' }));
app.listen(port,()=>{
console.log(`My Server listening on port ${port}`)
})
app.get("/",(req,res)=>{
res.send("This Web server is processed for MongoDB")
})
const { MongoClient, ObjectId } = require('mongodb');
client = new MongoClient("mongodb://127.0.0.1:27017");
client.connect();
database = client.db("Promotion");
promotionsCollection = database.collection("promotions");
app.get("/promotions",cors(),async (req,res)=>{
    const result = await promotionsCollection.find({}).toArray();
    res.status(200).json(result)
    }
    )
app.get("/promotions/:id",cors(),async (req,res)=>{
    var o_id = new ObjectId(req.params["id"]);
    const result = await promotionsCollection.find({_id:o_id}).toArray();
    res.send(result[0])
    }
    )