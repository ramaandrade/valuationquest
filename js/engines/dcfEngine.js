// ValuationQuest - dcfEngine.js
// Motor matemático e lógica dos 10 Passos do Fluxo de Caixa Descontado (FCD)

const DCF_DEFAULTS = {
  companyName: 'Transmissão & Energia Alfa S.A.',
  sector: 'Utilidade Pública / Energia Elétrica',
  sharesOutstanding: 10000000, // 10 milhões de ações
  historical: [
    { year: 't-2', revenue: 100000, costs: 55000, ebitda: 45000, depr: 10000, ebit: 35000, ir: 11900, nopat: 23100, capex: 12000, ncg: 3000, fcf: 18100 },
    { year: 't-1', revenue: 108000, costs: 59400, ebitda: 48600, depr: 10500, ebit: 38100, ir: 12954, nopat: 25146, capex: 12500, ncg: 3200, fcf: 19946 },
    { year: 't0',  revenue: 116640, costs: 64152, ebitda: 52488, depr: 11000, ebit: 41488, ir: 14106, nopat: 27382, capex: 13000, ncg: 3500, fcf: 21882 }
  ],
  balanceSheet: {
    totalAssets: 285000,
    cash: 15000,
    currentAssetsOther: 45000,
    fixedAssets: 225000,
    shortTermDebt: 12000,
    longTermDebt: 33000,
    totalDebt: 45000,
    otherLiabilities: 30000,
    equityBook: 210000
  },
  capm: {
    krf: 0.0506,      // 5.06% Taxa Livre de Risco
    km: 0.1302,       // 13.02% Retorno de Mercado
    beta: 0.75,       // Beta do setor elétrico
    countryRisk: 0.035, // 3.50% Prêmio de risco país
    costOfDebt: 0.095, // 9.50% Kd bruto
    taxRate: 0.34,    // 34% Alíquota IR/CSLL
    equityWeight: 0.65, // 65% Capital Próprio
    debtWeight: 0.35    // 35% Dívida
  },
  scenarios: {
    pessimistic: {
      name: 'Pessimista',
      growthRate: 0.035,
      ebitdaMargin: 0.38,
      terminalGrowth: 0.020,
      waccAdjust: 0.015,
      description: 'Cenário adverso com menor consumo, compressão tarifária e juros elevados.'
    },
    base: {
      name: 'Esperado (Base)',
      growthRate: 0.070,
      ebitdaMargin: 0.45,
      terminalGrowth: 0.035,
      waccAdjust: 0.0,
      description: 'Cenário central seguindo o plano de expansão regulatório da ANEEL.'
    },
    optimistic: {
      name: 'Otimista',
      growthRate: 0.110,
      ebitdaMargin: 0.50,
      terminalGrowth: 0.045,
      waccAdjust: -0.015,
      description: 'Cenário favorável com ganhos de eficiência operacional e captação barata.'
    }
  }
};

/**
 * Calcula o Custo do Capital Próprio via CAPM
 * Ke = Krf + beta * (Km - Krf) + countryRisk
 */
function calculateKe(krf, beta, km, countryRisk = 0) {
  const equityRiskPremium = km - krf;
  return krf + (beta * equityRiskPremium) + countryRisk;
}

/**
 * Calcula o Custo Médio Ponderado de Capital (WACC)
 * WACC = Ke * (E/V) + Kd * (1 - T) * (D/V)
 */
function calculateWACC(ke, kd, taxRate, equityWeight, debtWeight) {
  const afterTaxKd = kd * (1 - taxRate);
  return (ke * equityWeight) + (afterTaxKd * debtWeight);
}

/**
 * Projeta os fluxos de caixa de 5 anos com base nas premissas
 */
