import { compareLHRs } from '../src/compare-service'
import { runFixture, ancestorRunFixture } from './api-service.fixtures'
import { comparedResultFixture } from './compare-service.fixtures'

describe('compare-service', () => {
  it('should compare LHRs and match the fixture', () => {
    const runs = runFixture
    const ancestorRuns = ancestorRunFixture
    const comparisonResults = compareLHRs({ runs, ancestorRuns })
    expect(comparisonResults).toEqual(comparedResultFixture)
  })
})
