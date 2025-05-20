// __tests__/lighthouseci-server.mock.ts

import express from 'express'
import { Buffer } from 'buffer'
import {
  ancestorBuildFixture,
  currentBuildFixture,
  runFixture,
  ancestorRunFixture,
  buildListFixture
} from './api-service.fixtures'

const app = express()
const port = 3000 // You can choose any port that suits your needs

const USERNAME = 'admin'
const PASSWORD = 'password123'

const conditionalBasicAuth: express.RequestHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Check for auth header and skip if not present to simplify the test
  if (!req.headers['authorization']) {
    next()
    return
  }

  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const base64Credentials = authHeader.split(' ')[1]
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [username, password] = credentials.split(':')

  if (username === USERNAME && password === PASSWORD) {
    next()
    return
  }

  res.status(401).json({ message: 'Invalid credentials' })
}

app.use(express.json())

app.get('/v1/projects/:projectId/builds', conditionalBasicAuth, (req, res) => {
  res.json(buildListFixture)
})
app.get(
  '/v1/projects/:projectId/builds/:buildId',
  conditionalBasicAuth,
  (req, res) => {
    if (req.params.buildId === currentBuildFixture.id) {
      res.json(currentBuildFixture)
    } else if (req.params.buildId === ancestorBuildFixture.id) {
      res.json(ancestorBuildFixture)
    } else {
      res.status(404).send('Build not found')
    }
  }
)
app.get(
  '/v1/projects/:projectId/builds/:buildId/ancestor',
  conditionalBasicAuth,
  (req, res) => {
    res.json(ancestorBuildFixture)
  }
)
app.get(
  '/v1/projects/:projectId/builds/:buildId/runs',
  conditionalBasicAuth,
  (req, res) => {
    const buildId = req.params.buildId
    if (buildId === currentBuildFixture.id) {
      res.json(runFixture)
    } else if (buildId === ancestorBuildFixture.id) {
      res.json(ancestorRunFixture)
    } else {
      res.status(404).send('Runs not found')
    }
  }
)
app.get('/v1/', (req, res) => {
  res.send('Lighthouse CI API')
})

app.listen(port, () => {
  console.log(`Mock Lighthouse CI server listening at http://localhost:${port}`)
})
