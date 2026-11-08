import express from 'express';
import cors from 'cors'
import 'dotenv/config'
import { MongoClient, ObjectId } from 'mongodb';

const app = express()
const port = 5000

// middleware
app.use(express.json())
app.use(cors())

// mongodb
const client = new MongoClient(process.env.MONGODB_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const connectedClient = await connectToMongoDB()
const database = connectedClient.db('hireloop')
const users = database.collection('user')
const jobs = database.collection('jobs')

// user
app.get('/users', async(req, res) => {
  const cursor = users.find({})
  const result = await cursor.toArray()
  res.send(result)
})

// jobreleted data
app.get('/jobs', async(req, res) => {
  const cursor = jobs.find({})
  const result = await cursor.toArray()
  res.send(result)
})

app.post('/jobs', async(req, res) => {
  const job = req.body
  const result = await jobs.insertOne(job)
  res.send(result)
})

app.delete('/jobs/:id', async(req, res) => {
  try {
    const result = await jobs.deleteOne({ _id: new ObjectId(req.params.id) })

    if (result.deletedCount === 0) {
      res.status(404).send({ message: 'Job not found' })
      return
    }

    res.send(result)
  } catch {
    res.status(400).send({ message: 'Invalid job id' })
  }
})


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})