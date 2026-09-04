// ValuationQuest - inflationEngine.js
// Motor do Módulo III: O Desafio de Gestão na Crise Econômica (A Ameaça da Inflação)

const INFLATION_BASE_COMPANY = {
  name: 'Indústrias MetalSul S.A.',
  sector: 'Manufatura e Bens de Capital',
  initialRevenue: 200000,    // R$ 200M
  initialCosts: 130000,      // R$ 130M (insumos + mão de obra)
  initialFixedCosts: 30000,  // R$ 30M
  historicalDepr: 15000,     // Depreciação contábil histórica fixa (não indexada)
  baseWacc: 0.12,            // 12% a.a. pré-crise
  baseInflation: 0.045,      // 4.5% a.a. pré-crise
  priceElasticity: 0.75      // Elasticidade da demanda (se repassar demais, perde volume)
};

const INFLATION_ROUNDS = [
  {
    round: 1,
    name: 'Ano 1: O Choque Inicial de Custos',
    inflationRate: 0.085, // 8.5%
    costShock: 0.12,      // Custos sobem 12% (pressão de insumos e commodities)
    waccImpact: 0.025,    // WACC sobe 2.5 p.p. para 14.5%
    narrative: 'A economia entra em forte aceleração inflacionária. Os preços de energia e matérias-primas disparam 12%. O Banco Central eleva a taxa básica e o prêmio de risco dos investidores aumenta o WACC para 14,5%.'
  },
  {
    round: 2,
    name: 'Ano 2: O Pico da Crise e Juros Restritivos',
    inflationRate: 0.140, // 14.0%
    costShock: 0.18,      // Custos sobem 18%
    waccImpact: 0.055,    // WACC sobe 5.5 p.p. para 17.5%
    narrative: 'Inflação galopante atinge 14% a.a. O custo de crédito bancário e debêntures explode, empurrando o WACC da empresa para 17,5%. O Conselho exige ações drásticas para preservar o caixa.'
  },
  {
    round: 3,
    name: 'Ano 3: Estagflação e Teste de Sobrevivência',
    inflationRate: 0.105, // 10.5%
    costShock: 0.09,      // Custos sobem 9%
    waccImpact: 0.040,    // WACC estabiliza em 16.0%
    narrative: 'A atividade econômica desacelera, mas a inflação ainda resiste em 10,5%. É a hora da verdade: sua empresa conseguiu fazer o fluxo de caixa superar o aumento de WACC ou destruiu seu valuation?'
  }
];

const PASSTHROUGH_STRATEGIES = [
  {
    id: 'absorb',
    name: 'Absorção de Custos (Repasse Zero - 0%)',
    passPercent: 0.0,
    volumeEffect: 0.05, // ganha um pouco de market share
    description: 'Não reajusta preços para manter clientes. Margens operacionais são severamente comprimidas pela explosão dos insumos.'
  },
  {
    id: 'partial',
    name: 'Repasse Parcial Moderado (50%)',
    passPercent: 0.50,
    volumeEffect: -0.04, // perde 4% de volume
    description: 'Repassa metade da inflação de custos. Equilíbrio entre retenção de clientes e proteção parcial de margens.'
  },
  {
    id: 'full',
    name: 'Repasse Integral dos Custos (100%)',
    passPercent: 1.00,
    volumeEffect: -0.10, // perde 10% de volume por elasticidade
    description: 'Repassa 100% da alta de insumos aos preços de venda finais. Exige marca forte ou contratos com cláusulas de reajuste.'
  },
  {
    id: 'strategic',
    name: 'Repasse Estratégico + Eficiência de Processos (110% + Corte de Desperdício)',
    passPercent: 1.10,
    volumeEffect: -0.06, // corte de desperdício compensa elasticidade
    costEfficiencyBonus: 0.05, // 5% de economia em custos fixos
    description: 'Repasse assertivo com renegociação de compras e eliminação de desperdício na fábrica. Protege o FCF e combate a diluição do WACC.'
  }
];

/**
 * Simula uma rodada de inflação com a estratégia escolhida pelo aluno
 */
