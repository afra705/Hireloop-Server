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
const applications = database.collection('applications')

// user
app.get('/users', async(req, res) => {
  const cursor = users.find({})
  const result = await cursor.toArray()
  res.send(result)
})

// jobreleted data

app.get('/jobs', async (req, res) => {
  try {
    const query = {};

    console.log('Query:', req.query);

    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    if (req.query.isRemote) {
      query.isRemote = req.query.isRemote === 'true';
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.search) {
      const searchText = req.query.search;

      query.$or = [
        {
          title: {
            $regex: searchText,
            $options: 'i'
          }
        },
        {
          responsibilities: {
            $regex: searchText,
            $options: 'i'
          }
        },
        {
          requirements: {
            $regex: searchText,
            $options: 'i'
          }
        }
      ];
    }

    const result = await jobs.find(query).toArray();

    res.send(result);

  } catch (error) {
    console.error('Get Jobs Error:', error);

    res.status(500).send({
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});


app.post('/jobs', async(req, res) => {
  const job = req.body
  const result = await jobs.insertOne(job)
  res.send(result)
})

app.get('/jobs/:id', async(req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id)}
  const result = await jobs.findOne(query)
  res.send(result)
})

// applications related apis
app.post('/applications', async (req, res) => {
  try {
    const application = req.body
    const result = await applications.insertOne(application)
    res.send(result)
  } catch (error) {
    console.error(error)
    res.status(500).send({
      message: "Failed to submit application"
    })
  }
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