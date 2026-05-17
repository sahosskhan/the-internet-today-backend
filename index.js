
const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Using Cloudflare + Google DNS

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Get URI from .env
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ftfczjs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Safety check
if (!uri) {
  console.error("ERROR: MONGODB_URI is not defined in .env file!");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("TheInternetToday");

    // Collections
    const userCollection = database.collection("Users");
    const newsCollection = database.collection("News");
    const adsCollection = database.collection("Ads");
    const careersCollection = database.collection("Careers");
    const teamsCollection = database.collection("Teams");
    const intershipCollection = database.collection("Intership");

    // Explicit hierarchy weight configuration map for structural execution
    const roleSeniorityWeight = {
      "Founder": 1,
      "Co Founder": 2,
      "Chief Editor": 3,
      "Chief Of Technology": 4,
      "Chief Of HR": 5,
      "Head OF PR": 6,
      "Head Of Operation": 7,
      "Head Of Collaboration": 8,
      "Head Of SMM": 9,
      "Head OF Graphics": 10,
      "Head Of Content Writings": 11,
      "Head Of Content Research": 12,
      "Assistant Head Of HR": 13,
      "Assistant Head OF PR": 14,
      "Assistant Head Of Operation": 15,
      "Assistant Head Of Collaboration": 16,
      "Assistant Head Of SMM": 17,
      "Assistant Head OF Graphics": 18,
      "Assistant Head Of Content Writings": 19,
      "Assistant Head Of Content Research": 20,
      "HR Executive": 21,
      "PR Executive": 22,
      "Operation Executive": 23,
      "Collaboration Executive": 24,
      "Social Media Manager": 25,
      "Graphics Designer": 26,
      "Content Writer": 27,
      "Content Researcher": 28
    };




    // Route: Add a brand new team node
    app.post('/team', async (req, res) => {
      try {
        const payload = req.body;

        // Inject baseline parameter settings
        payload.status = "activated";

        // Calculate primary operational tier rank index for indexing sequences
        const primaryRole = payload.roles && payload.roles.length > 0 ? payload.roles[0] : "";
        payload.seniorityIndex = roleSeniorityWeight[primaryRole] || 999;

        const result = await teamsCollection.insertOne(payload);
        res.status(201).send(result);
      } catch (error) {
        console.error("Critical mutation collision in deployment:", error);
        res.status(500).send({ message: "Internal server pipeline mapping failure", error });
      }
    });

    // Route: Get all team configurations arranged structurally by positional weight
    app.get('/team', async (req, res) => {
      try {
        const structuralData = await teamsCollection
          .find()
          .sort({ seniorityIndex: 1, name: 1 })
          .toArray();
        res.send(structuralData);
      } catch (error) {
        res.status(500).send({ message: "Failed parsing target position mapping", error });
      }
    });

    // Route: Pull distinct single matrix profile row configuration schemas
    app.get('/team/:id', async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid Hexadecimal ID format" });
        }
        const document = await teamsCollection.findOne({ _id: new ObjectId(id) });
        if (!document) {
          return res.status(404).send({ message: "Document variant missing from active collection" });
        }
        res.send(document);
      } catch (error) {
        res.status(500).send({ message: "Internal index lookup error", error });
      }
    });

    // Route: Overwrite specific values or mutate node variables
    app.patch('/team/:id', async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid Hexadecimal ID format" });
        }

        const updates = { ...req.body };

        // Dynamically recalculate seniority metric matrix values if updating roles array
        if (updates.roles && updates.roles.length > 0) {
          updates.seniorityIndex = roleSeniorityWeight[updates.roles[0]] || 999;
        }

        const filter = { _id: new ObjectId(id) };
        const result = await teamsCollection.updateOne(filter, { $set: updates });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed updating structural configuration arrays", error });
      }
    });

    // Route: Hard purge a team node element out of database system metrics
    app.delete('/team/:id', async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid Hexadecimal ID format" });
        }
        const result = await teamsCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed pipeline execution parameters", error });
      }
    });
    // END OF TEAM MANAGEMENT OPERATIONS








    // ======================================================
    // USERS API
    // ======================================================

    // Create User
    app.post('/users', async (req, res) => {
      try {
        const user = req.body;

        user.role = 'user';
        user.createdAt = new Date();

        const email = user.email;

        const userExists = await userCollection.findOne({ email });

        if (userExists) {
          return res.send({ message: 'user exists' });
        }

        const result = await userCollection.insertOne(user);

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to create user", error });
      }
    });

    // Get All Users
    app.get("/user-list", async (req, res) => {
      try {
        const result = await userCollection.find().toArray();

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to fetch users", error });
      }
    });

    // Check Admin
    app.get("/users/admin/:email", async (req, res) => {
      try {
        const email = req.params.email;

        const user = await userCollection.findOne({ email });

        res.send({ isAdmin: user?.role === "admin" });

      } catch (error) {
        res.status(500).send({ message: "Failed to verify admin", error });
      }
    });

    // Update User
    app.patch('/users/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const { displayName, photoURL } = req.body;

        const filter = { _id: new ObjectId(id) };

        const updatedDoc = {
          $set: {
            displayName,
            photoURL,
          },
        };

        const result = await userCollection.updateOne(filter, updatedDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "User not found" });
        }

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to update user", error });
      }
    });

    // Toggle User Role
    app.patch('/users/role/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const { currentRole } = req.body;

        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        const result = await userCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              role: newRole
            }
          }
        );

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to update role", error });
      }
    });

    // Delete User
    app.delete('/users/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await userCollection.deleteOne({
          _id: new ObjectId(id)
        });

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to delete user", error });
      }
    });

    // ======================================================
    // NEWS API
    // ======================================================

    // Create News
    app.post('/news', async (req, res) => {
      try {
        const newsItem = req.body;

        if (!Array.isArray(newsItem.type)) {
          newsItem.type = ["Normal"];
        }

        const result = await newsCollection.insertOne(newsItem);

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to create news", error });
      }
    });

    // Get All News
    app.get('/news', async (req, res) => {
      try {
        const result = await newsCollection.find().toArray();

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to fetch news", error });
      }
    });

    // Manage News
    app.get('/manage-news', async (req, res) => {
      try {
        const email = req.query.email;

        if (!email) {
          return res.status(400).send({ message: "Email is required" });
        }

        const user = await userCollection.findOne({ email });

        let query = {};

        if (user?.role !== 'admin') {
          query = { userEmail: email };
        }

        const result = await newsCollection
          .find(query)
          .sort({ _id: -1 })
          .toArray();

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to manage news", error });
      }
    });

    // Get Single News
    app.get('/news/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await newsCollection.findOne({
          _id: new ObjectId(id)
        });

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to fetch news details", error });
      }
    });

    // Toggle News Type
    app.patch('/news/toggle-type/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const { flag } = req.body;

        const filter = { _id: new ObjectId(id) };

        const newsItem = await newsCollection.findOne(filter);

        if (!newsItem) {
          return res.status(404).send({ message: "News not found" });
        }

        const updatedTypes = newsItem.type.includes(flag)
          ? newsItem.type.filter(t => t !== flag)
          : [...newsItem.type, flag];

        const result = await newsCollection.updateOne(filter, {
          $set: {
            type: updatedTypes
          }
        });

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to toggle news type", error });
      }
    });

    // Update News
    app.patch('/news-update/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const filter = { _id: new ObjectId(id) };

        const updatedDoc = {
          $set: {
            headline: req.body.headline,
            category: req.body.category,
            writing: req.body.writing,
            writer: req.body.writer,
            designer: req.body.designer,
            source: req.body.source,
            image: req.body.image,
            type: req.body.type
          }
        };

        const result = await newsCollection.updateOne(filter, updatedDoc);

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to update news", error });
      }
    });

    // Delete News
    app.delete('/news/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await newsCollection.deleteOne({
          _id: new ObjectId(id)
        });

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to delete news", error });
      }
    });

    // ======================================================
    // ADS API
    // ======================================================

    // Create Ad
    app.post('/ads', async (req, res) => {
      try {
        const adData = req.body;

        adData.status = "activate";
        adData.createdAt = new Date();

        const result = await adsCollection.insertOne(adData);

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to create ad", error });
      }
    });

    // Get All Ads
    app.get('/ads', async (req, res) => {
      try {
        const result = await adsCollection
          .find()
          .sort({ _id: -1 })
          .toArray();

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to fetch ads", error });
      }
    });

    // Get Active Ads
    app.get('/ads/active', async (req, res) => {
      try {
        const result = await adsCollection
          .find({ status: "activate" })
          .toArray();

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to fetch active ads", error });
      }
    });

    // Get Single Ad
    app.get('/ads/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await adsCollection.findOne({
          _id: new ObjectId(id)
        });

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to fetch ad", error });
      }
    });

    // Toggle Ad Status
    app.patch('/ads/toggle-status/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const { currentStatus } = req.body;

        const newStatus =
          currentStatus === 'activate'
            ? 'deactivate'
            : 'activate';

        const result = await adsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: newStatus
            }
          }
        );

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to toggle ad status", error });
      }
    });

    // Update Ad
    app.patch('/ads-update/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const filter = { _id: new ObjectId(id) };

        const updatedDoc = {
          $set: {
            adsName: req.body.adsName,
            adsURL: req.body.adsURL,
            image: req.body.image
          }
        };

        const result = await adsCollection.updateOne(filter, updatedDoc);

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to update ad", error });
      }
    });

    // Delete Ad
    app.delete('/ads/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await adsCollection.deleteOne({
          _id: new ObjectId(id)
        });

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to delete ad", error });
      }
    });

    // ======================================================
    // CAREERS API
    // ======================================================

    // Create Career
    app.post('/careers', async (req, res) => {
      try {
        const jobData = req.body;

        jobData.status = "activated";
        jobData.postedAt = new Date();

        const result = await careersCollection.insertOne(jobData);

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to create career", error });
      }
    });

    // Get All Careers
    app.get('/careers', async (req, res) => {
      try {
        const result = await careersCollection
          .find()
          .sort({ postedAt: -1 })
          .toArray();

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to fetch careers", error });
      }
    });

    // Get Single Career
    app.get('/careers/:id', async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid ID"
          });
        }

        const result = await careersCollection.findOne({
          _id: new ObjectId(id)
        });

        if (!result) {
          return res.status(404).send({
            message: "Career not found"
          });
        }

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to fetch career", error });
      }
    });

    // Toggle Career Status
    app.patch('/careers/toggle-status/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const { currentStatus } = req.body;

        const newStatus =
          currentStatus === 'activated'
            ? 'deactivated'
            : 'activated';

        const result = await careersCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: newStatus
            }
          }
        );

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to toggle career status", error });
      }
    });

    // Update Career
    app.patch('/careers/:id', async (req, res) => {
      try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid ID"
          });
        }

        const filter = { _id: new ObjectId(id) };

        const updatedDoc = {
          $set: {
            role: req.body.role,
            type: req.body.type,
            location: req.body.location,
            salary: req.body.salary,
            deadline: req.body.deadline,
            link: req.body.link,
            requirements: req.body.requirements,
            jobDeatils: req.body.jobDeatils
          }
        };

        const result = await careersCollection.updateOne(
          filter,
          updatedDoc
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            message: "Career not found"
          });
        }

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to update career", error });
      }
    });

    // Delete Career
    app.delete('/careers/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await careersCollection.deleteOne({
          _id: new ObjectId(id)
        });

        res.send(result);

      } catch (error) {
        res.status(500).send({ message: "Failed to delete career", error });
      }
    });




    /**
     * ROUTE OPERATION: POST /internships
    
     */
    app.post('/internships', async (req, res) => {
      try {
        const payload = req.body;
        const outcomeResult = await intershipCollection.insertOne(payload);
        res.send(outcomeResult);
      } catch (error) {
        res.status(500).send({ error: true, message: "Internal server payload operational write failure" });
      }
    });

    /**
     * ROUTE OPERATION: GET /internships
     * DESCRIPTION: Pulls complete datasets from structural data layers for dashboard synchronization
     */
    app.get('/internships', async (req, res) => {
      try {
        const outputDataset = await intershipCollection.find().toArray();
        res.send(outputDataset);
      } catch (error) {
        res.status(500).send({ error: true, message: "Data frame retrieval operation failed" });
      }
    });

    /**
     * ROUTE OPERATION: GET /internships/:id
     * DESCRIPTION: Queries a singular entry item for form population actions matching explicit parameters
     */
    app.get('/internships/:id', async (req, res) => {
      try {
        const structuralTargetId = req.params.id;
        const querySpecification = { _id: new ObjectId(structuralTargetId) };
        const isolatedRecordNode = await intershipCollection.findOne(querySpecification);
        res.send(isolatedRecordNode);
      } catch (error) {
        res.status(500).send({ error: true, message: "Target profile search indexing interrupt encountered" });
      }
    });

    /**
     * ROUTE OPERATION: PATCH /internships/update/:id
     * DESCRIPTION: Rewrites parameters of an existing data node with fresh input payload values
     */
    app.patch('/internships/update/:id', async (req, res) => {
      try {
        const structuralTargetId = req.params.id;
        const inputUpdatePayload = req.body;
        const evaluationFilter = { _id: new ObjectId(structuralTargetId) };

        const updateSpecificationMap = {
          $set: {
            internshipID: inputUpdatePayload.internshipID,
            name: inputUpdatePayload.name,
            internshipName: inputUpdatePayload.internshipName,
            batch: inputUpdatePayload.batch,
            duration: inputUpdatePayload.duration,
            startingDate: inputUpdatePayload.startingDate,
            finishingDate: inputUpdatePayload.finishingDate,
            currentStatus: inputUpdatePayload.currentStatus,
            certificateURL: inputUpdatePayload.certificateURL
          }
        };

        const mutationOutcome = await intershipCollection.updateOne(evaluationFilter, updateSpecificationMap);
        res.send(mutationOutcome);
      } catch (error) {
        res.status(500).send({ error: true, message: "Serialization update overwrite process failure" });
      }
    });

    /**
     * ROUTE OPERATION: PATCH /internships/status/:id
     * DESCRIPTION: Safely updates specific metadata tracking metrics like node status settings
     */
    app.patch('/internships/status/:id', async (req, res) => {
      try {
        const structuralTargetId = req.params.id;
        const requestedStatusUpdate = req.body.status;
        const targetFilterCriteria = { _id: new ObjectId(structuralTargetId) };

        const dynamicInstructionNode = {
          $set: { status: requestedStatusUpdate }
        };

        const patchActionResponse = await intershipCollection.updateOne(targetFilterCriteria, dynamicInstructionNode);
        res.send(patchActionResponse);
      } catch (error) {
        res.status(500).send({ error: true, message: "Node global visibility state manipulation broken" });
      }
    });

    /**
     * ROUTE OPERATION: DELETE /internships/:id
     * DESCRIPTION: Purges a targeted database data element node permanently from active clusters
     */
    app.delete('/internships/:id', async (req, res) => {
      try {
        const structuralTargetId = req.params.id;
        const exclusionFilterCriteria = { _id: new ObjectId(structuralTargetId) };
        const destructionExecutionOutcome = await intershipCollection.deleteOne(exclusionFilterCriteria);
        res.send(destructionExecutionOutcome);
      } catch (error) {
        res.status(500).send({ error: true, message: "Target document execution clear sequence interrupted" });
      }
    });

    // Helper utility to convert standard date picker metrics (YYYY-MM-DD) to text layout matrices (Month DD, YYYY)
    const clearDateFormat = (inputDateStr) => {
      if (!inputDateStr) return "";
      if (inputDateStr.includes(",")) return inputDateStr; // Already parsed or formatted manually
      const targetObj = new Date(inputDateStr);
      if (isNaN(targetObj.getTime())) return inputDateStr;
      return targetObj.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    };

    // Route Configuration 1: Post route formatting engine wrapper adjustment
    app.post('/internships', async (req, res) => {
      try {
        const payload = req.body;
        // Transform incoming text strings uniformly to match template view specs
        payload.startingDate = clearDateFormat(payload.startingDate);
        payload.finishingDate = clearDateFormat(payload.finishingDate);

        const outcomeResult = await intershipCollection.insertOne(payload);
        res.send(outcomeResult);
      } catch (error) {
        res.status(500).send({ error: true, message: "Internal server pipeline failure" });
      }
    });

    // Route Configuration 2: Patch modification overwrite formatting updates
    app.patch('/internships/update/:id', async (req, res) => {
      try {
        const structuralTargetId = req.params.id;
        const inputUpdatePayload = req.body;
        const evaluationFilter = { _id: new ObjectId(structuralTargetId) };

        const updateSpecificationMap = {
          $set: {
            internshipID: inputUpdatePayload.internshipID,
            name: inputUpdatePayload.name,
            internshipName: inputUpdatePayload.internshipName,
            batch: inputUpdatePayload.batch,
            duration: inputUpdatePayload.duration,
            startingDate: clearDateFormat(inputUpdatePayload.startingDate),
            finishingDate: clearDateFormat(inputUpdatePayload.finishingDate),
            currentStatus: inputUpdatePayload.currentStatus,
            certificateURL: inputUpdatePayload.certificateURL
          }
        };

        const mutationOutcome = await intershipCollection.updateOne(evaluationFilter, updateSpecificationMap);
        res.send(mutationOutcome);
      } catch (error) {
        res.status(500).send({ error: true, message: "Overwrite serialization failure" });
      }
    });

    // Route Configuration 3: Safe Public Search via ID Query
    app.get('/public/internship/id/:internshipID', async (req, res) => {
      try {
        const targetCredentialId = req.params.internshipID.trim();

        // Match exact characters safely case-insensitive AND verify active status flags
        const structuralQuery = {
          internshipID: { $regex: new RegExp(`^${targetCredentialId}$`, 'i') },
          status: "activated"
        };

        const resultNode = await intershipCollection.findOne(structuralQuery);
        res.send(resultNode); // Returns data structure or null cleanly
      } catch (error) {
        res.status(500).send({ error: true, message: "Internal directory mapping failure" });
      }
    });

    // Route Configuration 4: Fuzzy Public Search via Name Queries
    app.get('/public/internships/name', async (req, res) => {
      try {
        const userSearchString = req.query.query || "";
        const cleanQuery = userSearchString.trim();
        if (!cleanQuery) {
          return res.send([]);
        }

        const collectiveQuery = {
          name: { $regex: cleanQuery, $options: 'i' },
          status: "activated"
        };

        const matchedCollectionArray = await intershipCollection
          .find(collectiveQuery)
          .limit(15)
          .toArray();

        res.send(matchedCollectionArray);
      } catch (error) {
        res.status(500).send({ error: true, message: "Query evaluation error" });
      }
    });

    console.log("Successfully connected to MongoDB!");

  } catch (error) {
    console.error("Connection error:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The Internet Today is running");
});

app.listen(port, () => {
  console.log(`The Internet Today is running on port ${port}`);
});