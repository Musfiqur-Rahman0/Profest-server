require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// Stripe secret key
const stripe = require("stripe")(process.env.STRIPE_SK);
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
      try {
        const { email, search, parcelType } = req.query;
        // console.log(email);

        const query = {};

        if (email) {
          query.addedBy = email;
        }
        if (parcelType) {
          query.parcelType = parcelType;
        }
        const result = await parcelsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(404).send({ message: "Error fetching parcels", error });
      }
    });

    app.post("/parcels", async (req, res) => {
      const newParcel = req.body;
      const result = await parcelsCollection.insertOne(newParcel);
      res.send(result);
    });

    app.get("/parcels/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid parcel ID." });
        }

        const query = { _id: new ObjectId(id) };
        const result = await parcelsCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: "Parcel not found." });
        }

        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error retrieving parcel", err });
      }
    });

    app.delete("/parcels/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid parcel ID." });
        }
        const query = { _id: new ObjectId(id) };
        const result = await parcelsCollection.deleteOne(query);

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Parcel not found" });
        }
        res
          .status(200)
          .send({ message: "Parcel deleted successfully", result });
      } catch (error) {
        res.status(501).send({ message: "error deleting parcel", error });
      }
    });

    app.post("/payment-intent", async (req, res) => {
      const { amount, currency } = req.body;
      console.log(req.body);
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          payment_method_types: ["card"],
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
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
