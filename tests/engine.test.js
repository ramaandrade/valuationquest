// ValuationQuest - tests/engine.test.js
// Suíte de testes unitários para os motores financeiros e pedagógicos

const assert = require('assert');
const { calculateKe, calculateWACC, projectCashFlows, calculateTerminalValue, runFullDCF, generateSensitivityMatrix } = require('../js/engines/dcfEngine');
const { MULTIPLES_GUIDE, BLITZ_COMPANIES, calculateRelativeValuation } = require('../js/engines/multiplesEngine');
const { INFLATION_BASE_COMPANY, INFLATION_ROUNDS, PASSTHROUGH_STRATEGIES, simulateInflationRound } = require('../js/engines/inflationEngine');
const { calculateEva, applyEvaYearPlan, EVA_INITIATIVES } = require('../js/engines/evaMvaEngine');
const { SAELPA_CAPM_PARAMS, SAELPA_HISTORICAL_DATA, calculateSaelpaKe, verifySaelpaYearEva } = require('../js/engines/saelpaEngine');
const { NEGOTIATION_PERSONAS, getInitialNegotiationState, processNegotiationChoice } = require('../js/engines/negotiationEngine');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log('  ✅ PASS: ' + desc);
    passedTests++;
  } catch (err) {
    console.error('  ❌ FAIL: ' + desc);
    console.error(err);
  }
}

console.log('================================================================');
console.log('  🧪 Executando Suíte de Testes Matemáticos do ValuationQuest');
console.log('================================================================\n');

// 1. Testes de FCD e CAPM
it('1.1 CAPM: Cálculo do Ke com premissas padrão', () => {
  const ke = calculateKe(0.05, 1.2, 0.12, 0.02);
  // Ke = 0.05 + 1.2 * (0.12 - 0.05) + 0.02 = 0.05 + 0.084 + 0.02 = 0.154 (15.4%)
  assert(Math.abs(ke - 0.154) < 0.0001, 'Ke deve ser 15.4%');
});

it('1.2 WACC: Ponderação entre capital próprio e capital de terceiros líquido de IR', () => {
  const wacc = calculateWACC(0.15, 0.10, 0.34, 0.60, 0.40);
  // Kd líquido = 0.10 * (1 - 0.34) = 0.066
  // WACC = (0.15 * 0.60) + (0.066 * 0.40) = 0.090 + 0.0264 = 0.1164 (11.64%)
  assert(Math.abs(wacc - 0.1164) < 0.0001, 'WACC deve ser 11.64%');
});

it('1.3 Valor Terminal: Fórmula de Gordon-Shapiro e validação de consistência', () => {
  const lastFcf = 20000;
  const g = 0.03;
  const wacc = 0.11;
  const vt = calculateTerminalValue(lastFcf, g, wacc);
  // FCF(n+1) = 20000 * 1.03 = 20600
  // VT = 20600 / (0.11 - 0.03) = 20600 / 0.08 = 257500
  assert.strictEqual(vt.fcfNext, 20600);
  assert.strictEqual(vt.terminalValue, 257500);

  // Deve lançar erro se WACC <= g
  assert.throws(() => calculateTerminalValue(100, 0.05, 0.04));
});

it('1.4 FCD Completo: Enterprise Value, Dívida Líquida e Shareholder Value', () => {
  const dcf = runFullDCF();
  assert(dcf.enterpriseValue > 0, 'Enterprise Value deve ser positivo');
  assert(dcf.netDebt === 30000, 'Dívida Líquida padrão deve ser 30.000 (45k dívida - 15k caixa)');
  assert.strictEqual(dcf.shareholderValue, dcf.enterpriseValue - dcf.netDebt);
  assert(dcf.sharePrice > 0, 'Preço por ação deve ser positivo');
});

it('1.5 Matriz de Sensibilidade: Geração 5x5 consistente', () => {
  const matrix = generateSensitivityMatrix({});
  assert.strictEqual(matrix.matrix.length, 5, 'Matriz deve ter 5 linhas');
  assert.strictEqual(matrix.matrix[0].cells.length, 5, 'Cada linha deve ter 5 colunas');
  assert(matrix.priceRange.minPrice < matrix.priceRange.centralPrice);
  assert(matrix.priceRange.centralPrice < matrix.priceRange.maxPrice);
});

// 2. Testes de Múltiplos Relativos
it('2.1 Múltiplos: Identificação e cálculo de EV/Receita para Startups', () => {
  const startup = BLITZ_COMPANIES.find(c => c.id === 'cloudscale');
  assert.strictEqual(startup.correctMultiple, 'EV/Receita');
  const val = calculateRelativeValuation(startup, 'EV/Receita');
  assert.strictEqual(val.isCorrect, true);
  assert.strictEqual(val.impliedEnterpriseValue, 40000000 * 8); // R$ 320M
});

it('2.2 Múltiplos: EV/EBITDA para Empresa Madura Alavancada', () => {
  const logi = BLITZ_COMPANIES.find(c => c.id === 'nordeste_log');
  assert.strictEqual(logi.correctMultiple, 'EV/EBITDA');
  const val = calculateRelativeValuation(logi, 'EV/EBITDA');
  assert.strictEqual(val.impliedEnterpriseValue, 70000000 * 6.5); // R$ 455M
});

