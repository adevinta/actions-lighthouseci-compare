import { getBuilds, getLighthouseCIRuns } from '../src/api-service'
import { InputsInterface } from '../src/types.d'
import {
  currentBuildFixture,
  ancestorBuildFixture,
  buildListFixture,
  runFixture,
  ancestorRunFixture
} from './api-service.fixtures'

describe('api-service', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  const PROJECT_ID = '765d9149-b2fd-486e-9e4c-bd38f02012c0'
  const BASE_URL = 'https://lhci.bon-coin.net/v1'
  const CURRENT_COMMIT_SHA = '59e778936f40d70edb2af15d61fdeb5cae661649'

  const inputs: InputsInterface = {
    projectId: PROJECT_ID,
    baseUrl: BASE_URL,
    currentCommitSha: CURRENT_COMMIT_SHA,
    linksFilePath: '.lighthouseci/links.json',
    shouldFailBuild: false
  }

  const BASIC_AUTH_USERNAME = 'admin'
  const BASIC_AUTH_PASSWORD = 'password123'

  it('should get builds with valid Basic Auth credentials', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => buildListFixture
    })
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ancestorBuildFixture
    })
    const { build, ancestorBuild } = await getBuilds({
      ...inputs,
      basicAuthUsername: BASIC_AUTH_USERNAME,
      basicAuthPassword: BASIC_AUTH_PASSWORD
    })
    expect(build).toEqual(currentBuildFixture)
    expect(ancestorBuild).toEqual(ancestorBuildFixture)
    expect(fetch).toHaveBeenCalledTimes(2)
    // Check Authorization header
    const expectedHeader =
      'Basic ' +
      Buffer.from(`${BASIC_AUTH_USERNAME}:${BASIC_AUTH_PASSWORD}`).toString(
        'base64'
      )
    const callArgs = (fetch as jest.Mock).mock.calls[0][1]
    expect(callArgs.headers.get('Authorization')).toBe(expectedHeader)
  })

  it('should throw error when Basic Auth credentials are missing and server requires them', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' })
    })
    await expect(
      getBuilds({
        ...inputs,
        basicAuthUsername: undefined,
        basicAuthPassword: undefined
      })
    ).rejects.toThrow(
      '[api-service][ERROR]: Could not get builds from LHCI API'
    )
  })

  it('should throw error when Basic Auth credentials are invalid', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' })
    })
    await expect(
      getBuilds({
        ...inputs,
        basicAuthUsername: 'wrong',
        basicAuthPassword: 'wrong'
      })
    ).rejects.toThrow(
      '[api-service][ERROR]: Could not get builds from LHCI API'
    )
  })

  it('should get builds', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => buildListFixture
    })
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ancestorBuildFixture
    })
    const { build, ancestorBuild } = await getBuilds(inputs)

    // Assertions to verify the behavior based on the mocked fetch calls
    expect(build).toEqual(currentBuildFixture)
    expect(ancestorBuild).toEqual(ancestorBuildFixture)

    // Additional assertions can be added here to verify the number of calls, call parameters, etc.
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it('should throw error when build is not found', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => buildListFixture
    })

    const invalidInputs = {
      ...inputs,
      currentCommitSha: 'invalid-commit-sha'
    }
    await expect(getBuilds(invalidInputs)).rejects.toThrow(
      `[api-service][ERROR]: Could not get builds from LHCI API`
    )
  })
  it('should get lighthouse ci runs', async () => {
    const buildId = '1d5c4421-6587-4f19-84d6-ed91c6aa7c60'
    const ancestorBuildId = '8dc197b7-4fb7-4245-80d6-808d06b4556c'
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => runFixture
    })
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ancestorRunFixture
    })
    const { runs, ancestorRuns } = await getLighthouseCIRuns({
      baseUrl: BASE_URL,
      projectId: PROJECT_ID,
      buildId,
      ancestorBuildId,
      basicAuthUsername: BASIC_AUTH_USERNAME,
      basicAuthPassword: BASIC_AUTH_PASSWORD
    })

    // Assertions to verify the behavior based on the mocked fetch calls
    expect(runs).toEqual(runFixture)
    expect(ancestorRuns).toEqual(ancestorRunFixture)

    // Additional assertions can be added here to verify the number of calls, call parameters, etc.
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
