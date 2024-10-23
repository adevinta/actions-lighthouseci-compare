/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as apiService from '../src/api-service'
import {
  ancestorBuildFixture,
  ancestorRunFixture,
  currentBuildFixture,
  runFixture
} from './api-service.fixtures'
import fs from 'fs'
import { linksJsonFixture } from './compare-service.fixtures'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// API service mocks
let getBuildsMock: jest.SpiedFunction<typeof apiService.getBuilds>
let getLighthouseCIRunsMock: jest.SpiedFunction<
  typeof apiService.getLighthouseCIRuns
>
// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(core, 'isDebug').mockReturnValue(true)
    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    // set api service mocks
    getBuildsMock = jest.spyOn(apiService, 'getBuilds')
    getLighthouseCIRunsMock = jest.spyOn(apiService, 'getLighthouseCIRuns')
    // mock filesystem module
    jest.mock('fs')
  })

  it('sets the compared metrics and the markdown table', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'links-filepath':
          return '.lighthouseci/links.json'
        case 'base-url':
          return 'https://lhci.bon-coin.net/v1'
        case 'project-id':
          return '765d9149-b2fd-486e-9e4c-bd38f02012c1'
        case 'current-commit-sha':
          return '59e778936f40d70edb2af15d61fdeb5cae661642'
        default:
          return ''
      }
    })
    // Mock the API service functions
    getBuildsMock.mockResolvedValue({
      build: currentBuildFixture,
      ancestorBuild: ancestorBuildFixture
    })
    getLighthouseCIRunsMock.mockResolvedValue({
      runs: runFixture,
      ancestorRuns: ancestorRunFixture
    })

    fs.readFileSync = jest
      .fn()
      .mockReturnValue(JSON.stringify(linksJsonFixture))

    await main.run()
    expect(runMock).toHaveReturned()
    expect(debugMock).toHaveBeenCalledTimes(16)
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      'Running action and printing inputs...'
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/Inputs/)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      3,
      'Printing build and ancestor build...'
    )
    expect(debugMock).toHaveBeenNthCalledWith(4, expect.stringMatching(/Build/))
    expect(debugMock).toHaveBeenNthCalledWith(
      5,
      expect.stringMatching(/Ancestor Build/)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      6,
      'Printing runs and ancestor runs...'
    )
    expect(debugMock).toHaveBeenNthCalledWith(7, expect.stringMatching(/Run/))
    expect(debugMock).toHaveBeenNthCalledWith(
      8,
      expect.stringMatching(/Ancestor Run/)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      13,
      'Printing compared metrics...'
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      14,
      expect.stringMatching(/Compared Results/)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      15,
      expect.stringMatching(/Printing markdown result and compared metrics.../)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      16,
      expect.stringMatching(/Markdown Result/)
    )
    expect(setOutputMock).toHaveBeenCalledTimes(4)
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'markdown',
      expect.any(String)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'comparedMetrics',
      expect.any(Object)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'status', 'success')
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'failReason', '')
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('should set the status output to "failure" if inputs are empty but not fail', async () => {
    // all inputs are empty
    getInputMock.mockImplementation(() => {
      return ''
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setOutputMock).toHaveBeenCalledTimes(2)
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'status', 'failure')
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'failReason',
      '[main][ERROR]Missing required inputs. Please check the action configuration.'
    )
    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
  })
  it('should set failure status if shouldFailBuild is true', async () => {
    getInputMock.mockImplementation(name => {
      if (name === 'should-fail-build') {
        return 'true'
      }
      return ''
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setOutputMock).toHaveBeenCalledTimes(2)
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'status', 'failure')
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'failReason',
      '[main][ERROR]Missing required inputs. Please check the action configuration.'
    )
    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalled()
  })
})
