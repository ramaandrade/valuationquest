// ValuationQuest - multiplesEngine.js
// Motor e desafios do Módulo II: O Jogo dos Múltiplos (Avaliação Relativa / M&A Blitz)

const MULTIPLES_GUIDE = {
  'EV/EBITDA': {
    name: 'Enterprise Value / EBITDA',
    formula: 'EV / EBITDA',
    targetProfile: 'Empresas maduras, industriais, concessões e consolidadas.',
    theoreticalJustification: 'É neutro em relação à estrutura de capital (dívida vs. equity) e amortizações/depreciações fiscais, viabilizando comparações justas entre concorrentes com diferentes políticas de endividamento.',
    bestFor: ['Infraestrutura', 'Indústria de Base', 'Telecom', 'Saneamento e Energia', 'Logística']
  },
  'P/L': {
    name: 'Preço sobre Lucro (P/L ou P/E)',
    formula: 'Preço da Ação / Lucro por Ação (ou Valor de Mercado / Lucro Líquido)',
    targetProfile: 'Empresas maduras com lucros líquidos positivos e estáveis.',
    theoreticalJustification: 'Mede quantos anos de lucros atuais o mercado está disposto a pagar pela empresa, refletindo a expectativa de crescimento futuro e a rentabilidade líquida do acionista.',
    bestFor: ['Bancos e Instituições Financeiras', 'Varejo Consolidado', 'Bens de Consumo', 'Farmacêuticas Estabelecidas']
  },
  'EV/Receita': {
    name: 'Enterprise Value / Receita Líquida (EV/Sales)',
    formula: 'Enterprise Value / Receita Líquida',
    targetProfile: 'Startups inovadoras, empresas em hipercrescimento e estágio inicial.',
    theoreticalJustification: 'Indispensável quando a empresa ainda opera com EBITDA ou Lucro Líquido negativos devido a investimentos agressivos em escala e aquisição de clientes (CAC).',
    bestFor: ['Startups SaaS', 'Marketplaces em Expansão', 'Biotechs em Pesquisa', 'DeepTechs e IA']
  }
};