function projectCashFlows(baseRevenue, assumptions, years = 5) {
  const { growthRate, ebitdaMargin, wacc } = assumptions;
  const taxRate = assumptions.taxRate !== undefined ? assumptions.taxRate : 0.34;
  const deprPercent = assumptions.deprPercent !== undefined ? assumptions.deprPercent : 0.09;
  const capexPercent = assumptions.capexPercent !== undefined ? assumptions.capexPercent : 0.105;
  const ncgPercent = assumptions.ncgPercent !== undefined ? assumptions.ncgPercent : 0.028;

  const projections = [];
  let prevRevenue = baseRevenue;

  for (let year = 1; year <= years; year++) {
    const revenue = prevRevenue * (1 + growthRate);
    const costs = revenue * (1 - ebitdaMargin);
    const ebitda = revenue * ebitdaMargin;
    const depr = revenue * deprPercent;
    const ebit = ebitda - depr;
    const ir = Math.max(0, ebit * taxRate);
    const nopat = ebit - ir;
    const capex = revenue * capexPercent;
    const deltaNcg = revenue * ncgPercent;
    const fcf = nopat + depr - capex - deltaNcg;
    const discountFactor = 1 / Math.pow(1 + wacc, year);
    const presentValue = fcf * discountFactor;

    projections.push({
      year,
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      ebitda: Math.round(ebitda),
      ebitdaMargin: ebitdaMargin,
      depr: Math.round(depr),
      ebit: Math.round(ebit),
      ir: Math.round(ir),
      nopat: Math.round(nopat),
      capex: Math.round(capex),
      deltaNcg: Math.round(deltaNcg),
      fcf: Math.round(fcf),
      discountFactor: Number(discountFactor.toFixed(4)),
      presentValue: Math.round(presentValue)
    });

    prevRevenue = revenue;
  }

  return projections;
}

/**
 * Calcula o Valor Terminal pela Perpetuidade de Gordon
 * VT = FCF(n+1) / (WACC - g)
 */
function calculateTerminalValue(lastFcf, terminalGrowth, wacc) {
  if (wacc <= terminalGrowth) {
    throw new Error('Inconsistência Econômica: O WACC deve ser estritamente maior que a taxa de crescimento perpétuo (g).');
  }
  const fcfNext = lastFcf * (1 + terminalGrowth);
  const terminalValue = fcfNext / (wacc - terminalGrowth);
  return {
    fcfNext: Math.round(fcfNext),
    terminalValue: Math.round(terminalValue)
  };
}

/**
 * Avaliação Completa FCD
 */
function runFullDCF(customParams = {}) {
  const defaults = DCF_DEFAULTS;
  const baseRevenue = customParams.baseRevenue || defaults.historical[2].revenue;
  const growthRate = customParams.growthRate !== undefined ? customParams.growthRate : defaults.scenarios.base.growthRate;
  const ebitdaMargin = customParams.ebitdaMargin !== undefined ? customParams.ebitdaMargin : defaults.scenarios.base.ebitdaMargin;
  const terminalGrowth = customParams.terminalGrowth !== undefined ? customParams.terminalGrowth : defaults.scenarios.base.terminalGrowth;
  
  // CAPM
  const krf = customParams.krf !== undefined ? customParams.krf : defaults.capm.krf;
  const km = customParams.km !== undefined ? customParams.km : defaults.capm.km;
  const beta = customParams.beta !== undefined ? customParams.beta : defaults.capm.beta;
  const countryRisk = customParams.countryRisk !== undefined ? customParams.countryRisk : defaults.capm.countryRisk;
  const costOfDebt = customParams.costOfDebt !== undefined ? customParams.costOfDebt : defaults.capm.costOfDebt;
  const taxRate = customParams.taxRate !== undefined ? customParams.taxRate : defaults.capm.taxRate;
  const equityWeight = customParams.equityWeight !== undefined ? customParams.equityWeight : defaults.capm.equityWeight;
  const debtWeight = customParams.debtWeight !== undefined ? customParams.debtWeight : defaults.capm.debtWeight;

  const ke = calculateKe(krf, beta, km, countryRisk);
  const rawWacc = calculateWACC(ke, costOfDebt, taxRate, equityWeight, debtWeight);
  const wacc = customParams.customWacc !== undefined ? customParams.customWacc : rawWacc;

  // Projeções
  const projections = projectCashFlows(baseRevenue, { growthRate, ebitdaMargin, wacc, taxRate }, 5);
  const sumPvExplicit = projections.reduce((acc, p) => acc + p.presentValue, 0);

  // Valor Terminal
  const lastFcf = projections[projections.length - 1].fcf;
  const { fcfNext, terminalValue } = calculateTerminalValue(lastFcf, terminalGrowth, wacc);
  const pvTerminalValue = Math.round(terminalValue / Math.pow(1 + wacc, projections.length));

  // Enterprise Value
  const enterpriseValue = sumPvExplicit + pvTerminalValue;

  // Dívida Líquida
  const totalDebt = customParams.totalDebt !== undefined ? customParams.totalDebt : defaults.balanceSheet.totalDebt;
  const cash = customParams.cash !== undefined ? customParams.cash : defaults.balanceSheet.cash;
  const netDebt = totalDebt - cash;

  // Shareholder Value & Share Price
  const shareholderValue = enterpriseValue - netDebt;
  const shares = customParams.sharesOutstanding || defaults.sharesOutstanding;
  const sharePrice = Number((shareholderValue / (shares / 1000)).toFixed(2)); // R$ por lote de 1.000 ou unitária

  return {
    ke,
    wacc,
    rawWacc,
    growthRate,
    ebitdaMargin,
    terminalGrowth,
    projections,
    sumPvExplicit,
    fcfNext,
    terminalValue,
    pvTerminalValue,
    terminalValueWeight: Number(((pvTerminalValue / enterpriseValue) * 100).toFixed(1)),
    enterpriseValue,
    totalDebt,
    cash,
    netDebt,
    shareholderValue,
    shares,
    sharePrice
  };
}