function simulateInflationRound(previousState, roundData, strategy) {
  const currentWacc = INFLATION_BASE_COMPANY.baseWacc + roundData.waccImpact;
  
  // Variação de custo
  const rawCostInflation = roundData.costShock;
  const costReduction = strategy.costEfficiencyBonus || 0;
  const effectiveCostMultiplier = (1 + rawCostInflation) * (1 - costReduction);

  // Preço e Volume
  const priceIncrease = rawCostInflation * strategy.passPercent;
  const volumeMultiplier = 1 + strategy.volumeEffect;

  const newRevenue = previousState.revenue * (1 + priceIncrease) * volumeMultiplier;
  const newVariableCosts = previousState.costs * effectiveCostMultiplier * volumeMultiplier;
  const newFixedCosts = previousState.fixedCosts * (1 + roundData.inflationRate * 0.8) * (1 - costReduction);

  const ebitda = newRevenue - newVariableCosts - newFixedCosts;
  
  // Distorção Tributária da Depreciação Histórica
  // Depreciação real necessária para repor ativos seria maior, mas fiscalmente fica travada no custo histórico
  const deprFiscal = previousState.historicalDepr; 
  const ebitContabil = ebitda - deprFiscal;
  const effectiveTax = Math.max(0, ebitContabil * 0.34);
  
  // Carga tributária efetiva real sobre o lucro operacional econômico
  const deprEconomicaReposicao = deprFiscal * (1 + roundData.inflationRate);
  const ebitEconomico = ebitda - deprEconomicaReposicao;
  const effectiveTaxRateReal = ebitEconomico > 0 ? (effectiveTax / ebitEconomico) : 1.0;

  const nopat = ebitContabil - effectiveTax;
  
  // Investimento de reposição (CapEx) sobe com a inflação de bens de capital!
  const capex = (previousState.capex || 18000) * (1 + roundData.inflationRate);
  const deltaNcg = (newRevenue * 0.035) * (1 + roundData.inflationRate * 0.5);

  const fcf = nopat + deprFiscal - capex - deltaNcg;
  
  // Regra de Ouro da Sobrevivência:
  // Crescimento do FCF vs Aumento do WACC
  const fcfGrowth = (fcf - previousState.fcf) / Math.abs(previousState.fcf || 1);
  const waccDelta = currentWacc - previousState.wacc;
  const survivesGoldenRule = fcfGrowth > waccDelta && fcf > 0;

  // Valor Presente de Perpetuidade Simulado a este nível de WACC
  const impliedTerminalValue = fcf > 0 && currentWacc > 0.03 ? (fcf * (1 + 0.025)) / (currentWacc - 0.025) : 0;
  const enterpriseValueEstimate = Math.round(impliedTerminalValue);

  return {
    roundNumber: roundData.round,
    roundName: roundData.name,
    inflationRate: roundData.inflationRate,
    wacc: currentWacc,
    strategyUsed: strategy.name,
    revenue: Math.round(newRevenue),
    costs: Math.round(newVariableCosts),
    fixedCosts: Math.round(newFixedCosts),
    ebitda: Math.round(ebitda),
    ebitdaMargin: Number(((ebitda / newRevenue) * 100).toFixed(1)),
    deprFiscal,
    deprEconomicaReposicao: Math.round(deprEconomicaReposicao),
    effectiveTax: Math.round(effectiveTax),
    effectiveTaxRateReal: Number((effectiveTaxRateReal * 100).toFixed(1)),
    nopat: Math.round(nopat),
    capex: Math.round(capex),
    deltaNcg: Math.round(deltaNcg),
    fcf: Math.round(fcf),
    fcfGrowth: Number((fcfGrowth * 100).toFixed(1)),
    waccDelta: Number((waccDelta * 100).toFixed(1)),
    survivesGoldenRule,
    enterpriseValueEstimate
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    INFLATION_BASE_COMPANY,
    INFLATION_ROUNDS,
    PASSTHROUGH_STRATEGIES,
    simulateInflationRound
  };
}