// 3. Testes do Caso Real SAELPA
it('3.1 SAELPA: Verificação exata do Ke histórico da ANEEL (16.22%)', () => {
  const ke = calculateSaelpaKe();
  // 5.06% + 0.4448 * (13.02% - 5.06%) + 7.62% = 16.22%
  assert.strictEqual(ke, 0.1622, 'Ke histórico SAELPA deve ser exatamente 16.22%');
});

it('3.2 SAELPA 2003: Validação do EVA positivo de linha de base', () => {
  const r2003 = verifySaelpaYearEva(2003);
  // 85418 - (0.2518 * 300946) = 85418 - 75778 = 9640
  assert(Math.abs(r2003.evaCalculated - 9640) < 50);
  assert(r2003.roi > r2003.wacc, 'ROI (28.4%) deve ser maior que WACC (25.18%)');
});

it('3.3 SAELPA 2004: Confirmação matemática da destruição de valor no Dilema', () => {
  const r2004 = verifySaelpaYearEva(2004);
  // NOPAT = 53153, Custo = 18.4% * 346233 = 63707 -> EVA = -10554
  assert(r2004.evaCalculated < 0, 'EVA de 2004 DEVE ser negativo');
  assert(r2004.roi < r2004.wacc, 'ROI (15.4%) deve ser menor que WACC (18.4%)!');
});

it('3.4 SAELPA 2005: Confirmação do salto do EVA na virada de recuperação', () => {
  const r2005 = verifySaelpaYearEva(2005);
  // NOPAT = 112633, Custo = 15.32% * 538846 = 82551 -> EVA = +30082
  assert(r2005.evaCalculated > 29000, 'EVA de 2005 deve ser positivo e superior a R$ 29M');
  assert(r2005.roi > r2005.wacc);
});

// 4. Testes de EVA e MVA
it('4.1 EVA: Cálculo e Spread Econômico', () => {
  const res = calculateEva(60000, 0.12, 400000);
  // Capital charge = 400000 * 0.12 = 48000
  // EVA = 60000 - 48000 = 12000
  // ROI = 60000 / 400000 = 15%
  // Spread = 15% - 12% = +3%
  assert.strictEqual(res.capitalCharge, 48000);
  assert.strictEqual(res.eva, 12000);
  assert.strictEqual(res.roi, 15.0);
  assert.strictEqual(res.economicSpread, 3.0);
  assert.strictEqual(res.createsValue, true);
});

it('4.2 EVA: Simulação de alocação de orçamento e atualização de MVA', () => {
  const base = {
    investedCapital: 400000,
    nopat: 64000,
    wacc: 0.14,
    cumulativeMva: 50000
  };
  const year1 = applyEvaYearPlan(base, ['c1_lean', 'c2_inventory'], 50000);
  assert(year1.budgetUsed <= 50000);
  assert(year1.investedCapital < base.investedCapital, 'Capital de giro liberado deve reduzir base de capital');
  assert(year1.nopat > base.nopat, 'Lean deve aumentar o NOPAT');
  assert(year1.eva > 0, 'EVA resultante deve ser fortemente positivo');
});

// 5. Testes da Simulação de Inflação
it('5.1 Inflação: Simulação de rodada com repasse estratégico', () => {
  const prev = {
    revenue: 200000,
    costs: 130000,
    fixedCosts: 30000,
    historicalDepr: 15000,
    wacc: 0.12,
    fcf: 22000,
    capex: 18000
  };
  const round1 = INFLATION_ROUNDS[0];
  const strat = PASSTHROUGH_STRATEGIES.find(s => s.id === 'strategic');
  const sim = simulateInflationRound(prev, round1, strat);
  assert(sim.wacc > prev.wacc, 'WACC deve aumentar');
  assert(sim.revenue > 0);
  assert(sim.fcf !== undefined);
});

// 6. Testes da Arena de Negociação
it('6.1 Negociação: Fluxo de diálogo e evolução do poder de negociação', () => {
  let state = getInitialNegotiationState('albrecht');
  assert.strictEqual(state.negotiationPower, 50);
  assert.strictEqual(state.currentRoundIndex, 0);

  // Resposta técnica de excelência (opção 0)
  state = processNegotiationChoice(state, 0);
  assert(state.negotiationPower > 50, 'Poder de negociação deve aumentar com bom argumento');
  assert.strictEqual(state.currentRoundIndex, 1);
});

console.log('\n----------------------------------------------------------------');
console.log('  Resultado dos Testes: ' + passedTests + ' / ' + totalTests + ' testes passaram com sucesso!');
console.log('----------------------------------------------------------------');

if (passedTests === totalTests) {
  console.log('🎉 TODAS AS VALIDAÇÕES MATEMÁTICAS E PEDAGÓGICAS PASSARAM!\n');
  process.exit(0);
} else {
  console.error('⚠️ ALGUNS TESTES FALHARAM!\n');
  process.exit(1);
}
