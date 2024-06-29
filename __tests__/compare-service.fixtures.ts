export const comparedResultFixture = {
  '/classified/latest/12': {
    performance: {
      currentValue: 73,
      previousValue: 75,
      diff: -2,
      isRegression: true
    },
    lcp: {
      currentValue: 1181,
      previousValue: 1061,
      diff: 120,
      isRegression: true
    },
    cls: {
      currentValue: 0.002,
      previousValue: 0.002,
      diff: 0,
      isRegression: false
    },
    tbt: {
      currentValue: 1803,
      previousValue: 1456,
      diff: 347,
      isRegression: true
    }
  },
  '/_maison_jardin_/offres': {
    performance: {
      currentValue: 68,
      previousValue: 71,
      diff: -3,
      isRegression: true
    },
    lcp: {
      currentValue: 2045,
      previousValue: 1513,
      diff: 532,
      isRegression: true
    },
    cls: {
      currentValue: 0.048,
      previousValue: 0.048,
      diff: 0,
      isRegression: false
    },
    tbt: {
      currentValue: 2518,
      previousValue: 2260,
      diff: 258,
      isRegression: true
    }
  },
  '/': {
    performance: {
      currentValue: 72,
      previousValue: 72,
      diff: 0,
      isRegression: false
    },
    lcp: {
      currentValue: 1338,
      previousValue: 1228,
      diff: 110,
      isRegression: true
    },
    cls: {
      currentValue: 0.059,
      previousValue: 0.059,
      diff: 0,
      isRegression: false
    },
    tbt: {
      currentValue: 1747,
      previousValue: 1789,
      diff: -42,
      isRegression: false
    }
  }
}

export const linksJsonFixture: { [key: string]: string } = {
  'https://lhci-lighthouse-ci-comparison-lbc.polaris.ariane.leboncoin.ci/':
    'https://lhci.bon-coin.net/app/projects/ravnext/compare/53a135c7-fc1e-4d7e-8636-f4a2852b1e6c?compareUrl=https%3A%2F%2Flhci-BRANCH_NAME-lbc.polaris.ariane.leboncoin.ci%2F',
  'https://lhci-lighthouse-ci-comparison-lbc.polaris.ariane.leboncoin.ci/_maison_jardin_/offres':
    'https://lhci.bon-coin.net/app/projects/ravnext/compare/53a135c7-fc1e-4d7e-8636-f4a2852b1e6c?compareUrl=https%3A%2F%2Flhci-BRANCH_NAME-lbc.polaris.ariane.leboncoin.ci%2F_maison_jardin_%2Foffres',
  'https://lhci-lighthouse-ci-comparison-lbc.polaris.ariane.leboncoin.ci/classified/latest/12':
    'https://lhci.bon-coin.net/app/projects/ravnext/compare/53a135c7-fc1e-4d7e-8636-f4a2852b1e6c?compareUrl=https%3A%2F%2Flhci-BRANCH_NAME-lbc.polaris.ariane.leboncoin.ci%2Fclassified%2Flatest%2F12'
}
