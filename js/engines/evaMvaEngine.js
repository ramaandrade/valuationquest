// ValuationQuest - evaMvaEngine.js
// Motor do Módulo IV: A Gestão de Valor Baseada em EVA e MVA

const EVA_BASE_STATE = {
  companyName: 'InovaTech Manufatura S.A.',
  investedCapital: 400000, // R$ 400M de Capital Investido
  nopat: 64000,            // R$ 64M de NOPAT
  wacc: 0.14,              // 14% a.a. WACC
  accountingProfit: 42000, // Lucro Líquido Contábil R$ 42M
  cumulativeMva: 57143     // MVA inicial = EVA / WACC
};

/**
 * Calcula o EVA
 * EVA = NOPAT - (WACC * Investimento)
 */
function calculateEva(nopat, wacc, investedCapital) {
  const capitalCharge = wacc * investedCapital;
  const eva = nopat - capitalCharge;
  const roi = investedCapital > 0 ? (nopat / investedCapital) : 0;
  const economicSpread = roi - wacc;

  return {
    nopat: Math.round(nopat),
    wacc,
    investedCapital: Math.round(investedCapital),
    capitalCharge: Math.round(capitalCharge),
    eva: Math.round(eva),
    roi: Number((roi * 100).toFixed(2)),
    economicSpread: Number((economicSpread * 100).toFixed(2)),
    createsValue: eva > 0
  };
}

/**
 * As Três Estratégias Fundamentais de Agregação de Valor do PRD
 */
const EVA_INITIATIVES = [
  // Caminho 1: Aumentar os Lucros Operacionais sem novos aportes
  {
    id: 'c1_lean',
    pillar: 1,
    category: '1. Aumentar Lucros Operacionais',
    title: 'Automação Lean & Excelência Operacional',
    costBudget: 10000, // Custo de implantação operacional
    deltaCapital: 0,   // Zero novos aportes de capital fixo
    deltaNopat: 9500,  // Aumento direto de NOPAT
    description: 'Eliminação de gargalos fabris, automação de processos e renegociação estratégica de contratos de suprimentos. Eleva o NOPAT sem aumentar a base de capital investido.'
  },
  {
    id: 'c1_pricing',
    pillar: 1,
    category: '1. Aumentar Lucros Operacionais',
    title: 'Reprecificação Inteligente e Mix de Alto Valor',
    costBudget: 5000,
    deltaCapital: 0,
    deltaNopat: 6800,
    description: 'Foco nos produtos de maior margem de contribuição e descontinuação de linhas deficitárias.'
  },

  // Caminho 2: Otimizar o Uso do Capital (Desinvestimento e Giro)
  {
    id: 'c2_inventory',
    pillar: 2,
    category: '2. Otimizar o Uso do Capital',
    title: 'Gestão Just-in-Time e Liquidação de Estoque Parado',
    costBudget: 4000,
    deltaCapital: -45000, // Reduz R$ 45M da base de capital investido!
    deltaNopat: -1200,    // Leve desconto para desovar estoque
    description: 'Revisão da cadeia logística e liberação expressiva de capital de giro preso em almoxarifados.'
  },
  {
    id: 'c2_sale_leaseback',
    pillar: 2,
    category: '2. Otimizar o Uso do Capital',
    title: 'Desinvestimento de Imóveis Ociosos (Sale & Leaseback)',
    costBudget: 3000,
    deltaCapital: -60000, // Reduz R$ 60M em ativos imobilizados
    deltaNopat: -4500,    // Despesa de aluguel reduz NOPAT levemente
    description: 'Venda de prédios administrativos e centros de distribuição ociosos, focando o capital exclusivamente no core business.'
  },

  // Caminho 3: Projetos de Expansão de Alto Retorno (ROI > WACC)
  {
    id: 'c3_greenfield_high_roi',
    pillar: 3,
    category: '3. Projetos de Alto Retorno',
    title: 'Nova Linha de Produtos Premium Automatizada',
    costBudget: 35000,
    deltaCapital: 70000,  // Aporte de R$ 70M
    deltaNopat: 15400,    // ROI marginal = 15.400 / 70.000 = 22.0% (bem acima do WACC de 14%)
    description: 'Expansão em nicho de altíssima rentabilidade. Como o ROI marginal (22%) supera com folga o WACC (14%), cria forte EVA marginal positivo.'
  },
  {
    id: 'c3_vanity_low_roi',
    pillar: 3,
    category: '3. Projetos de Alto Retorno (Armadilha do Lucro Contábil)',
    title: 'Mega-Complexo de Prestígio (Projeto Faraônico)',
    costBudget: 40000,
    deltaCapital: 90000,  // Aporte de R$ 90M
    deltaNopat: 8100,     // ROI marginal = 8.100 / 90.000 = 9.0% (abaixo do WACC de 14%!)
    accountingNetIncomeBonus: 6000, // Gera lucro contábil positivo, mas destrói riqueza!
    description: 'PROJETO ARMADILHA: Gera lucro contábil positivo de R$ 6M, mas seu retorno (9%) não cobre o custo de oportunidade do capital (14%), destruindo EVA e valor aos acionistas!'
  }
];

/**
 * Simula um ano de gestão baseada em EVA/MVA com as iniciativas selecionadas
 */
function applyEvaYearPlan(currentState, selectedInitiativesIds, annualBudget = 50000) {
  let totalCost = 0;
  let capitalDeltaTotal = 0;
  let nopatDeltaTotal = 0;
  const appliedInitiatives = [];

  for (const id of selectedInitiativesIds) {
    const init = EVA_INITIATIVES.find(i => i.id === id);
    if (!init) continue;
    totalCost += init.costBudget;
    capitalDeltaTotal += init.deltaCapital;
    nopatDeltaTotal += init.deltaNopat;
    appliedInitiatives.push(init);
  }

  if (totalCost > annualBudget) {
    throw new Error('Orçamento excedido! Limite disponível: R$ ' + annualBudget + ' mil.');
  }

  const newInvestedCapital = Math.max(50000, currentState.investedCapital + capitalDeltaTotal);
  const newNopat = Math.max(5000, currentState.nopat + nopatDeltaTotal);
  const wacc = currentState.wacc;

  const evaResult = calculateEva(newNopat, wacc, newInvestedCapital);
  
  // Atualização do MVA consolidado
  // O MVA novo soma o valor presente do EVA anual gerado
  const discountFactor = 1 / (1 + wacc);
  const evaDiscounted = Math.round(evaResult.eva * discountFactor);
  const newCumulativeMva = currentState.cumulativeMva + evaDiscounted;

  return {
    yearNumber: (currentState.yearNumber || 0) + 1,
    budgetUsed: totalCost,
    budgetRemaining: annualBudget - totalCost,
    appliedInitiatives,
    investedCapital: newInvestedCapital,
    nopat: newNopat,
    wacc,
    capitalCharge: evaResult.capitalCharge,
    eva: evaResult.eva,
    roi: evaResult.roi,
    economicSpread: evaResult.economicSpread,
    createsValue: evaResult.createsValue,
    evaDiscounted,
    cumulativeMva: newCumulativeMva,
    marketValueEstimate: newInvestedCapital + newCumulativeMva
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EVA_BASE_STATE,
    calculateEva,
    EVA_INITIATIVES,
    applyEvaYearPlan
  };
}
