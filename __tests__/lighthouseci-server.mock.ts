// __tests__/lighthouseci-server.mock.ts

import express from 'express'
import {
  ancestorBuildFixture,
  currentBuildFixture,
  runFixture,
  ancestorRunFixture,
  buildListFixture
} from './api-service.fixtures'

const app = express()
const port = 3000 // You can choose any port that suits your needs

app.use(express.json())

app.get('/v1/projects/:projectId/builds', (req, res) => {
  res.json(buildListFixture)
})
app.get('/v1/projects/:projectId/builds/:buildId', (req, res) => {
  if (req.params.buildId === currentBuildFixture.id) {
    res.json(currentBuildFixture)
  } else if (req.params.buildId === ancestorBuildFixture.id) {
    res.json(ancestorBuildFixture)
  } else {
    res.status(404).send('Build not found')
  }
})
app.get('/v1/projects/:projectId/builds/:buildId/ancestor', (req, res) => {
  res.json(ancestorBuildFixture)
})
app.get('/v1/projects/:projectId/builds/:buildId/runs', (req, res) => {
  const buildId = req.params.buildId
  if (buildId === currentBuildFixture.id) {
    res.json(runFixture)
  } else if (buildId === ancestorBuildFixture.id) {
    res.json(ancestorRunFixture)
  } else {
    res.status(404).send('Runs not found')
  }
})
app.get('/v1/', (req, res) => {
  res.send('Lighthouse CI API')
})

app.listen(port, () => {
  console.log(`Mock Lighthouse CI server listening at http://localhost:${port}`)
})
