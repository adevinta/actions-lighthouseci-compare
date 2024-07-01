import * as core from '@actions/core'
import { InputsInterface } from './types.d'
import { getBuilds, getLighthouseCIRuns } from './api-service'
import { compareLHRs } from './compare-service'
import { formatReportComparisonAsMarkdown } from './markdown-service'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs: InputsInterface = {
      linksFilePath: core.getInput('links-filepath'),
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
    core.debug('Running action and printing inputs...')
    core.debug(`Inputs: ${JSON.stringify(inputs, null, 2)}`)
    const { build, ancestorBuild } = await getBuilds(inputs)
    core.debug('Printing build and ancestor build...')
    core.debug(`Build: ${JSON.stringify(build, null, 2)}`)
    core.debug(`Ancestor Build: ${JSON.stringify(ancestorBuild, null, 2)}`)
    const { runs, ancestorRuns } = await getLighthouseCIRuns({
      baseUrl: inputs.baseUrl,
      projectId: inputs.projectId,
      buildId: build.id,
      ancestorBuildId: ancestorBuild.id
    })
    core.debug('Printing runs and ancestor runs...')
    core.debug(`Run: ${runs}}`)
    core.debug(`Ancestor Run: ${ancestorRuns}`)
    const comparedMetrics = compareLHRs({ runs, ancestorRuns })
    core.debug('Printing compared metrics...')
    core.debug(`Compared Results: ${comparedMetrics}`)
    const markdownResult = formatReportComparisonAsMarkdown({
      comparedMetrics,
      inputPath: inputs.linksFilePath
    })
    core.debug('Printing markdown result and compared metrics...')
    /* istanbul ignore next */
    core.debug(`Markdown Result: \n${markdownResult}`)
    /* istanbul ignore next */
    core.setOutput('markdown', markdownResult)
    /* istanbul ignore next */
    core.setOutput('comparedMetrics', comparedMetrics)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
