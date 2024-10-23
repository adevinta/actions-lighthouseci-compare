import { compareLHRs } from '../src/compare-service'
import { runFixture, ancestorRunFixture } from './api-service.fixtures'
import { comparedResultFixture } from './compare-service.fixtures'
import * as core from '@actions/core'

describe('compare-service', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })
  it('should compare LHRs and match the fixture', () => {
    jest.spyOn(core, 'isDebug').mockReturnValue(false)
    const runs = runFixture
    const ancestorRuns = ancestorRunFixture
    const comparisonResults = compareLHRs({ runs, ancestorRuns })
    expect(comparisonResults).toEqual(comparedResultFixture)
  })
  it('should display an error message when parsing fails', () => {
    jest.spyOn(core, 'isDebug').mockReturnValue(true)
    jest.spyOn(core, 'debug').mockImplementation()
    jest.spyOn(core, 'error').mockImplementation()
    const runs = [
      {
        ...runFixture[0],
        lhr: 'invalid-json'
      }
    ]
    const ancestorRuns = ancestorRunFixture
    const parsingError =
      'Unexpected token \'i\', "invalid-json" is not valid JSON'
    expect(() => compareLHRs({ runs, ancestorRuns })).toThrow(
      new Error(parsingError)
    )
    expect(core.debug).toHaveBeenCalledWith('Error parsing LHR:')
    expect(core.debug).toHaveBeenCalledWith(parsingError)
    expect(core.debug).toHaveBeenCalledWith('from run:')
  })
})
