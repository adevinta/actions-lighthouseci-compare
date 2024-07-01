import path from 'path'
import { executeRun } from '../src/main'
import { InputsInterface } from '../src/types.d'

const inputs: InputsInterface = {
  linksFilePath: path.resolve(process.cwd(), '.lighthouseci/links.json'), // Resolve path
  baseUrl: 'http://localhost:3000/v1',
  projectId: 'mock-project-id',
  currentCommitSha: '59e778936f40d70edb2af15d61fdeb5cae661649'
}

executeRun({ inputs, core: { debug: console.log } })