/**
 * Matriz de Sensibilidade (WACC vs Taxa de Crescimento Terminal g)
 */
function generateSensitivityMatrix(baseParams, waccSteps = [-0.02, -0.01, 0, 0.01, 0.02], gSteps = [-0.01, -0.005, 0, 0.005, 0.01]) {
  const baseEvaluation = runFullDCF(baseParams);
  const baseWacc = baseEvaluation.wacc;
  const baseG = baseEvaluation.terminalGrowth;

  const matrix = [];
  let minEv = Infinity;
  let maxEv = -Infinity;

  for (const dw of waccSteps) {
    const currentWacc = baseWacc + dw;
    const row = {
      wacc: currentWacc,
      waccLabel: (currentWacc * 100).toFixed(2) + '%',
      cells: []
    };

    for (const dg of gSteps) {
      const currentG = baseG + dg;
      if (currentWacc <= currentG) {
        row.cells.push({ g: currentG, ev: null, equity: null, valid: false });
        continue;
      }

      const evalResult = runFullDCF({
        ...baseParams,
        customWacc: currentWacc,
        terminalGrowth: currentG
      });

      if (evalResult.enterpriseValue < minEv) minEv = evalResult.enterpriseValue;
      if (evalResult.enterpriseValue > maxEv) maxEv = evalResult.enterpriseValue;

      row.cells.push({
        g: currentG,
        gLabel: (currentG * 100).toFixed(2) + '%',
        enterpriseValue: evalResult.enterpriseValue,
        shareholderValue: evalResult.shareholderValue,
        sharePrice: evalResult.sharePrice,
        valid: true
      });
    }
    matrix.push(row);
  }

  return {
    baseWacc,
    baseG,
    baseEnterpriseValue: baseEvaluation.enterpriseValue,
    baseShareholderValue: baseEvaluation.shareholderValue,
    minEv,
    maxEv,
    matrix,
    priceRange: {
      minPrice: Math.round(minEv * 0.92),
      centralPrice: baseEvaluation.enterpriseValue,
      maxPrice: Math.round(maxEv * 1.05)
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DCF_DEFAULTS,
    calculateKe,
    calculateWACC,
    projectCashFlows,
    calculateTerminalValue,
    runFullDCF,
    generateSensitivityMatrix
  };
}