const BLITZ_COMPANIES = [
  {
    id: 'cloudscale',
    name: 'CloudScale AI & Data Tech',
    sector: 'Software SaaS / Inteligência Artificial',
    stage: 'Startup em Hipercrescimento (Série B)',
    description: 'Plataforma de inteligência preditiva B2B com expansão de 85% ao ano. Seus custos de aquisição de clientes e P&D deixam o EBITDA e o Lucro temporariamente no vermelho.',
    financials: {
      revenue: 40000000,    // R$ 40M
      ebitda: -5000000,     // -R$ 5M
      netIncome: -7500000,  // -R$ 7.5M
      netDebt: -12000000    // Caixa líquido de R$ 12M
    },
    correctMultiple: 'EV/Receita',
    benchmarkMultipleValue: 8.0,
    distractors: [
      { multiple: 'P/L', whyWrong: 'Inviável: a empresa reporta lucro líquido negativo (-R$ 7,5M), gerando um P/L negativo sem significado econômico.' },
      { multiple: 'EV/EBITDA', whyWrong: 'Inadequado: o EBITDA é negativo (-R$ 5M), distorcendo a avaliação de negócios em fase agressiva de investimento.' }
    ],
    explanation: 'Startups em rápida expansão reinvestem todo o caixa em escala. O EV/Receita é a métrica padrão aceita por investidores institucionais de M&A.'
  },
  {
    id: 'nordeste_log',
    name: 'Nordeste Logística & Concessões',
    sector: 'Infraestrutura e Transportes',
    stage: 'Empresa Madura e Altamente Alavancada',
    description: 'Opera terminais portuários e malhas rodoviárias com contratos de concessão de 25 anos. Possui elevada dívida de financiamento de longo prazo e alta depreciação de ativos.',
    financials: {
      revenue: 280000000,  // R$ 280M
      ebitda: 70000000,    // R$ 70M (Margem 25%)
      netIncome: 15000000, // R$ 15M (comprimido por juros altos)
      netDebt: 140000000   // R$ 140M de dívida líquida
    },
    correctMultiple: 'EV/EBITDA',
    benchmarkMultipleValue: 6.5,
    distractors: [
      { multiple: 'P/L', whyWrong: 'O lucro líquido sofre forte distorção pela despesa financeira da pesada dívida, ocultando a alta geração de caixa operacional da infraestrutura.' },
      { multiple: 'EV/Receita', whyWrong: 'Desconsidera completamente as margens operacionais e o custo de manutenção da frota e da concessão.' }
    ],
    explanation: 'O EV/EBITDA neutraliza o impacto da dívida e dos impostos, permitindo comparar a operadora com pares internacionais de infraestrutura.'
  },
  {
    id: 'farma_vida',
    name: 'Rede Drogarias Vida Boa S.A.',
    sector: 'Varejo Farmacêutico Consolidado',
    stage: 'Companhia Aberta Tradicional',
    description: 'Rede com mais de 350 lojas, margens previsíveis, fluxo de caixa constante, dívida controlada e histórico de 15 anos consecutivos de pagamento de dividendos.',
    financials: {
      revenue: 500000000,  // R$ 500M
      ebitda: 55000000,    // R$ 55M
      netIncome: 32000000, // R$ 32M
      netDebt: 20000000    // R$ 20M
    },
    correctMultiple: 'P/L',
    benchmarkMultipleValue: 12.0,
    distractors: [
      { multiple: 'EV/Receita', whyWrong: 'Não reflete a rentabilidade real nem a eficiência na conversão de vendas em lucro líquido distribuível.' },
      { multiple: 'EV/EBITDA', whyWrong: 'Embora aplicável, para o investidor de varejo focado em dividendos e estabilidade, o P/L é a bússola primordial de precificação acionária.' }
    ],
    explanation: 'Para companhias maduras e com lucros estáveis, o P/L indica de forma direta quantos anos de lucro o mercado paga pelo patrimônio líquido dos acionistas.'
  },
  {
    id: 'biotech_sol',
    name: 'Genoma Tropical Biotecnologia',
    sector: 'Saúde e Biofarmacêutica',
    stage: 'Early Stage / P&D Intensivo',
    description: 'Pioneira em terapias gênicas com patentes registradas na Anvisa. Sem faturamento comercial contínuo, vivendo de subsídios de inovação e rodadas de venture capital.',
    financials: {
      revenue: 6000000,    // R$ 6M (licenciamentos pontuais)
      ebitda: -4000000,    // -R$ 4M
      netIncome: -4200000, // -R$ 4.2M
      netDebt: -18000000   // R$ 18M em caixa de captação
    },
    correctMultiple: 'EV/Receita',
    benchmarkMultipleValue: 15.0,
    distractors: [
      { multiple: 'P/L', whyWrong: 'Empresa com prejuízo contínuo decorrente do ciclo longo de ensaios laboratoriais.' },
      { multiple: 'EV/EBITDA', whyWrong: 'O EBITDA é amplamente negativo, inviabilizando qualquer multiplicador sobre o resultado operacional.' }
    ],
    explanation: 'Empresas de P&D biotecnológico são precificadas por múltiplos de receita de contratos de pesquisa ou valor presente das patentes.'
  },
  {
    id: 'energia_verde',
    name: 'Parques Eólicos Ventos do Ceará S.A.',
    sector: 'Geração de Energia Renovável',
    stage: 'Ativo Operacional Madura',
    description: 'Usinas eólicas com contratos de longo prazo (PPA) indexados ao IPCA por 20 anos. Forte investimento inicial (CapEx) já amortizado na fase de implantação.',
    financials: {
      revenue: 120000000,  // R$ 120M
      ebitda: 84000000,    // R$ 84M (Margem EBITDA de 70%)
      netIncome: 28000000, // R$ 28M
      netDebt: 150000000   // R$ 150M de dívida de debêntures de infraestrutura
    },
    correctMultiple: 'EV/EBITDA',
    benchmarkMultipleValue: 8.5,
    distractors: [
      { multiple: 'P/L', whyWrong: 'A estrutura de financiamento via debêntures reduz o lucro contábil, mas a geração de caixa operacional antes dos juros é espetacular.' },
      { multiple: 'EV/Receita', whyWrong: 'Ignora a extraordinária margem operacional de 70% típica da geração de energia renovável.' }
    ],
    explanation: 'Em concessionárias e geradoras de energia, o EV/EBITDA é a métrica rainha das mesas de M&A mundiais.'
  }
];

/**
 * Calcula o Valuation Relativo
 */
function calculateRelativeValuation(company, selectedMultiple, customMultipleValue = null) {
  const multipleVal = customMultipleValue || company.benchmarkMultipleValue;
  let impliedEnterpriseValue = 0;
  let impliedEquityValue = 0;

  if (selectedMultiple === 'EV/Receita') {
    impliedEnterpriseValue = company.financials.revenue * multipleVal;
    impliedEquityValue = impliedEnterpriseValue - company.financials.netDebt;
  } else if (selectedMultiple === 'EV/EBITDA') {
    impliedEnterpriseValue = company.financials.ebitda * multipleVal;
    impliedEquityValue = impliedEnterpriseValue - company.financials.netDebt;
  } else if (selectedMultiple === 'P/L') {
    impliedEquityValue = company.financials.netIncome * multipleVal;
    impliedEnterpriseValue = impliedEquityValue + company.financials.netDebt;
  }

  return {
    multiple: selectedMultiple,
    multipleValue: multipleVal,
    impliedEnterpriseValue: Math.round(impliedEnterpriseValue),
    impliedEquityValue: Math.round(impliedEquityValue),
    isCorrect: selectedMultiple === company.correctMultiple
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MULTIPLES_GUIDE,
    BLITZ_COMPANIES,
    calculateRelativeValuation
  };
}
