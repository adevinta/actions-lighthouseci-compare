// eslint-disable-next-line import/no-unresolved
import Result from 'lighthouse/types/lhr/lhr'
export interface InputsInterface {
  linksFilePath: string
  baseUrl: string
  projectId: string
  currentCommitSha: string
  shouldFailBuild?: boolean
  basicAuthUsername?: string
  basicAuthPassword?: string
}

export interface BuildInterface {
  id: string
  projectId: string
  lifecycle: string
  hash: string
  branch: string
  commitMessage: string
  author: string
  avatarUrl: string
  ancestorHash: string
  externalBuildUrl: string
  runAt: string
  committedAt: string
  ancestorCommittedAt: string
  createdAt: string
  updatedAt: string
}

export interface RunInterface {
  id: string
  projectId: string
  buildId: string
  representative: boolean
  url: string
  lhr: string | Result
  createdAt: string
  updatedAt: string
}
export interface ComparedRunInterface {
  currentValue: number
  previousValue: number
  diff: number
  isRegression: boolean
}
export interface ComparisonResultsInterface {
  performance: ComparedRunInterface
  lcp: ComparedRunInterface
  cls: ComparedRunInterface
  tbt: ComparedRunInterface
}
export interface ComparisonResultsByURLInterface {
  [key: string]: ComparisonResultsInterface
}
