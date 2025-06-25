require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nliquld.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();
    const parcelsCollection = client.db("parcelsDB").collection("parcels");

    app.get("/parcels", async (req, res) => {
      const result = await parcelsCollection.find().toArray();
      res.send(result);
    });

    app.post("/parcels", async (req, res) => {
      const newParcel = req.body;
      const result = await parcelsCollection.insertOne(newParcel);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to the server.");
  } finally {
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Everything will be good inshaallah.");
});

app.listen(port, () => {
  "my server is runing on", port;
});
