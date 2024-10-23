import * as core from '@actions/core'
import { ComparisonResultsByURLInterface, InputsInterface } from './types.d'
import { getBuilds, getLighthouseCIRuns } from './api-service'
import { compareLHRs } from './compare-service'
import { formatReportComparisonAsMarkdown } from './markdown-service'
import path from 'path'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const inputs: InputsInterface = {
    linksFilePath: path.resolve(process.cwd(), core.getInput('links-filepath')), // Resolve path
    baseUrl: core.getInput('base-url'),
    projectId: core.getInput('project-id'),
    currentCommitSha: core.getInput('current-commit-sha'),
    shouldFailBuild: core.getInput('should-fail-build') === 'true'
  }
  try {
    if (
      !inputs.linksFilePath ||
      !inputs.baseUrl ||
      !inputs.projectId ||
      !inputs.currentCommitSha
    ) {
      throw new Error(
        '[main][ERROR]Missing required inputs. Please check the action configuration.'
      )
    }
    const { markdownResult, comparedMetrics } = await executeRun({
      inputs,
      debug: core.debug
    })
    /* istanbul ignore next */
    core.setOutput('markdown', markdownResult)
    /* istanbul ignore next */
    core.setOutput('comparedMetrics', comparedMetrics)
    core.setOutput('status', 'success')
    core.setOutput('failReason', '')
  } catch (error) {
    core.setOutput('status', 'failure')
    if (error instanceof Error) core.setOutput('failReason', error.message)
    if (inputs.shouldFailBuild) {
      // Fail the workflow run if an error occurs
      if (error instanceof Error) core.setFailed(error.message)
    }
  }
}

export const executeRun = async ({
  inputs,
  debug
}: {
  inputs: InputsInterface
  debug: typeof core.debug
}): Promise<{
  markdownResult: string
  comparedMetrics: ComparisonResultsByURLInterface
}> => {
  if (core.isDebug()) {
    debug('Running action and printing inputs...')
    debug(`Inputs: ${JSON.stringify(inputs, null, 2)}`)
  }
  const { build, ancestorBuild } = await getBuilds(inputs)
  if (core.isDebug()) {
    debug('Printing build and ancestor build...')
    debug(`Build: ${JSON.stringify(build, null, 2)}`)
    debug(`Ancestor Build: ${JSON.stringify(ancestorBuild, null, 2)}`)
  }
  const { runs, ancestorRuns } = await getLighthouseCIRuns({
    baseUrl: inputs.baseUrl,
    projectId: inputs.projectId,
    buildId: build.id,
    ancestorBuildId: ancestorBuild.id
  })
  if (core.isDebug()) {
    debug('Printing runs and ancestor runs...')
    debug(`Run: ${JSON.stringify(runs, null, 2)}`)
    debug(`Ancestor Run: ${JSON.stringify(ancestorRuns, null, 2)}`)
  }
  const comparedMetrics = compareLHRs({ runs, ancestorRuns })
  if (core.isDebug()) {
    debug('Printing compared metrics...')
    debug(`Compared Results: ${comparedMetrics}`)
  }
  const markdownResult = formatReportComparisonAsMarkdown({
    comparedMetrics,
    inputPath: inputs.linksFilePath
  })
  if (core.isDebug()) {
    debug('Printing markdown result and compared metrics...')
    /* istanbul ignore next */
    debug(`Markdown Result: \n${markdownResult}`)
  }

  return { markdownResult, comparedMetrics }
}
