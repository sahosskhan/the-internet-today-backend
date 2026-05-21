if (process.env.NODE_ENV !== 'production') {
  const dns = require('dns');
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ftfczjs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let isConnected = false;

async function connectDB() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db("TheInternetToday");
}

const clearDateFormat = (inputDateStr) => {
  if (!inputDateStr) return "";
  if (inputDateStr.includes(",")) return inputDateStr;
  const targetObj = new Date(inputDateStr);
  if (isNaN(targetObj.getTime())) return inputDateStr;
  return targetObj.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
};

const roleSeniorityWeight = {
  "Founder": 1,
  "Co Founder": 2,
  "Chief Editor": 3,
  "Chief Of Technology": 4,
  "Chief Of HR": 5,
  "Head Of Operation": 6,
  "Head OF Graphics": 7,
  "Head Of Content Writings": 8,
  "Head Of SMM": 9,
  "Head OF PR": 10,
  "Head Of Collaboration": 11,
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

app.get("/", (req, res) => {
  res.send("The Internet Today is running");
});

// TEAM
app.post('/team', async (req, res) => {
  try {
    const db = await connectDB();
    const payload = req.body;
    payload.status = "activated";
    const primaryRole = payload.roles && payload.roles.length > 0 ? payload.roles[0] : "";
    payload.seniorityIndex = roleSeniorityWeight[primaryRole] || 999;
    const result = await db.collection("Teams").insertOne(payload);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Internal server error", error });
  }
});

app.get('/team', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Teams").find().sort({ seniorityIndex: 1, name: 1 }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch team", error });
  }
});

app.get('/team/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid ID format" });
    const document = await db.collection("Teams").findOne({ _id: new ObjectId(id) });
    if (!document) return res.status(404).send({ message: "Team member not found" });
    res.send(document);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch team member", error });
  }
});

app.patch('/team/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid ID format" });
    const updates = { ...req.body };
    if (updates.roles && updates.roles.length > 0) {
      updates.seniorityIndex = roleSeniorityWeight[updates.roles[0]] || 999;
    }
    const result = await db.collection("Teams").updateOne({ _id: new ObjectId(id) }, { $set: updates });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update team member", error });
  }
});

app.delete('/team/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid ID format" });
    const result = await db.collection("Teams").deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete team member", error });
  }
});

// USERS
app.post('/users', async (req, res) => {
  try {
    const db = await connectDB();
    const user = req.body;
    user.role = 'user';
    user.createdAt = new Date();
    const userExists = await db.collection("Users").findOne({ email: user.email });
    if (userExists) return res.send({ message: 'user exists' });
    const result = await db.collection("Users").insertOne(user);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to create user", error });
  }
});

app.get("/user-list", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Users").find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch users", error });
  }
});

app.get("/users/admin/:email", async (req, res) => {
  try {
    const db = await connectDB();
    const user = await db.collection("Users").findOne({ email: req.params.email });
    res.send({ isAdmin: user?.role === "admin" });
  } catch (error) {
    res.status(500).send({ message: "Failed to verify admin", error });
  }
});

app.patch('/users/role/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const { currentRole } = req.body;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const result = await db.collection("Users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role: newRole } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update role", error });
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const { displayName, photoURL } = req.body;
    const result = await db.collection("Users").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { displayName, photoURL } }
    );
    if (result.matchedCount === 0) return res.status(404).send({ message: "User not found" });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update user", error });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Users").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete user", error });
  }
});

// NEWS
app.post('/news', async (req, res) => {
  try {
    const db = await connectDB();
    const newsItem = req.body;
    if (!Array.isArray(newsItem.type)) newsItem.type = ["Normal"];
    const result = await db.collection("News").insertOne(newsItem);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to create news", error });
  }
});

app.get('/news', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("News").find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch news", error });
  }
});

app.get('/manage-news', async (req, res) => {
  try {
    const db = await connectDB();
    const email = req.query.email;
    if (!email) return res.status(400).send({ message: "Email is required" });
    const user = await db.collection("Users").findOne({ email });
    const query = user?.role !== 'admin' ? { userEmail: email } : {};
    const result = await db.collection("News").find(query).sort({ _id: -1 }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to manage news", error });
  }
});

app.patch('/news/toggle-type/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const filter = { _id: new ObjectId(req.params.id) };
    const newsItem = await db.collection("News").findOne(filter);
    if (!newsItem) return res.status(404).send({ message: "News not found" });
    const { flag } = req.body;
    const updatedTypes = newsItem.type.includes(flag)
      ? newsItem.type.filter(t => t !== flag)
      : [...newsItem.type, flag];
    const result = await db.collection("News").updateOne(filter, { $set: { type: updatedTypes } });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to toggle news type", error });
  }
});

app.patch('/news-update/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("News").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { headline: req.body.headline, category: req.body.category, writing: req.body.writing, writer: req.body.writer, designer: req.body.designer, source: req.body.source, image: req.body.image, type: req.body.type } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update news", error });
  }
});

app.get('/news/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("News").findOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch news details", error });
  }
});

app.delete('/news/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("News").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete news", error });
  }
});

