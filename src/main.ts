import * as core from '@actions/core'
import { wait } from './wait'
import { InputsInterface } from './types'
import { getBuilds, getLighthouseCIRuns } from './api-service'
import { compareLHRs } from './compare-service'
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
    core.debug(`Inputs: ${JSON.stringify(inputs, null, 2)}`)
    const { build, ancestorBuild } = await getBuilds(inputs)
    core.debug(`Build: ${JSON.stringify(build, null, 2)}`)
    core.debug(`Ancestor Build: ${JSON.stringify(ancestorBuild, null, 2)}`)
    const { runs, ancestorRuns } = await getLighthouseCIRuns({
      baseUrl: inputs.baseUrl,
      projectId: inputs.projectId,
      buildId: build.id,
      ancestorBuildId: ancestorBuild.id
    })
    core.debug(`Run: ${runs}}`)
    core.debug(`Ancestor Run: ${ancestorRuns}`)
    const comparedResults = compareLHRs({ runs, ancestorRuns })
    core.debug(`Compared Results: ${comparedResults}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
