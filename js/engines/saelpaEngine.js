// ValuationQuest - saelpaEngine.js
// Motor e dados reais do Caso SAELPA (Paraíba 2003-2005) - O Chefe de Fase

const SAELPA_CAPM_PARAMS = {
  krf: 0.0506,     // 5.06% USTB 10 anos (1995-2005)
  km: 0.1302,      // 13.02% S&P 500 histórico
  beta: 0.4448,    // 0.4448 Covariância estatística ROI SAELPA vs S&P 500
  countryRisk: 0.0762, // 7.62% EMBI+ Brasil (1996-2005)
  expectedKe: 0.1622   // 16.22% Calculado pela ANEEL
};

const SAELPA_HISTORICAL_DATA = {
  2003: {
    year: 2003,
    phaseTitle: 'Exercício 2003: A Linha de Base Pós-Privatização',
    nopat: 85418,
    investedCapital: 300946,
    wacc: 0.2518, // 25.18%
    roi: 0.2840,  // 28.40%
    accountingNetIncome: 35984,
    eva: 9647,
    mva: 38284,
    marketValue: 339230,
    context: 'A SAELPA opera com alta taxa de retorno (ROI 28,4%) superando o elevado WACC da época (25,18%), gerando R$ 9,6M em EVA e consolidando R$ 38,2M de riqueza acumulada aos acionistas (MVA).'
  },
  2004: {
    year: 2004,
    phaseTitle: 'Exercício 2004: O Dilema e o Mistério Educativo',
    nopat: 53153,
    investedCapital: 346233,
    wacc: 0.1840, // 18.40%
    roi: 0.1540,  // 15.40%
    accountingNetIncome: 20886,
    eva: -10543,
    mva: -59015,
    marketValue: 287218,
    context: 'Queda na margem e expansão de ativos não remunerada adequadamente. O lucro contábil parece saudável (R$ 20,8 milhões), mas o Conselho de Administração entra em pânico com a destruição de valor.'
  },
  2005: {
    year: 2005,
    phaseTitle: 'Exercício 2005: A Virada Estratégica e Recuperação',
    nopat: 112633,
    investedCapital: 538846,
    wacc: 0.1532, // 15.32%
    roi: 0.2090,  // 20.90%
    accountingNetIncome: 72058,
    eva: 30106,
    mva: 196356,
    marketValue: 735202,
    context: 'Após a virada operacional e pesados investimentos regulatórios de R$ 538M, a distribuidora alcança seu recorde histórico de criação de valor: EVA salta para R$ 30,1M e MVA atinge quase R$ 200 milhões!'
  }
};

const SAELPA_2004_QUIZ = {
  question: 'O Conselho de Administração da SAELPA enviou uma notificação alarmada: a empresa reportou R$ 20,8 milhões de lucro contábil positivo em 2004, mas os relatórios financeiros de valuation apontam destruição de R$ 10,5 milhões de riqueza dos acionistas (EVA negativo). Qual é o diagnóstico técnico correto deste fenômeno?',
  options: [
    {
      id: 'opt_spread',
      text: 'O Retorno sobre Investimento (ROI de 15,40%) foi inferior ao Custo Médio Ponderado de Capital (WACC de 18,40%), evidenciando que o lucro contábil não remunerou o custo de oportunidade de todo o capital empregado.',
      correct: true,
      feedback: 'Correto! Essa é a essência do conceito de EVA: Lucro contábil positivo não garante criação de riqueza econômica se o retorno da firma (15,4%) for inferior à taxa mínima de atratividade exigida pelos credores e acionistas (18,4%).'
    },
    {
      id: 'opt_acc_error',
      text: 'Houve um erro de conciliação contábil na apuração dos impostos retidos, que fez com que o NOPAT ficasse negativo.',
      correct: false,
      feedback: 'Incorreto. O NOPAT foi positivo em R$ 53.153 mil. A questão central foi a insuficiência de remuneração da base de capital de R$ 346,2 milhões frente ao WACC.'
    },
    {
      id: 'opt_debt',
      text: 'A empresa quitou todas as suas dívidas e operou apenas com capital próprio, o que obrigatoriamente destrói o valor da firma.',
      correct: false,
      feedback: 'Incorreto. A SAELPA manteve estrutura de capital mista. Operar sem dívida não gera necessariamente destruição de riqueza; o fator determinante foi o spread econômico negativo (ROI < WACC).'
    },
    {
      id: 'opt_depr',
      text: 'A depreciação regulatória da ANEEL foi zerada por decisão governamental, distorcendo o balanço patrimonial.',
      correct: false,
      feedback: 'Incorreto. A depreciação foi computada normalmente. O problema foi o descasamento entre taxa de retorno e taxa de desconto.'
    }
  ]
};

function calculateSaelpaKe(params = SAELPA_CAPM_PARAMS) {
  const { krf, km, beta, countryRisk } = params;
  const equityRiskPremium = km - krf;
  const ke = krf + (beta * equityRiskPremium) + countryRisk;
  return Number(ke.toFixed(4));
}

function verifySaelpaYearEva(year) {
  const data = SAELPA_HISTORICAL_DATA[year];
  if (!data) return null;
  const capitalCharge = data.wacc * data.investedCapital;
  const calculatedEva = data.nopat - capitalCharge;
  const roiCalculated = data.nopat / data.investedCapital;
  
  return {
    year,
    nopat: data.nopat,
    investedCapital: data.investedCapital,
    wacc: data.wacc,
    roi: Number(roiCalculated.toFixed(4)),
    capitalCharge: Math.round(capitalCharge),
    evaReported: data.eva,
    evaCalculated: Math.round(calculatedEva),
    mvaReported: data.mva,
    marketValueReported: data.marketValue
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SAELPA_CAPM_PARAMS,
    SAELPA_HISTORICAL_DATA,
    SAELPA_2004_QUIZ,
    calculateSaelpaKe,
    verifySaelpaYearEva
  };
}