// ADS
app.post('/ads', async (req, res) => {
  try {
    const db = await connectDB();
    const adData = req.body;
    adData.status = "activate";
    adData.createdAt = new Date();
    const result = await db.collection("Ads").insertOne(adData);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to create ad", error });
  }
});

app.get('/ads', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Ads").find().sort({ _id: -1 }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch ads", error });
  }
});

app.get('/ads/active', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Ads").find({ status: "activate" }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch active ads", error });
  }
});

app.patch('/ads/toggle-status/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const { currentStatus } = req.body;
    const newStatus = currentStatus === 'activate' ? 'deactivate' : 'activate';
    const result = await db.collection("Ads").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: newStatus } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to toggle ad status", error });
  }
});

app.patch('/ads-update/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Ads").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { adsName: req.body.adsName, adsURL: req.body.adsURL, image: req.body.image } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update ad", error });
  }
});

app.get('/ads/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Ads").findOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch ad", error });
  }
});

app.delete('/ads/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Ads").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete ad", error });
  }
});

// CAREERS
app.post('/careers', async (req, res) => {
  try {
    const db = await connectDB();
    const jobData = req.body;
    jobData.status = "activated";
    jobData.postedAt = new Date();
    const result = await db.collection("Careers").insertOne(jobData);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to create career", error });
  }
});

app.get('/careers', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Careers").find().sort({ postedAt: -1 }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch careers", error });
  }
});

app.patch('/careers/toggle-status/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const { currentStatus } = req.body;
    const newStatus = currentStatus === 'activated' ? 'deactivated' : 'activated';
    const result = await db.collection("Careers").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: newStatus } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to toggle career status", error });
  }
});

app.get('/careers/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid ID" });
    const result = await db.collection("Careers").findOne({ _id: new ObjectId(id) });
    if (!result) return res.status(404).send({ message: "Career not found" });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch career", error });
  }
});

app.patch('/careers/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid ID" });
    const result = await db.collection("Careers").updateOne(
      { _id: new ObjectId(id) },
      { $set: { role: req.body.role, type: req.body.type, location: req.body.location, salary: req.body.salary, deadline: req.body.deadline, link: req.body.link, requirements: req.body.requirements, jobDeatils: req.body.jobDeatils } }
    );
    if (result.matchedCount === 0) return res.status(404).send({ message: "Career not found" });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to update career", error });
  }
});

app.delete('/careers/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Careers").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to delete career", error });
  }
});

// INTERNSHIPS
app.post('/internships', async (req, res) => {
  try {
    const db = await connectDB();
    const payload = req.body;
    payload.startingDate = clearDateFormat(payload.startingDate);
    payload.finishingDate = clearDateFormat(payload.finishingDate);
    const result = await db.collection("Intership").insertOne(payload);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: true, message: "Internal server error" });
  }
});

app.get('/internships', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Intership").find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: true, message: "Failed to fetch internships" });
  }
});

app.get('/public/internship/id/:internshipID', async (req, res) => {
  try {
    const db = await connectDB();
    const targetCredentialId = req.params.internshipID.trim();
    const result = await db.collection("Intership").findOne({
      internshipID: { $regex: new RegExp(`^${targetCredentialId}$`, 'i') },
      status: "activated"
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: true, message: "Internal server error" });
  }
});

app.get('/public/internships/name', async (req, res) => {
  try {
    const db = await connectDB();
    const cleanQuery = (req.query.query || "").trim();
    if (!cleanQuery) return res.send([]);
    const result = await db.collection("Intership")
      .find({ name: { $regex: cleanQuery, $options: 'i' }, status: "activated" })
      .limit(15)
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: true, message: "Query evaluation error" });
  }
});

app.patch('/internships/update/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const payload = req.body;
    const result = await db.collection("Intership").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { internshipID: payload.internshipID, name: payload.name, internshipName: payload.internshipName, batch: payload.batch, duration: payload.duration, startingDate: clearDateFormat(payload.startingDate), finishingDate: clearDateFormat(payload.finishingDate), currentStatus: payload.currentStatus, certificateURL: payload.certificateURL } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: true, message: "Failed to update internship" });
  }
});

app.patch('/internships/status/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Intership").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: req.body.status } }
    );
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: true, message: "Failed to update internship status" });
  }
});

app.get('/internships/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Intership").findOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: true, message: "Failed to fetch internship" });
  }
});

app.delete('/internships/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("Intership").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: true, message: "Failed to delete internship" });
  }
});


// NEWSLETTER
app.post('/newsletter', async (req, res) => {
  try {
    const db = await connectDB();
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const exists = await db.collection("newsletter").findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already subscribed" });
    }
    const result = await db.collection("newsletter").insertOne({ email, subscribedAt: new Date() });
    res.status(201).json({ success: true, message: "Subscribed successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/newsletter', async (req, res) => {
  try {
    const db = await connectDB();
    const emails = await db.collection("newsletter").find().sort({ subscribedAt: -1 }).toArray();
    res.json({ success: true, data: emails });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/newsletter/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("newsletter").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, message: "Email deleted successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`The Internet Today is running on port ${port}`);
  });
}

module.exports = app;