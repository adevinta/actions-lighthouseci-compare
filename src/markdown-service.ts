import { getComparisonLinksObject } from './compare-service'
import { ComparisonResultsByURLInterface } from './types.d'

export interface MarkdownTableCellInterface {
  currentValue: number
  isRegression: boolean
  diffValue: number
  metricUnit: string
  metricType: string
}

export const getMarkdownTableCell = ({
  currentValue,
  isRegression,
  diffValue,
  metricUnit,
  metricType
}: MarkdownTableCellInterface): string => {
  switch (metricType) {
    case 'performance':
      return `[${currentValue}${metricUnit} ${isRegression ? '🔴' : '🟢'}](## "Performance has ${
        isRegression ? 'decreased in ' : 'improved in +'
      }${diffValue} points")`
    case 'lcp':
    case 'tbt':
      return `[${currentValue} ms ${isRegression ? '🔴' : '🟢'}](## "The ${metricType} has ${
        isRegression ? 'increased in +' : 'decreased in '
      }${diffValue} ms")`
    case 'cls':
      return `[${currentValue} ${isRegression ? '🔴' : '🟢'}](## "The CLS has ${
        isRegression ? 'increased in +' : 'decreased in'
      } ${diffValue}")`
    default:
      return ''
  }
}

export const createMarkdownTableRow = ({
  url,
  comparedMetrics,
  link
}: {
  comparedMetrics: ComparisonResultsByURLInterface
  url: string
  link: string
}): string => {
  const urlPathname = new URL(url).pathname
  const { performance, lcp, tbt, cls } = comparedMetrics[urlPathname]
  return `| [${new URL(url).pathname}](${url}) | ${getMarkdownTableCell({
    currentValue: performance.currentValue,
    isRegression: performance.isRegression,
    diffValue: performance.diff,
    metricType: 'performance',
    metricUnit: '/100'
  })} | ${getMarkdownTableCell({
    currentValue: lcp.currentValue,
    isRegression: lcp.isRegression,
    diffValue: lcp.diff,
    metricUnit: 'ms',
    metricType: 'lcp'
  })} | ${getMarkdownTableCell({
    currentValue: cls.currentValue,
    isRegression: cls.isRegression,
    diffValue: cls.diff,
    metricUnit: '',
    metricType: 'cls'
  })} | ${getMarkdownTableCell({
    currentValue: tbt.currentValue,
    isRegression: tbt.isRegression,
    diffValue: tbt.diff,
    metricUnit: 'ms',
    metricType: 'tbt'
  })} | [Report](${link}) |`
}
/* istanbul ignore next */
export const formatReportComparisonAsMarkdown = ({
  comparedMetrics,
  inputPath
}: {
  comparedMetrics: ComparisonResultsByURLInterface
  inputPath: string
}): string => {
  const comparison = getComparisonLinksObject({ inputPath })
  return `
| URL | Performance | LCP | CLS | TBT | Link to Report |
|:--- |:-----------:| ---:| ---:| ---:|:-------------- |
${Object.entries(comparison)
  .map(([url, link]) => {
    return createMarkdownTableRow({ url, comparedMetrics, link })
  })
  .join('\n')}
`.toString()
}
