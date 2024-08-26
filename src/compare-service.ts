import { ComparisonResultsInterface, RunInterface } from './types.d'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type Result from 'lighthouse/types/lhr/lhr'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { Result as AuditResult } from 'lighthouse/types/lhr/audit-result'
import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'

export const compareLHRs = ({
  runs,
  ancestorRuns
}: {
  runs: RunInterface[]
  ancestorRuns: RunInterface[]
}): {
  [key: string]: ComparisonResultsInterface
} => {
  const buildLHR = runs.map(run => {
    const parsedLHR: RunInterface = { ...run }
    if (typeof run.lhr === 'string') {
      parsedLHR.lhr = JSON.parse(run.lhr) as Result
    }
    return parsedLHR
  })
  const ancestorBuildLHR = ancestorRuns.map(run => {
    const parsedLHR: RunInterface = { ...run }
    if (typeof run.lhr === 'string') {
      parsedLHR.lhr = JSON.parse(run.lhr) as Result
    }
    return parsedLHR
  })

  core.debug('BuildLHR:\n', JSON.stringify(buildLHR, null, 2))
  core.debug('ancestorBuildLHR:\n', JSON.stringify(ancestorBuildLHR, null, 2))

  // create object with the url as key
  const buildLHRObject: {
    [key: string]: ComparisonResultsInterface
  } = {}
  for (const run of buildLHR) {
    // find the ancestor run that matches the current run URL
    const ancestorRun = ancestorBuildLHR.filter(
      currentAncestorRun => currentAncestorRun.url === run.url
    )[0]
    if (typeof run.lhr !== 'string' || typeof ancestorRun.lhr !== 'string') {
      const runLHR: Result = run.lhr as Result
      const ancestorRunLHR: Result = ancestorRun.lhr as Result
      // get the performance score, lcp, tbt and cls of the current run and the ancestor run and compare them
      const performance: Result.Category = runLHR.categories.performance
      const ancestorPerformance: Result.Category =
        ancestorRunLHR.categories.performance
      const currentPerformance =
        (performance.score ? performance.score : 0) * 100
      const previousPerformance =
        (ancestorPerformance.score ? ancestorPerformance.score : 0) * 100
      const diffPerformance = currentPerformance - previousPerformance
      const isPerformanceRegression = diffPerformance < 0
      const lcp: AuditResult = runLHR.audits[
        'largest-contentful-paint'
      ] as AuditResult
      const ancestorLCP: AuditResult = ancestorRunLHR.audits[
        'largest-contentful-paint'
      ] as AuditResult
      const currentLCP = parseFloat(
        (lcp.numericValue ? lcp.numericValue : 0).toFixed(0)
      )
      const previousLCP = parseFloat(
        (ancestorLCP.numericValue ? ancestorLCP.numericValue : 0).toFixed(0)
      )
      const diffLCP = currentLCP - previousLCP
      const isLCPRegression = diffLCP > 0

      const tbt: AuditResult = runLHR.audits[
        'total-blocking-time'
      ] as AuditResult
      const ancestorTBT: AuditResult = ancestorRunLHR.audits[
        'total-blocking-time'
      ] as AuditResult
      const currentTBT = parseFloat(
        (tbt.numericValue ? tbt.numericValue : 0).toFixed(0)
      )
      const previousTBT = parseFloat(
        (ancestorTBT.numericValue ? ancestorTBT.numericValue : 0).toFixed(0)
      )
      const diffTBT = currentTBT - previousTBT
      const isTBTRegression = diffTBT > 0

      const cls: AuditResult = runLHR.audits[
        'cumulative-layout-shift'
      ] as AuditResult
      const ancestorCLS: AuditResult = ancestorRunLHR.audits[
        'cumulative-layout-shift'
      ] as AuditResult
      const currentCLS = parseFloat(
        (cls.numericValue ? cls.numericValue : 0).toFixed(3)
      )
      const previousCLS = parseFloat(
        (ancestorCLS.numericValue ? ancestorCLS.numericValue : 0).toFixed(3)
      )
      const diffCLS = currentCLS - previousCLS
      const isCLSRegression = diffCLS > 0

      // we will simplify the url to only be the pathname
      const urlKey = new URL(run.url).pathname
      buildLHRObject[urlKey] = {
        performance: {
          currentValue: currentPerformance,
          previousValue: previousPerformance,
          diff: diffPerformance,
          isRegression: isPerformanceRegression
        },
        lcp: {
          currentValue: currentLCP,
          previousValue: previousLCP,
          diff: diffLCP,
          isRegression: isLCPRegression
        },
        cls: {
          currentValue: currentCLS,
          previousValue: previousCLS,
          diff: diffCLS,
          isRegression: isCLSRegression
        },
        tbt: {
          currentValue: currentTBT,
          previousValue: previousTBT,
          diff: diffTBT,
          isRegression: isTBTRegression
        }
      }
    }
  }
  return buildLHRObject
}

export const readFileAsJson = ({
  filepath
}: {
  filepath: string
}): { [key: string]: string } => {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, filepath), 'utf-8'))
}

export const getComparisonLinksObject = ({
  inputPath
}: {
  inputPath: string
}): { [key: string]: string } => {
  return readFileAsJson({ filepath: inputPath })
}
