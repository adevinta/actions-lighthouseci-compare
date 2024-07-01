import * as core from '@actions/core'
import { InputsInterface } from './types.d'
import { getBuilds, getLighthouseCIRuns } from './api-service'
import { compareLHRs } from './compare-service'
import { formatReportComparisonAsMarkdown } from './markdown-service'
import path from 'path'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs: InputsInterface = {
      linksFilePath: path.resolve(
        process.cwd(),
        core.getInput('links-filepath')
      ), // Resolve path
      baseUrl: core.getInput('base-url'),
      projectId: core.getInput('project-id'),
      currentCommitSha: core.getInput('current-commit-sha')
    }
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
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export const executeRun = async ({
  inputs,
  debug
}: {
  inputs: InputsInterface
  debug: any
}) => {
  debug('Running action and printing inputs...')
  debug(`Inputs: ${JSON.stringify(inputs, null, 2)}`)
  const { build, ancestorBuild } = await getBuilds(inputs)
  debug('Printing build and ancestor build...')
  debug(`Build: ${JSON.stringify(build, null, 2)}`)
  debug(`Ancestor Build: ${JSON.stringify(ancestorBuild, null, 2)}`)
  const { runs, ancestorRuns } = await getLighthouseCIRuns({
    baseUrl: inputs.baseUrl,
    projectId: inputs.projectId,
    buildId: build.id,
    ancestorBuildId: ancestorBuild.id
  })
  debug('Printing runs and ancestor runs...')
  debug(`Run: ${runs}}`)
  debug(`Ancestor Run: ${ancestorRuns}`)
  const comparedMetrics = compareLHRs({ runs, ancestorRuns })
  debug('Printing compared metrics...')
  debug(`Compared Results: ${comparedMetrics}`)
  const markdownResult = formatReportComparisonAsMarkdown({
    comparedMetrics,
    inputPath: inputs.linksFilePath
  })
  debug('Printing markdown result and compared metrics...')
  /* istanbul ignore next */
  debug(`Markdown Result: \n${markdownResult}`)

  return { markdownResult, comparedMetrics }
}
