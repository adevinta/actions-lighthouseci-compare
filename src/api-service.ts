import { BuildInterface, InputsInterface, RunInterface } from './types.d'

export const getBuilds = async ({
  baseUrl,
  projectId,
  currentCommitSha,
  basicAuthUsername,
  basicAuthPassword
}: InputsInterface): Promise<{
  build: BuildInterface
  ancestorBuild: BuildInterface
}> => {
  const PROJECT_URL = `${baseUrl}/projects/${projectId}`
  const CURRENT_COMMIT_SHA = currentCommitSha
  const BUILD_LIST_URL = `${PROJECT_URL}/builds?limit=20`

  console.log('Build List URL \n', BUILD_LIST_URL)

  const basicAuthHeaders = new Headers()
  if (basicAuthUsername && basicAuthPassword) {
    console.log('Basic Auth detected')
    basicAuthHeaders.append(
      'Authorization',
      `Basic ${btoa(`${basicAuthUsername}:${basicAuthPassword}`)}`
    )
  }
  const buildListResponse = await fetch(BUILD_LIST_URL, {
    headers: basicAuthHeaders
  })
  if (!buildListResponse.ok) {
    let err = ''
    if (buildListResponse.status && buildListResponse.statusText) {
      err = ` (${buildListResponse.status}: ${buildListResponse.statusText})`
    }
    throw new Error(
      `[api-service][ERROR]: Could not get builds from LHCI API${err}`
    )
  }
  const builds = (await buildListResponse.json()) as BuildInterface[]

  // find the build that matches the commit hash
  const build: BuildInterface = builds.filter(
    currentBuild => currentBuild.hash === CURRENT_COMMIT_SHA
  )[0]
  if (!build?.id) {
    throw new Error(
      `[api-service][ERROR]: Could not find build for commit hash {${CURRENT_COMMIT_SHA}}`
    )
  }
  // get the ancestor of the build from the lighthouse-ci API
  const responseAncestor = await fetch(
    `${PROJECT_URL}/builds/${build.id}/ancestor`
  )
  if (!responseAncestor.ok) {
    let err = ''
    if (responseAncestor.status && responseAncestor.statusText) {
      err = ` (${responseAncestor.status}: ${responseAncestor.statusText})`
    }
    throw new Error(
      `[api-service][ERROR]: Could not get ancestor build for build {${build.id}}${err}`
    )
  }
  const ancestorBuild: BuildInterface = await responseAncestor.json()
  if (!ancestorBuild?.id) {
    throw new Error(
      `[api-service][ERROR]: Could not find ancestor build for build {${build.id}}`
    )
  }
  return { build, ancestorBuild }
}

export const getLighthouseCIRuns = async ({
  baseUrl,
  projectId,
  buildId,
  ancestorBuildId,
  basicAuthUsername,
  basicAuthPassword
}: {
  baseUrl: string
  projectId: string
  buildId: string
  ancestorBuildId: string
  basicAuthUsername: string
  basicAuthPassword: string
}): Promise<{ runs: RunInterface[]; ancestorRuns: RunInterface[] }> => {
  const PROJECT_URL = `${baseUrl}/projects/${projectId}`
  const basicAuthHeaders = new Headers()
  if (basicAuthUsername && basicAuthPassword) {
    basicAuthHeaders.append(
      'Authorization',
      `Basic ${btoa(`${basicAuthUsername}:${basicAuthPassword}`)}`
    )
  }
  const [runResponse, ancestorRunResponse] = await Promise.all([
    fetch(`${PROJECT_URL}/builds/${buildId}/runs?representative=true`, {
      headers: basicAuthHeaders
    }),
    fetch(`${PROJECT_URL}/builds/${ancestorBuildId}/runs?representative=true`, {
      headers: basicAuthHeaders
    })
  ])
  if (!runResponse.ok || !ancestorRunResponse.ok) {
    throw new Error(`[api-service][ERROR]: Could not get runs from LHCI API`)
  }

  const [runs, ancestorRuns] = await Promise.all([
    runResponse.json() as unknown as RunInterface[],
    ancestorRunResponse.json() as unknown as RunInterface[]
  ])
  return { runs, ancestorRuns }
}
