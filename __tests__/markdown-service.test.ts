import {
  createMarkdownTableRow,
  formatReportComparisonAsMarkdown,
  getMarkdownTableCell
} from '../src/markdown-service'
import {
  comparedResultFixture,
  linksJsonFixture
} from './compare-service.fixtures'
import fs from 'fs'

describe('markdown-service', () => {
  beforeEach(() => {
    jest.mock('fs')
  })
  afterEach(() => {
    jest.resetAllMocks()
  })
  it('should get markdown table cell for lcp improving', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 100,
      isRegression: false,
      diffValue: 10,
      metricUnit: 'ms',
      metricType: 'lcp'
    })
    expect(cell).toEqual('[100 ms 🟢](## "The lcp has decreased in 10 ms")')
  })
  it('should get markdown table cell for lcp regressing', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 1000,
      isRegression: true,
      diffValue: 500,
      metricUnit: 'ms',
      metricType: 'lcp'
    })
    expect(cell).toEqual('[1000 ms 🔴](## "The lcp has increased in +500 ms")')
  })
  it('should get markdown table cell for cls improving', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 0.1,
      isRegression: false,
      diffValue: 0.01,
      metricUnit: '',
      metricType: 'cls'
    })
    expect(cell).toEqual('[0.1 🟢](## "The CLS has decreased in 0.01")')
  })
  it('should get markdown table cell for cls regressing', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 0.2,
      isRegression: true,
      diffValue: 0.05,
      metricUnit: '',
      metricType: 'cls'
    })
    expect(cell).toEqual('[0.2 🔴](## "The CLS has increased in + 0.05")')
  })
  it('should get markdown table cell for performance improving', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 80,
      isRegression: false,
      diffValue: 1,
      metricUnit: '/100',
      metricType: 'performance'
    })
    expect(cell).toEqual(
      '[80/100 🟢](## "Performance has improved in +1 points")'
    )
  })
  it('should get markdown table cell for performance regressing', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 70,
      isRegression: true,
      diffValue: 20,
      metricUnit: '/100',
      metricType: 'performance'
    })
    expect(cell).toEqual(
      '[70/100 🔴](## "Performance has decreased in 20 points")'
    )
  })
  it('should get markdown table cell for tbt improving', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 2000,
      isRegression: false,
      diffValue: 100,
      metricUnit: 'ms',
      metricType: 'tbt'
    })
    expect(cell).toEqual('[2000 ms 🟢](## "The tbt has decreased in 100 ms")')
  })
  it('should get markdown table cell for tbt regressing', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 3000,
      isRegression: true,
      diffValue: 500,
      metricUnit: 'ms',
      metricType: 'tbt'
    })
    expect(cell).toEqual('[3000 ms 🔴](## "The tbt has increased in +500 ms")')
  })
  it('should get an empty markdown table cell for unknown metric type', () => {
    // Test the getMarkdownTableCell function
    const cell = getMarkdownTableCell({
      currentValue: 3000,
      isRegression: true,
      diffValue: 500,
      metricUnit: 'ms',
      metricType: 'unknown'
    })
    expect(cell).toEqual('')
  })
  it('should create a markdown table row', () => {
    const row = createMarkdownTableRow({
      comparedMetrics: comparedResultFixture,
      url: 'https://example.com/',
      link: 'https://example.com/report'
    })
    expect(row).toBe(
      '| [/](https://example.com/) | [72/100 🟢](## "Performance has improved in +0 points") | [1338 ms 🔴](## "The lcp has increased in +110 ms") | [0.059 🟢](## "The CLS has decreased in 0") | [1747 ms 🟢](## "The tbt has decreased in -42 ms") | [Report](https://example.com/report) |'
    )
  })
  it('should create a different markdown table row with a different url', () => {
    const row = createMarkdownTableRow({
      comparedMetrics: comparedResultFixture,
      url: 'https://example.com/_maison_jardin_/offres',
      link: 'https://example.com/_maison_jardin_/offres/report'
    })
    expect(row).toBe(
      '| [/_maison_jardin_/offres](https://example.com/_maison_jardin_/offres) | [68/100 🔴](## "Performance has decreased in -3 points") | [2045 ms 🔴](## "The lcp has increased in +532 ms") | [0.048 🟢](## "The CLS has decreased in 0") | [2518 ms 🔴](## "The tbt has increased in +258 ms") | [Report](https://example.com/_maison_jardin_/offres/report) |'
    )
  })

  it('should print the entire markdown table', () => {
    fs.readFileSync = jest
      .fn()
      .mockReturnValue(JSON.stringify(linksJsonFixture))
    // Test the formatReportComparisonAsMarkdown function

    const markdown = formatReportComparisonAsMarkdown({
      comparedMetrics: comparedResultFixture,
      inputPath: 'test'
    })
    expect(markdown).toContain(
      '| URL | Performance | LCP | CLS | TBT | Link to Report |'
    )
    expect(markdown).toContain(
      '|:--- |:-----------:| ---:| ---:| ---:|:-------------- |'
    )
  })
})
