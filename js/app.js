// ValuationQuest - app.js
// Orquestrador Central da Interface, Estados, Eventos e Gráficos

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initHud();
  initDcfModule();
  initMultiplesModule();
  initInflationModule();
  initEvaModule();
  initSaelpaModule();
  initNegotiationModule();
  initBadgesModal();
  updateDcfCalculations();
});

/* ==================== 1. SISTEMA DE NAVEGAÇÃO ==================== */
function switchTab(tabId) {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(btn => {
    if (btn.dataset.tab === tabId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  panes.forEach(pane => {
    if (pane.id === 'pane-' + tabId) pane.classList.add('active');
    else pane.classList.remove('active');
  });

  gameState.state.activeTab = tabId;
  gameState.saveState();
  sounds.click();

  if (tabId === 'modulo1') {
    setTimeout(renderDcfStepCharts, 100);
  } else if (tabId === 'saelpa') {
    setTimeout(() => {
      FinanceCharts.renderSaelpaComparison('saelpaChartCanvas', SAELPA_HISTORICAL_DATA);
    }, 100);
  } else if (tabId === 'laudo') {
    renderLaudo();
  }
}

function initTabs() {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function initHud() {
  gameState.subscribe(state => {
    const careerIcon = document.getElementById('hudCareerIcon');
    const careerTitle = document.getElementById('hudCareerTitle');
    const xpFill = document.getElementById('hudXpFill');
    const xpLabel = document.getElementById('hudXpLabel');

    if (careerIcon) careerIcon.textContent = state.careerIcon;
    if (careerTitle) careerTitle.textContent = state.careerTitle;

    const currentLvl = CAREER_LEVELS.find(l => l.level === state.level) || CAREER_LEVELS[0];
    const nextLvl = CAREER_LEVELS.find(l => l.level === state.level + 1);
    const minXp = currentLvl.minXp;
    const maxXp = nextLvl ? nextLvl.minXp : (minXp + 1000);
    const progress = Math.min(100, Math.max(0, ((state.xp - minXp) / (maxXp - minXp)) * 100));

    if (xpFill) xpFill.style.width = progress + '%';
    if (xpLabel) xpLabel.textContent = `${state.xp} / ${maxXp} XP (Nível ${state.level})`;

    const mvaEl = document.getElementById('hudMvaVal');
    const evaEl = document.getElementById('hudEvaVal');
    const spreadEl = document.getElementById('hudSpreadVal');

    if (mvaEl) {
      mvaEl.textContent = 'R$ ' + state.cumulativeMva.toLocaleString('pt-BR');
      mvaEl.className = 'val ' + (state.cumulativeMva >= 0 ? 'positive' : 'negative');
    }
    if (evaEl) {
      evaEl.textContent = 'R$ ' + state.currentEva.toLocaleString('pt-BR');
      evaEl.className = 'val ' + (state.currentEva >= 0 ? 'positive' : 'negative');
    }
    if (spreadEl) {
      const spread = state.currentRoi - state.currentWacc;
      spreadEl.textContent = (spread >= 0 ? '+' : '') + spread.toFixed(1) + '%';
      spreadEl.className = 'val ' + (spread >= 0 ? 'positive' : 'negative');
    }

    renderDashboardBadges(state.badges);
  });

  const btnSound = document.getElementById('btnToggleSound');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const enabled = gameState.toggleSound();
      sounds.muted = !enabled;
      btnSound.textContent = enabled ? '🔊' : '🔇';
      btnSound.title = enabled ? 'Som Ativado' : 'Som Mudo';
    });
  }
}

function showToast(title, msg, icon = '✨') {
  const toast = document.getElementById('gameToast');
  const tIcon = document.getElementById('toastIcon');
  const tTitle = document.getElementById('toastTitle');
  const tMsg = document.getElementById('toastMessage');

  if (toast && tTitle && tMsg) {
    tIcon.textContent = icon;
    tTitle.textContent = title;
    tMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }
}

/* ==================== 2. MÓDULO I: DETETIVE DO FCD ==================== */
let currentDcfStep = 1;
let dcfParams = {
  growthRate: 0.07,
  ebitdaMargin: 0.45,
  terminalGrowth: 0.035,
  krf: 0.0506,
  km: 0.1302,
  beta: 0.75,
  countryRisk: 0.035,
  costOfDebt: 0.095,
  taxRate: 0.34,
  equityWeight: 0.65,
  debtWeight: 0.35,
  totalDebt: 45000,
  cash: 15000
};
let latestDcfResult = null;
let latestSensitivity = null;

const DCF_STEP_NAMES = [
  '1. Diagnóstico Inicial',
  '2. Premissas & Cenários',
  '3. Projeções FCFF',
  '4. Valor Terminal (VT)',
  '5. WACC & CAPM',
  '6. Enterprise Value',
  '7. Dívida Líquida',
  '8. Shareholder Value',
  '9. Sensibilidade & Preço',
  '10. Apresentação & Laudo'
];

function initDcfModule() {
  const wizardBar = document.getElementById('dcfStepsWizard');
  if (wizardBar) {
    wizardBar.innerHTML = DCF_STEP_NAMES.map((name, idx) => `
      <div class="step-node ${idx + 1 === currentDcfStep ? 'active' : ''}" onclick="goToDcfStep(${idx + 1})">
        <span class="step-number">${idx + 1}</span>
        <span>${name.split('. ')[1]}</span>
      </div>
    `).join('');
  }

  const btnRecalc = document.getElementById('btnDcfRecalc');
  if (btnRecalc) {
    btnRecalc.addEventListener('click', () => {
      updateDcfCalculations();
      sounds.success();
      showToast('Modelo FCD Atualizado', 'Todas as projeções e região de preço recalculadas.', '🔄');
    });
  }

  renderDcfCurrentStep();
}

function goToDcfStep(stepNum) {
  currentDcfStep = stepNum;
  sounds.click();
  const nodes = document.querySelectorAll('.step-node');
  nodes.forEach((n, i) => {
    if (i + 1 === stepNum) n.classList.add('active');
    else n.classList.remove('active');
  });
  renderDcfCurrentStep();
}

function updateDcfCalculations() {
  latestDcfResult = runFullDCF(dcfParams);
  latestSensitivity = generateSensitivityMatrix(dcfParams);
  gameState.setEvaluation(latestDcfResult);

  const firstYearNopat = latestDcfResult.projections[0].nopat;
  const investedCapital = DCF_DEFAULTS.balanceSheet.totalAssets - DCF_DEFAULTS.balanceSheet.cash;
  const eva = calculateEva(firstYearNopat, latestDcfResult.wacc, investedCapital);
  gameState.updateHudMetrics(eva.eva, Math.round(latestDcfResult.shareholderValue), eva.roi / 100, latestDcfResult.wacc);

  renderDcfCurrentStep();
}

function setDcfScenario(scenarioKey) {
  const sc = DCF_DEFAULTS.scenarios[scenarioKey];
  if (!sc) return;
  dcfParams.growthRate = sc.growthRate;
  dcfParams.ebitdaMargin = sc.ebitdaMargin;
  dcfParams.terminalGrowth = sc.terminalGrowth;
  updateDcfCalculations();
  sounds.click();
  showToast(`Cenário ${sc.name} Aplicado`, sc.description, '⚙️');
}

function renderDcfCurrentStep() {
  const container = document.getElementById('dcfStepContainer');
  if (!container || !latestDcfResult) return;

  const d = latestDcfResult;
  let html = '';

  if (currentDcfStep === 1) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 1: Diagnóstico do Histórico Financeiro</h3>
          <p class="card-subtitle">Examine os demonstrativos históricos (3 últimos exercícios) para calibrar suas expectativas.</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(2)">Avançar: Premissas ➔</button>
      </div>
      <table class="financial-table">
        <thead>
          <tr>
            <th>Demonstração do Resultado (em R$ mil)</th>
            <th>Ano t-2</th><th>Ano t-1</th><th>Ano t0 (Base)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Receita Operacional Líquida</td><td>R$ 100.000</td><td>R$ 108.000</td><td><strong>R$ 116.640</strong></td></tr>
          <tr><td>Custos e Despesas Operacionais</td><td>R$ 55.000</td><td>R$ 59.400</td><td>R$ 64.152</td></tr>
          <tr style="background: rgba(56, 189, 248, 0.08);"><td><strong>EBITDA</strong></td><td>R$ 45.000 (45%)</td><td>R$ 48.600 (45%)</td><td><strong>R$ 52.488 (45%)</strong></td></tr>
          <tr><td>Depreciação e Amortização</td><td>R$ 10.000</td><td>R$ 10.500</td><td>R$ 11.000</td></tr>
          <tr><td>EBIT (Lucro Operacional)</td><td>R$ 35.000</td><td>R$ 38.100</td><td>R$ 41.488</td></tr>
          <tr><td>Imposto de Renda & CSLL (34%)</td><td>R$ 11.900</td><td>R$ 12.954</td><td>R$ 14.106</td></tr>
          <tr style="background: rgba(16, 185, 129, 0.08);"><td><strong>NOPAT</strong></td><td>R$ 23.100</td><td>R$ 25.146</td><td><strong>R$ 27.382</strong></td></tr>
          <tr><td>Investimentos em Ativo Fixo (CapEx)</td><td>R$ 12.000</td><td>R$ 12.500</td><td>R$ 13.000</td></tr>
          <tr><td>Variação do Capital de Giro (Δ NCG)</td><td>R$ 3.000</td><td>R$ 3.200</td><td>R$ 3.500</td></tr>
          <tr style="background: rgba(168, 85, 247, 0.12); font-weight: bold;">
            <td>FLUXO DE CAIXA LIVRE DA FIRMA (FCFF)</td>
            <td>R$ 18.100</td><td>R$ 19.946</td><td style="color: var(--color-primary);">R$ 21.882</td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (currentDcfStep === 2) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 2: Determinação de Premissas Operacionais</h3>
          <p class="card-subtitle">Ajuste as taxas de crescimento e margens ou selecione um cenário macroeconômico.</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(3)">Avançar: Projeções ➔</button>
      </div>

      <div class="scenario-buttons">
        <button class="btn-scenario" onclick="setDcfScenario('pessimistic')">
          <div style="color: #f87171; font-weight: 700;">🔻 Cenário Pessimista</div>
          <small style="color: var(--text-muted);">Cresc. 3.5% | Margem 38% | WACC +1.5%</small>
        </button>
        <button class="btn-scenario active" onclick="setDcfScenario('base')">
          <div style="color: #38bdf8; font-weight: 700;">⚖️ Cenário Base (Esperado)</div>
          <small style="color: var(--text-muted);">Cresc. 7.0% | Margem 45% | WACC Neutro</small>
        </button>
        <button class="btn-scenario" onclick="setDcfScenario('optimistic')">
          <div style="color: #4ade80; font-weight: 700;">🔺 Cenário Otimista</div>
          <small style="color: var(--text-muted);">Cresc. 11.0% | Margem 50% | WACC -1.5%</small>
        </button>
      </div>

      <div class="grid-2">
        <div class="slider-group">
          <div class="slider-header">
            <span>Crescimento da Receita (g):</span>
            <strong id="dispGrowth">${(dcfParams.growthRate * 100).toFixed(1)}%</strong>
          </div>
          <input type="range" class="slider-input" min="0.02" max="0.16" step="0.005" value="${dcfParams.growthRate}"
            oninput="dcfParams.growthRate = parseFloat(this.value); document.getElementById('dispGrowth').textContent = (this.value*100).toFixed(1) + '%'; updateDcfCalculations();">
        </div>

        <div class="slider-group">
          <div class="slider-header">
            <span>Margem EBITDA:</span>
            <strong id="dispMargin">${(dcfParams.ebitdaMargin * 100).toFixed(1)}%</strong>
          </div>
          <input type="range" class="slider-input" min="0.25" max="0.55" step="0.01" value="${dcfParams.ebitdaMargin}"
            oninput="dcfParams.ebitdaMargin = parseFloat(this.value); document.getElementById('dispMargin').textContent = (this.value*100).toFixed(1) + '%'; updateDcfCalculations();">
        </div>

        <div class="slider-group">
          <div class="slider-header">
            <span>Crescimento na Perpetuidade (g perpétuo):</span>
            <strong id="dispTerminalG">${(dcfParams.terminalGrowth * 100).toFixed(1)}%</strong>
          </div>
          <input type="range" class="slider-input" min="0.01" max="0.05" step="0.005" value="${dcfParams.terminalGrowth}"
            oninput="dcfParams.terminalGrowth = parseFloat(this.value); document.getElementById('dispTerminalG').textContent = (this.value*100).toFixed(1) + '%'; updateDcfCalculations();">
        </div>

        <div class="slider-group">
          <div class="slider-header">
            <span>Beta da Concessionária (β):</span>
            <strong id="dispBeta">${dcfParams.beta.toFixed(2)}</strong>
          </div>
          <input type="range" class="slider-input" min="0.3" max="1.5" step="0.05" value="${dcfParams.beta}"
            oninput="dcfParams.beta = parseFloat(this.value); document.getElementById('dispBeta').textContent = parseFloat(this.value).toFixed(2); updateDcfCalculations();">
        </div>
      </div>
    `;
  } else if (currentDcfStep === 3) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 3: Projeção dos Fluxos de Caixa Livres (5 Anos)</h3>
          <p class="card-subtitle">Fluxo operacional descontado à taxa de custo de capital (WACC: ${(d.wacc * 100).toFixed(2)}%).</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(4)">Avançar: Valor Terminal ➔</button>
      </div>
      <div style="margin-bottom: 16px;">
        <canvas id="dcfProjCanvas" style="width: 100%; height: 240px;"></canvas>
      </div>
      <table class="financial-table">
        <thead>
          <tr>
            <th>Ano</th><th>Receita</th><th>EBITDA</th><th>NOPAT</th><th>CapEx</th><th>Δ NCG</th><th>FCFF (Livre)</th><th>Fator DF</th><th>Valor Presente</th>
          </tr>
        </thead>
        <tbody>
          ${d.projections.map(p => `
            <tr>
              <td>Ano ${p.year}</td>
              <td>R$ ${p.revenue.toLocaleString('pt-BR')}</td>
              <td>R$ ${p.ebitda.toLocaleString('pt-BR')}</td>
              <td>R$ ${p.nopat.toLocaleString('pt-BR')}</td>
              <td>R$ ${p.capex.toLocaleString('pt-BR')}</td>
              <td>R$ ${p.deltaNcg.toLocaleString('pt-BR')}</td>
              <td style="color: var(--color-primary); font-weight: 700;">R$ ${p.fcf.toLocaleString('pt-BR')}</td>
              <td>${p.discountFactor.toFixed(4)}</td>
              <td style="color: var(--color-success); font-weight: 700;">R$ ${p.presentValue.toLocaleString('pt-BR')}</td>
            </tr>
          `).join('')}
          <tr style="background: rgba(255, 255, 255, 0.05); font-weight: bold;">
            <td colspan="8">Soma dos Valores Presentes dos Fluxos Explícitos:</td>
            <td style="color: var(--color-success); font-size: 1.05rem;">R$ ${d.sumPvExplicit.toLocaleString('pt-BR')}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else if (currentDcfStep === 4) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 4: Cálculo do Valor Terminal (Perpetuidade)</h3>
          <p class="card-subtitle">Estimando o valor contínuo da firma além do horizonte explícito de 5 anos.</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(5)">Avançar: WACC & CAPM ➔</button>
      </div>
      <div class="card" style="background: rgba(0,0,0,0.3); border-color: var(--color-primary);">
        <h4 style="color: var(--color-primary); margin-bottom: 10px;">Fórmula de Gordon-Shapiro:</h4>
        <p style="font-family: monospace; font-size: 1.1rem; margin-bottom: 12px;">VT = FCFF(n+1) / (WACC - g)</p>
        <div style="font-size: 0.95rem; line-height: 1.8;">
          <div>• FCFF Ano 5: <strong>R$ ${d.projections[4].fcf.toLocaleString('pt-BR')}</strong></div>
          <div>• FCFF Ano 6 projetado [FCF × (1 + ${(d.terminalGrowth*100).toFixed(1)}%)]: <strong>R$ ${d.fcfNext.toLocaleString('pt-BR')}</strong></div>
          <div>• Denominador [${(d.wacc*100).toFixed(2)}% - ${(d.terminalGrowth*100).toFixed(1)}%]: <strong>${((d.wacc - d.terminalGrowth)*100).toFixed(2)}%</strong></div>
          <div style="margin-top: 10px; font-size: 1.15rem; color: #38bdf8;">
            ➔ Valor Terminal Perpétuo (VT): <strong>R$ ${d.terminalValue.toLocaleString('pt-BR')}</strong>
          </div>
          <div style="font-size: 1.15rem; color: #10b981; margin-top: 6px;">
            ➔ Valor Presente do VT (t=0): <strong>R$ ${d.pvTerminalValue.toLocaleString('pt-BR')}</strong>
            <small style="color: var(--text-secondary);">(Representa ${d.terminalValueWeight}% do valor total da firma)</small>
          </div>
        </div>
      </div>
    `;
  } else if (currentDcfStep === 5) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 5: Estrutura de Capital & Custo Médio Ponderado (WACC)</h3>
          <p class="card-subtitle">Ponderação do Custo de Capital Próprio (Ke via CAPM) e Custo da Dívida pós-impostos.</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(6)">Avançar: Enterprise Value ➔</button>
      </div>
      <div class="grid-2">
        <div class="card" style="background: rgba(0,0,0,0.25);">
          <h4 style="color: #38bdf8; margin-bottom: 8px;">CAPM (Capital Asset Pricing Model)</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">Ke = Krf + β × (Km - Krf) + Prêmio de Risco País</p>
          <div style="font-size: 0.9rem; line-height: 1.8;">
            <div>• Taxa Livre de Risco (Krf): ${(dcfParams.krf * 100).toFixed(2)}%</div>
            <div>• Prêmio de Mercado (Km - Krf): ${((dcfParams.km - dcfParams.krf) * 100).toFixed(2)}%</div>
            <div>• Beta da Concessionária (β): ${dcfParams.beta.toFixed(2)}</div>
            <div>• Risco País Brasil (rr): ${(dcfParams.countryRisk * 100).toFixed(2)}%</div>
            <div style="font-size: 1.05rem; font-weight: 700; color: #34d399; margin-top: 8px;">
              = Custo de Capital Próprio (Ke): ${(d.ke * 100).toFixed(2)}%
            </div>
          </div>
        </div>
        <div class="card" style="background: rgba(0,0,0,0.25);">
          <h4 style="color: #818cf8; margin-bottom: 8px;">WACC Consolidado</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">WACC = Ke × (E/V) + Kd × (1 - T) × (D/V)</p>
          <div style="font-size: 0.9rem; line-height: 1.8;">
            <div>• Participação Capital Próprio (E/V): ${(dcfParams.equityWeight * 100).toFixed(0)}%</div>
            <div>• Participação Dívida (D/V): ${(dcfParams.debtWeight * 100).toFixed(0)}%</div>
            <div>• Custo da Dívida Líquido de IR [9.5% × (1 - 34%)]: 6.27%</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin-top: 8px;">
              = Taxa de Desconto WACC: ${(d.wacc * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (currentDcfStep === 6) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 6: Cálculo do Enterprise Value (Valor da Firma)</h3>
          <p class="card-subtitle">Soma do valor presente dos fluxos operacionais com o valor terminal.</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(7)">Avançar: Dívida Líquida ➔</button>
      </div>
      <div class="grid-3" style="margin-bottom: 20px;">
        <div class="metric-pill">
          <span class="lbl">VP dos Fluxos Explícitos</span>
          <span class="val neutral">R$ ${d.sumPvExplicit.toLocaleString('pt-BR')}</span>
        </div>
        <div class="metric-pill">
          <span class="lbl">VP do Valor Terminal</span>
          <span class="val neutral">R$ ${d.pvTerminalValue.toLocaleString('pt-BR')}</span>
        </div>
        <div class="metric-pill" style="border-color: var(--color-primary);">
          <span class="lbl">ENTERPRISE VALUE (EV)</span>
          <span class="val positive" style="font-size: 1.25rem;">R$ ${d.enterpriseValue.toLocaleString('pt-BR')}</span>
        </div>
      </div>
    `;
  } else if (currentDcfStep === 7) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 7: Apuração da Dívida Líquida no Balanço</h3>
          <p class="card-subtitle">Dívida Líquida = Financiamentos e Empréstimos Brutos - Disponibilidades de Caixa.</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(8)">Avançar: Shareholder Value ➔</button>
      </div>
      <div class="grid-2">
        <div class="card" style="background: rgba(0,0,0,0.25);">
          <h4 style="color: #f87171; margin-bottom: 12px;">Passivos Onerosos (Dívida Bruta)</h4>
          <div style="font-size: 0.9rem; line-height: 2;">
            <div>• Empréstimos de Curto Prazo: R$ 12.000 mil</div>
            <div>• Debêntures de Longo Prazo: R$ 33.000 mil</div>
            <div style="font-weight: 700; color: #f87171;">= Total Dívida Bruta: R$ ${d.totalDebt.toLocaleString('pt-BR')} mil</div>
          </div>
        </div>
        <div class="card" style="background: rgba(0,0,0,0.25);">
          <h4 style="color: #34d399; margin-bottom: 12px;">Ativos de Liquidez (Caixa)</h4>
          <div style="font-size: 0.9rem; line-height: 2;">
            <div>• Caixa e Bancos: R$ 5.000 mil</div>
            <div>• Aplicações Financeiras: R$ 10.000 mil</div>
            <div style="font-weight: 700; color: #34d399;">= Total de Caixa Disponível: R$ ${d.cash.toLocaleString('pt-BR')} mil</div>
          </div>
        </div>
      </div>
      <div class="price-range-box" style="margin-top: 16px;">
        <strong>Dívida Líquida:</strong>
        <span class="range-highlight" style="color: #f87171;">
          R$ ${d.totalDebt.toLocaleString('pt-BR')} - R$ ${d.cash.toLocaleString('pt-BR')} = R$ ${d.netDebt.toLocaleString('pt-BR')} mil
        </span>
      </div>
    `;
  } else if (currentDcfStep === 8) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 8: Cálculo do Shareholder Value (Equity Value)</h3>
          <p class="card-subtitle">O valor econômico que de fato pertence aos acionistas após honrar as dívidas líquidas.</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(9)">Avançar: Região de Preço ➔</button>
      </div>
      <div class="grid-3">
        <div class="metric-pill">
          <span class="lbl">Enterprise Value</span>
          <span class="val neutral">R$ ${d.enterpriseValue.toLocaleString('pt-BR')}</span>
        </div>
        <div class="metric-pill">
          <span class="lbl">(-) Dívida Líquida</span>
          <span class="val negative">R$ ${d.netDebt.toLocaleString('pt-BR')}</span>
        </div>
        <div class="metric-pill" style="border-color: var(--color-success);">
          <span class="lbl">SHAREHOLDER VALUE</span>
          <span class="val positive" style="font-size: 1.25rem;">R$ ${d.shareholderValue.toLocaleString('pt-BR')}</span>
        </div>
      </div>
      <div class="card" style="margin-top: 16px; background: rgba(0,0,0,0.25);">
        <h4>Preço Justo por Ação:</h4>
        <div style="font-size: 2rem; font-weight: 800; color: #a855f7; margin-top: 8px;">
          R$ ${d.sharePrice.toFixed(2)}
          <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: normal;">(Base: 10.000.000 ações)</span>
        </div>
      </div>
    `;
  } else if (currentDcfStep === 9) {
    html = `
      <div class="card-header">
        <div>
          <h3 class="card-title">Passo 9: Análise de Sensibilidade & Região de Preço</h3>
          <p class="card-subtitle">Valuation não é um número único: veja como o valor se comporta variando WACC e taxa g.</p>
        </div>
        <button class="btn btn-primary" onclick="goToDcfStep(10)">Concluir Missão ➔</button>
      </div>
      <div class="football-field-container">
        <h4 style="margin-bottom: 8px; color: #e2e8f0;">Gráfico Football Field — Região de Preço para M&A</h4>
        <canvas id="footballCanvas" style="width: 100%; height: 280px;"></canvas>
      </div>
      <div style="margin-top: 20px;">
        <h4 style="margin-bottom: 8px;">Matriz 5x5 de Sensibilidade (WACC × g perpétuo)</h4>
        <div style="overflow-x: auto;">
          <table class="financial-table">
            <thead>
              <tr>
                <th>WACC \ g</th>
                ${latestSensitivity.matrix[0].cells.map(c => `<th>${c.gLabel}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${latestSensitivity.matrix.map(row => `
                <tr>
                  <td style="font-weight: 700; background: rgba(255,255,255,0.04);">${row.waccLabel}</td>
                  ${row.cells.map(c => `
                    <td style="${c.valid ? (c.enterpriseValue === d.enterpriseValue ? 'background: rgba(56, 189, 248, 0.2); font-weight: bold;' : '') : 'color: var(--text-muted);'}">
                      ${c.valid ? 'R$ ' + c.enterpriseValue.toLocaleString('pt-BR') : 'N/A'}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (currentDcfStep === 10) {
    html = `
      <div class="card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.1)); border-color: var(--color-success); text-align: center; padding: 32px;">
        <div style="font-size: 48px; margin-bottom: 12px;">🏆</div>
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 8px;">Medalha Conquistada: Detetive do Fluxo de Caixa!</h2>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto 20px auto;">
          Seu laudo técnico de avaliação foi homologado. Você já pode emitir o documento oficial em PDF 
          ou levar sua região de preço para testar suas habilidades na <strong>Arena de Negociação de M&A</strong>!
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-primary" onclick="switchTab('laudo')">📜 Visualizar & Imprimir Laudo em PDF</button>
          <button class="btn btn-success" onclick="switchTab('negotiation')">🦈 Defender Preço na Arena de M&A ➔</button>
        </div>
      </div>
    `;
    const b = gameState.unlockBadge('detetive_fcd');
    if (b) {
      sounds.levelUp();
      showToast('Nova Conquista!', 'Medalha Detetive do FCD desbloqueada (+300 XP)', '🔍');
    }
  }

  container.innerHTML = html;
  renderDcfStepCharts();
}

function renderDcfStepCharts() {
  if (currentDcfStep === 3 && latestDcfResult) {
    FinanceCharts.renderCashFlowProjections('dcfProjCanvas', latestDcfResult.projections);
  } else if (currentDcfStep === 9 && latestSensitivity) {
    FinanceCharts.renderFootballField('footballCanvas', latestSensitivity.priceRange);
  }
}

/* ==================== 3. MÓDULO II: JOGO DOS MÚLTIPLOS ==================== */
let blitzCurrentIndex = 0;
let blitzScore = 0;

function initMultiplesModule() {
  renderBlitzRound();
}

function renderBlitzRound() {
  const container = document.getElementById('blitzGameContainer');
  const scoreBoard = document.getElementById('blitzScoreBoard');
  if (!container) return;

  if (scoreBoard) {
    scoreBoard.textContent = `Pontuação: ${blitzScore} pts (${blitzCurrentIndex}/${BLITZ_COMPANIES.length})`;
  }

  if (blitzCurrentIndex >= BLITZ_COMPANIES.length) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 36px; border-color: var(--color-success); background: rgba(16, 185, 129, 0.1);">
        <div style="font-size: 48px; margin-bottom: 12px;">⚡</div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #fff;">Parabéns! M&A Blitz Concluída!</h2>
        <p style="color: var(--text-secondary); margin: 10px 0 20px 0;">
          Você demonstrou discernimento profissional para selecionar múltiplos relativos adequados ao estágio operacional de cada negócio.
        </p>
        <p style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary); margin-bottom: 20px;">
          Pontuação Final: ${blitzScore} pontos
        </p>
        <button class="btn btn-primary" onclick="restartBlitz()">Jogar Novamente 🔄</button>
      </div>
    `;

    const b = gameState.unlockBadge('mestre_multiplos');
    if (b) {
      sounds.levelUp();
      showToast('Medalha Conquistada!', 'Mestre dos Múltiplos (+300 XP)', '⚡');
    }
    return;
  }

  const company = BLITZ_COMPANIES[blitzCurrentIndex];

  container.innerHTML = `
    <div class="blitz-company-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <span class="company-stage-badge">${company.stage}</span>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #fff; margin: 4px 0;">${company.name}</h3>
          <p style="font-size: 0.88rem; color: var(--color-primary);">${company.sector}</p>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">Empresa ${blitzCurrentIndex + 1} de ${BLITZ_COMPANIES.length}</div>
      </div>

      <p style="font-size: 0.92rem; color: var(--text-secondary); margin-top: 12px; line-height: 1.5;">
        ${company.description}
      </p>

      <div class="financials-strip">
        <div class="financial-stat-item">
          <span class="lbl">Receita Líquida</span>
          <span class="val">R$ ${(company.financials.revenue / 1000000).toFixed(1)}M</span>
        </div>
        <div class="financial-stat-item">
          <span class="lbl">EBITDA</span>
          <span class="val" style="color: ${company.financials.ebitda >= 0 ? '#10b981' : '#f87171'};">
            R$ ${(company.financials.ebitda / 1000000).toFixed(1)}M
          </span>
        </div>
        <div class="financial-stat-item">
          <span class="lbl">Lucro Líquido</span>
          <span class="val" style="color: ${company.financials.netIncome >= 0 ? '#10b981' : '#f87171'};">
            R$ ${(company.financials.netIncome / 1000000).toFixed(1)}M
          </span>
        </div>
        <div class="financial-stat-item">
          <span class="lbl">Dívida Líquida</span>
          <span class="val">R$ ${(company.financials.netDebt / 1000000).toFixed(1)}M</span>
        </div>
      </div>

      <h4 style="font-size: 1rem; color: #e2e8f0; margin-top: 20px;">
        Qual múltiplo de avaliação você deve recomendar para esta transação?
      </h4>

      <div class="multiples-options-grid">
        ${Object.keys(MULTIPLES_GUIDE).map(multKey => {
          const guide = MULTIPLES_GUIDE[multKey];
          return `
            <div class="multiple-choice-card" onclick="submitMultipleChoice('${multKey}')">
              <div class="multiple-title">${multKey}</div>
              <div class="multiple-formula">${guide.formula}</div>
              <p style="font-size: 0.78rem; color: var(--text-secondary);">${guide.targetProfile}</p>
            </div>
          `;
        }).join('')}
      </div>

      <div id="blitzFeedbackArea" style="margin-top: 20px;"></div>
    </div>
  `;
}

function submitMultipleChoice(selectedKey) {
  const company = BLITZ_COMPANIES[blitzCurrentIndex];
  const fbArea = document.getElementById('blitzFeedbackArea');
  if (!fbArea) return;

  const isCorrect = selectedKey === company.correctMultiple;
  const valResult = calculateRelativeValuation(company, selectedKey);

  if (isCorrect) {
    sounds.cashRegister();
    blitzScore += 150;
    gameState.addXp(100, 'Acerto no M&A Blitz');

    fbArea.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid var(--color-success); border-radius: var(--radius-md); padding: 16px;">
        <h4 style="color: #6ee7b7; font-weight: 700; margin-bottom: 6px;">🎯 Resposta Correta! (+150 pts)</h4>
        <p style="font-size: 0.88rem; color: #e2e8f0; margin-bottom: 10px;">${company.explanation}</p>
        <div style="font-size: 0.85rem; color: var(--color-primary);">
          Valuation Implícito: <strong>R$ ${(valResult.impliedEnterpriseValue / 1000000).toFixed(1)}M</strong> 
          (base: ${valResult.multipleValue}x ${valResult.multiple}).
        </div>
        <button class="btn btn-success" style="margin-top: 14px;" onclick="nextBlitzCompany()">Próxima Empresa ➔</button>
      </div>
    `;
  } else {
    sounds.error();
    const distractor = company.distractors.find(d => d.multiple === selectedKey);
    const whyWrong = distractor ? distractor.whyWrong : 'Este múltiplo não é adequado para a maturidade financeira desta empresa.';

    fbArea.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--color-danger); border-radius: var(--radius-md); padding: 16px;">
        <h4 style="color: #fca5a5; font-weight: 700; margin-bottom: 6px;">❌ Escolha Inadequada!</h4>
        <p style="font-size: 0.88rem; color: #e2e8f0; margin-bottom: 10px;">${whyWrong}</p>
        <button class="btn btn-secondary" style="margin-top: 14px;" onclick="renderBlitzRound()">Tentar Novamente</button>
      </div>
    `;
  }
}

function nextBlitzCompany() {
  blitzCurrentIndex++;
  renderBlitzRound();
}

function restartBlitz() {
  blitzCurrentIndex = 0;
  blitzScore = 0;
  renderBlitzRound();
}

/* ==================== 4. MÓDULO III: CRISE INFLACIONÁRIA ==================== */
let inflationCurrentRound = 0;
let currentCompanyInflationState = {
  revenue: 200000,
  costs: 130000,
  fixedCosts: 30000,
  historicalDepr: 15000,
  wacc: 0.12,
  fcf: 22000,
  capex: 18000
};

function initInflationModule() {
  const btnReset = document.getElementById('btnResetInflation');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      inflationCurrentRound = 0;
      currentCompanyInflationState = {
        revenue: 200000,
        costs: 130000,
        fixedCosts: 30000,
        historicalDepr: 15000,
        wacc: 0.12,
        fcf: 22000,
        capex: 18000
      };
      sounds.click();
      renderInflationSim();
    });
  }
  renderInflationSim();
}

function renderInflationSim() {
  const container = document.getElementById('inflationSimContainer');
  if (!container) return;

  if (inflationCurrentRound >= INFLATION_ROUNDS.length) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 36px; border-color: var(--color-success); background: rgba(16, 185, 129, 0.1);">
        <div style="font-size: 48px; margin-bottom: 12px;">🛡️</div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #fff;">Missão Cumprida: Você Sobreviveu à Crise!</h2>
        <p style="color: var(--text-secondary); margin: 12px 0 20px 0; max-width: 600px; margin-left: auto; margin-right: auto;">
          Você aplicou com rigor a Regra de Ouro: em ambientes inflacionários, proteger o valuation exige fazer 
          o fluxo de caixa crescer acima do aumento do WACC e combater a corrosão tributária da depreciação histórica.
        </p>
        <button class="btn btn-primary" onclick="initInflationModule()">Reiniciar Simulação</button>
      </div>
    `;

    const b = gameState.unlockBadge('sobrevivente_inflacao');
    if (b) {
      sounds.levelUp();
      showToast('Medalha Conquistada!', 'Sobrevivente da Inflação (+300 XP)', '🛡️');
    }
    return;
  }

  const round = INFLATION_ROUNDS[inflationCurrentRound];

  container.innerHTML = `
    <div class="inflation-shock-banner">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #f87171;">⚠️ ${round.name}</h3>
        <span style="background: rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 0.85rem;">
          Inflação: ${(round.inflationRate * 100).toFixed(1)}% a.a. | WACC: +${(round.waccImpact * 100).toFixed(1)} p.p.
        </span>
      </div>
      <p style="font-size: 0.92rem; color: #f1f5f9; margin-top: 10px; line-height: 1.5;">${round.narrative}</p>
    </div>

    <div class="grid-4" style="margin-bottom: 20px;">
      <div class="metric-pill">
        <span class="lbl">Receita Atual</span>
        <span class="val neutral">R$ ${(currentCompanyInflationState.revenue).toLocaleString('pt-BR')}k</span>
      </div>
      <div class="metric-pill">
        <span class="lbl">WACC de Mercado</span>
        <span class="val negative">${((currentCompanyInflationState.wacc + round.waccImpact) * 100).toFixed(1)}%</span>
      </div>
      <div class="metric-pill">
        <span class="lbl">FCF Anterior</span>
        <span class="val positive">R$ ${(currentCompanyInflationState.fcf).toLocaleString('pt-BR')}k</span>
      </div>
      <div class="metric-pill">
        <span class="lbl">Depreciação Fixa (Não Indexada)</span>
        <span class="val" style="color: #cbd5e1;">R$ 15.000k</span>
      </div>
    </div>

    <h4 style="font-size: 1.05rem; color: #e2e8f0; margin-bottom: 12px;">Como CEO, qual é a sua estratégia corporativa de repasse e custos?</h4>

    <div class="strategy-selection-list">
      ${PASSTHROUGH_STRATEGIES.map((strat, idx) => `
        <div class="strategy-radio-card" onclick="executeInflationStrategy('${strat.id}')">
          <div style="font-size: 24px;">${idx === 3 ? '💡' : (idx === 2 ? '🏷️' : (idx === 1 ? '⚖️' : '🛑'))}</div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--color-primary);">${strat.name}</div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">${strat.description}</p>
          </div>
          <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.8rem;">Adotar Estratégia ➔</button>
        </div>
      `).join('')}
    </div>

    <div id="inflationOutcomeDisplay"></div>
  `;
}

function executeInflationStrategy(strategyId) {
  const round = INFLATION_ROUNDS[inflationCurrentRound];
  const strat = PASSTHROUGH_STRATEGIES.find(s => s.id === strategyId);
  if (!strat) return;

  const result = simulateInflationRound(currentCompanyInflationState, round, strat);
  currentCompanyInflationState = {
    revenue: result.revenue,
    costs: result.costs,
    fixedCosts: result.fixedCosts,
    historicalDepr: result.deprFiscal,
    wacc: result.wacc,
    fcf: result.fcf,
    capex: result.capex
  };

  const display = document.getElementById('inflationOutcomeDisplay');
  if (!display) return;

  if (result.survivesGoldenRule) {
    sounds.success();
    gameState.addXp(120, 'Sobreviveu à Rodada de Inflação');
  } else {
    sounds.error();
  }

  display.innerHTML = `
    <div class="card" style="margin-top: 20px; background: rgba(0,0,0,0.3); border-color: ${result.survivesGoldenRule ? 'var(--color-success)' : 'var(--color-danger)'};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="font-size: 1.1rem; color: ${result.survivesGoldenRule ? '#34d399' : '#f87171'}; font-weight: 800;">
          ${result.survivesGoldenRule ? '✅ Regra de Ouro Cumprida!' : '⚠️ Destruição de Valor em Andamento!'}
        </h4>
        <span style="font-size: 0.85rem; color: var(--text-secondary);">Estratégia: ${strat.name}</span>
      </div>

      <div class="grid-4" style="margin: 12px 0;">
        <div>• Nova Receita: <strong>R$ ${result.revenue.toLocaleString('pt-BR')}k</strong></div>
        <div>• Margem EBITDA: <strong>${result.ebitdaMargin}%</strong></div>
        <div>• Carga Tributária Real: <strong style="color: #fca5a5;">${result.effectiveTaxRateReal}%</strong></div>
        <div>• FCF Nominal Gerado: <strong style="color: #38bdf8;">R$ ${result.fcf.toLocaleString('pt-BR')}k</strong></div>
      </div>

      <div class="golden-rule-box ${result.survivesGoldenRule ? '' : 'danger'}">
        <div style="font-size: 24px;">${result.survivesGoldenRule ? '📈' : '📉'}</div>
        <div style="font-size: 0.88rem;">
          <strong>Teste da Regra de Ouro:</strong> Crescimento do FCF (${result.fcfGrowth}%) vs Aumento do WACC (+${result.waccDelta}%).
          ${result.survivesGoldenRule ? 
            'Seu fluxo de caixa superou o aumento da taxa de desconto, preservando o valor real da firma!' : 
            'O aumento da taxa de desconto foi superior à expansão de caixa, deprimindo o valor presente da empresa.'
          }
        </div>
      </div>

      <div style="margin-top: 16px; text-align: right;">
        <button class="btn btn-primary" onclick="advanceInflationRound()">Avançar para o Próximo Ano ➔</button>
      </div>
    </div>
  `;
}

function advanceInflationRound() {
  inflationCurrentRound++;
  renderInflationSim();
}

/* ==================== 5. MÓDULO IV: GESTÃO EVA E MVA ==================== */
let evaCurrentState = {
  investedCapital: 400000,
  nopat: 64000,
  wacc: 0.14,
  cumulativeMva: 57143,
  yearNumber: 0
};
let selectedInitiativeIds = new Set();

function initEvaModule() {
  const btnApply = document.getElementById('btnApplyEvaPlan');
  if (btnApply) btnApply.addEventListener('click', applyEvaYear);
  renderEvaScreen();
}

function renderEvaScreen() {
  const container = document.getElementById('evaMvaContainer');
  if (!container) return;

  const currentEvaCalc = calculateEva(evaCurrentState.nopat, evaCurrentState.wacc, evaCurrentState.investedCapital);
  let totalCost = 0;
  for (const id of selectedInitiativeIds) {
    const init = EVA_INITIATIVES.find(i => i.id === id);
    if (init) totalCost += init.costBudget;
  }
  const budgetLeft = 50000 - totalCost;

  container.innerHTML = `
    <div class="grid-4" style="margin-bottom: 20px;">
      <div class="metric-pill">
        <span class="lbl">Capital Investido</span>
        <span class="val neutral">R$ ${evaCurrentState.investedCapital.toLocaleString('pt-BR')}k</span>
      </div>
      <div class="metric-pill">
        <span class="lbl">NOPAT Anual</span>
        <span class="val positive">R$ ${evaCurrentState.nopat.toLocaleString('pt-BR')}k</span>
      </div>
      <div class="metric-pill">
        <span class="lbl">Encargo de Capital (14%)</span>
        <span class="val negative">R$ ${currentEvaCalc.capitalCharge.toLocaleString('pt-BR')}k</span>
      </div>
      <div class="metric-pill" style="border-color: ${currentEvaCalc.createsValue ? 'var(--color-success)' : 'var(--color-danger)'};">
        <span class="lbl">EVA ANUAL</span>
        <span class="val ${currentEvaCalc.createsValue ? 'positive' : 'negative'}">
          R$ ${currentEvaCalc.eva.toLocaleString('pt-BR')}k
        </span>
      </div>
    </div>

    <div class="budget-meter">
      <div>
        <span style="font-size: 0.85rem; color: var(--text-secondary);">Orçamento Anual Disponível:</span>
        <strong style="font-size: 1.15rem; color: ${budgetLeft >= 0 ? '#38bdf8' : '#ef4444'}; margin-left: 8px;">
          R$ ${budgetLeft.toLocaleString('pt-BR')}k / R$ 50.000k
        </strong>
      </div>
      <span style="font-size: 0.82rem; color: var(--text-muted);">${selectedInitiativeIds.size} iniciativas selecionadas</span>
    </div>

    <h4 style="font-size: 1.05rem; margin-bottom: 14px;">Selecione suas estratégias nos 3 Caminhos de Criação de Valor:</h4>

    <div class="initiatives-grid">
      ${EVA_INITIATIVES.map(init => {
        const isSelected = selectedInitiativeIds.has(init.id);
        return `
          <div class="initiative-card ${isSelected ? 'active' : ''}" onclick="toggleInitiative('${init.id}')" style="cursor: pointer;">
            <div>
              <span class="pillar-tag">${init.category}</span>
              <h5 style="font-size: 0.95rem; font-weight: 700; color: #f1f5f9; margin: 4px 0 8px 0;">${init.title}</h5>
              <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${init.description}</p>
            </div>
            <div style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.8rem; color: #cbd5e1;">Custo: <strong>R$ ${init.costBudget.toLocaleString('pt-BR')}k</strong></span>
              <span class="btn ${isSelected ? 'btn-success' : 'btn-secondary'}" style="padding: 4px 10px; font-size: 0.75rem;">
                ${isSelected ? '✓ Selecionado' : '+ Selecionar'}
              </span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function toggleInitiative(id) {
  if (selectedInitiativeIds.has(id)) selectedInitiativeIds.delete(id);
  else selectedInitiativeIds.add(id);
  sounds.click();
  renderEvaScreen();
}

function applyEvaYear() {
  try {
    const nextYear = applyEvaYearPlan(evaCurrentState, Array.from(selectedInitiativeIds), 50000);
    evaCurrentState = {
      investedCapital: nextYear.investedCapital,
      nopat: nextYear.nopat,
      wacc: nextYear.wacc,
      cumulativeMva: nextYear.cumulativeMva,
      yearNumber: nextYear.yearNumber
    };
    selectedInitiativeIds.clear();

    gameState.updateHudMetrics(nextYear.eva, nextYear.cumulativeMva, nextYear.roi / 100, nextYear.wacc);

    if (nextYear.cumulativeMva >= 100000) {
      const b = gameState.unlockBadge('arquiteto_mva');
      if (b) {
        sounds.levelUp();
        showToast('Medalha Conquistada!', 'Arquiteto de Riqueza Real (+300 XP)', '💎');
      }
    } else {
      sounds.cashRegister();
      gameState.addXp(150, 'Ciclo de Gestão EVA Executado');
    }

    renderEvaScreen();
    showToast(`Ano ${nextYear.yearNumber} Executado!`, `Novo MVA Acumulado: R$ ${nextYear.cumulativeMva.toLocaleString('pt-BR')}k`, '📊');
  } catch (err) {
    sounds.error();
    showToast('Erro no Orçamento', err.message, '⚠️');
  }
}

/* ==================== 6. CASO SAELPA (CHEFE DE FASE) ==================== */
let saelpaCurrentYear = 2003;
let saelpaQuizPassed = false;

function initSaelpaModule() {
  renderSaelpaScreen();
}

function renderSaelpaScreen() {
  const container = document.getElementById('saelpaContainer');
  if (!container) return;

  const yr = saelpaCurrentYear;
  const d = SAELPA_HISTORICAL_DATA[yr];

  container.innerHTML = `
    <div class="saelpa-timeline">
      <div class="timeline-year-btn ${yr === 2003 ? 'active' : ''}" onclick="selectSaelpaYear(2003)">
        <div style="font-weight: 800; font-size: 1.1rem;">2003</div>
        <small style="color: var(--text-secondary);">Linha de Base Pós-Privatização</small>
      </div>
      <div class="timeline-year-btn ${yr === 2004 ? 'active' : ''}" onclick="selectSaelpaYear(2004)">
        <div style="font-weight: 800; font-size: 1.1rem; color: #f87171;">2004 ⚠️</div>
        <small style="color: var(--text-secondary);">O Dilema & Mistério Educativo</small>
      </div>
      <div class="timeline-year-btn ${yr === 2005 ? 'active' : ''} ${!saelpaQuizPassed ? 'locked' : ''}" onclick="${saelpaQuizPassed ? 'selectSaelpaYear(2005)' : 'alertBlocked2005()'}">
        <div style="font-weight: 800; font-size: 1.1rem; color: ${saelpaQuizPassed ? '#34d399' : '#64748b'};">
          ${saelpaQuizPassed ? '2005 🚀' : '2005 🔒'}
        </div>
        <small style="color: var(--text-secondary);">${saelpaQuizPassed ? 'A Virada Histórica' : 'Bloqueado (Requer Quiz)'}</small>
      </div>
    </div>

    <div class="card" style="background: rgba(0,0,0,0.3); border-color: rgba(245, 158, 11, 0.4);">
      <div class="card-header">
        <div>
          <h3 class="card-title" style="color: #fcd34d;">${d.phaseTitle}</h3>
          <p class="card-subtitle">${d.context}</p>
        </div>
      </div>

      <div class="grid-4" style="margin: 16px 0;">
        <div class="metric-pill">
          <span class="lbl">NOPAT Real</span>
          <span class="val positive">R$ ${d.nopat.toLocaleString('pt-BR')}k</span>
        </div>
        <div class="metric-pill">
          <span class="lbl">Capital Investido</span>
          <span class="val neutral">R$ ${d.investedCapital.toLocaleString('pt-BR')}k</span>
        </div>
        <div class="metric-pill">
          <span class="lbl">ROI da SAELPA</span>
          <span class="val" style="color: ${d.roi >= d.wacc ? '#34d399' : '#f87171'};">${(d.roi * 100).toFixed(2)}%</span>
        </div>
        <div class="metric-pill">
          <span class="lbl">WACC ANEEL</span>
          <span class="val negative">${(d.wacc * 100).toFixed(2)}%</span>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 20px;">
        <div class="metric-pill">
          <span class="lbl">Lucro Líquido Contábil</span>
          <span class="val" style="color: #818cf8;">R$ ${d.accountingNetIncome.toLocaleString('pt-BR')}k</span>
        </div>
        <div class="metric-pill" style="border-color: ${d.eva >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
          <span class="lbl">EVA</span>
          <span class="val ${d.eva >= 0 ? 'positive' : 'negative'}">
            R$ ${d.eva.toLocaleString('pt-BR')}k
          </span>
        </div>
        <div class="metric-pill">
          <span class="lbl">MVA Acumulado</span>
          <span class="val ${d.mva >= 0 ? 'positive' : 'negative'}">
            R$ ${d.mva.toLocaleString('pt-BR')}k
          </span>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-md); padding: 16px;">
        <h4 style="font-size: 0.95rem; color: #e2e8f0; margin-bottom: 8px;">Comparativo: Lucro Contábil vs. EVA (2003–2005)</h4>
        <canvas id="saelpaChartCanvas" style="width: 100%; height: 240px;"></canvas>
      </div>
    </div>

    ${yr === 2004 ? `
      <div class="dilemma-alert-card">
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <div style="font-size: 36px;">🚨</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: #fca5a5; margin-bottom: 6px;">
              Notificação Urgente do Conselho de Administração da SAELPA
            </h3>
            <p style="font-size: 0.95rem; color: #fff; line-height: 1.6; margin-bottom: 16px;">
              <em>"Reportamos um lucro líquido contábil positivo de R$ 20,8 milhões, mas fomos formalmente acusados 
              de destruir quase R$ 10,5 milhões da riqueza dos acionistas e derrubar o MVA em R$ 59 milhões!"</em>
            </p>
            <p style="font-size: 0.9rem; color: #fcd34d; margin-bottom: 14px; font-weight: 700;">
              Desafio Obrigatório: Responda ao Quiz Diagnóstico para desvendar o paradoxo e desbloquear o ano de 2005:
            </p>

            <div class="quiz-box">
              <p style="font-size: 0.92rem; color: #f1f5f9; margin-bottom: 12px; font-weight: 600;">
                ${SAELPA_2004_QUIZ.question}
              </p>
              ${SAELPA_2004_QUIZ.options.map((opt, idx) => `
                <button class="quiz-option-btn" id="saelpaOpt_${opt.id}" onclick="answerSaelpaQuiz('${opt.id}')">
                  <strong>${String.fromCharCode(65 + idx)})</strong> ${opt.text}
                </button>
              `).join('')}
              <div id="saelpaQuizFeedback" style="margin-top: 14px;"></div>
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    ${yr === 2005 ? `
      <div class="card" style="border-color: var(--color-success); background: rgba(16, 185, 129, 0.1); padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #6ee7b7;">🚀 A Grande Virada Estratégica de 2005</h3>
            <p style="font-size: 0.92rem; color: var(--text-secondary); margin-top: 6px; max-width: 650px;">
              Com a aprovação da expansão para R$ 538,8M, ROI saltando para 20,9% e redução do WACC para 15,32%, 
              o EVA bateu R$ 30,1 milhões e o MVA atingiu R$ 196,3 milhões!
            </p>
          </div>
          <button class="btn btn-success" onclick="completeSaelpaBossFight()">Coroar Missão SAELPA 👑</button>
        </div>
      </div>
    ` : ''}
  `;

  setTimeout(() => {
    FinanceCharts.renderSaelpaComparison('saelpaChartCanvas', SAELPA_HISTORICAL_DATA);
  }, 50);
}

function selectSaelpaYear(year) {
  saelpaCurrentYear = year;
  sounds.click();
  renderSaelpaScreen();
}

function alertBlocked2005() {
  sounds.alert();
  showToast('Acesso Bloqueado!', 'Você precisa desvendar o Mistério Educativo de 2004 no Quiz.', '🔒');
}

function answerSaelpaQuiz(selectedOptionId) {
  const opt = SAELPA_2004_QUIZ.options.find(o => o.id === selectedOptionId);
  const fbArea = document.getElementById('saelpaQuizFeedback');
  const btn = document.getElementById('saelpaOpt_' + selectedOptionId);

  if (opt.correct) {
    sounds.success();
    btn.classList.add('correct');
    saelpaQuizPassed = true;
    gameState.addXp(250, 'Mistério SAELPA 2004 Desvendado');

    fbArea.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid var(--color-success); border-radius: var(--radius-md); padding: 16px;">
        <h4 style="color: #6ee7b7; font-weight: 800; margin-bottom: 6px;">🎉 DIAGNÓSTICO PERFEITO! (+250 XP)</h4>
        <p style="font-size: 0.9rem; color: #fff; line-height: 1.5;">${opt.feedback}</p>
        <button class="btn btn-success" style="margin-top: 14px;" onclick="selectSaelpaYear(2005)">
          Desbloquear Ano de 2005 (A Virada) ➔
        </button>
      </div>
    `;
  } else {
    sounds.error();
    btn.classList.add('wrong');
    fbArea.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid var(--color-danger); border-radius: var(--radius-md); padding: 14px;">
        <h4 style="color: #fca5a5; font-weight: 700;">Diagnóstico Incorreto</h4>
        <p style="font-size: 0.88rem; color: #fff; margin-top: 4px;">${opt.feedback}</p>
      </div>
    `;
  }
}

function completeSaelpaBossFight() {
  const b = gameState.unlockBadge('heroi_saelpa');
  sounds.levelUp();
  showToast('CHEFE DE FASE CONQUISTADO!', 'Medalha Herói do Caso SAELPA desbloqueada (+300 XP)', '👑');
  switchTab('laudo');
}

/* ==================== 7. ARENA DE NEGOCIAÇÃO DE M&A ==================== */
let negotiationState = null;

function initNegotiationModule() {
  const btnAlbrecht = document.getElementById('btnSelectAlbrecht');
  const btnSalles = document.getElementById('btnSelectSalles');

  if (btnAlbrecht) btnAlbrecht.addEventListener('click', () => startNegotiation('albrecht'));
  if (btnSalles) btnSalles.addEventListener('click', () => startNegotiation('salles'));

  startNegotiation('albrecht');
}

function startNegotiation(personaId) {
  const priceRange = latestSensitivity ? latestSensitivity.priceRange : null;
  negotiationState = getInitialNegotiationState(personaId, priceRange);
  sounds.click();
  renderNegotiationArena();
}

function renderNegotiationArena() {
  const container = document.getElementById('negotiationContainer');
  if (!container || !negotiationState) return;

  const st = negotiationState;
  const persona = NEGOTIATION_PERSONAS[st.personaId];
  const currentRound = !st.isCompleted ? persona.rounds[st.currentRoundIndex] : null;

  container.innerHTML = `
    <div class="negotiation-arena-box">
      <div class="negotiation-top-bar">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 28px;">${st.personaAvatar}</span>
          <div>
            <div style="font-weight: 800; font-size: 0.95rem; color: #fff;">${st.personaName}</div>
            <div style="font-size: 0.75rem; color: var(--color-primary);">${st.personaTitle}</div>
          </div>
        </div>

        <div class="power-meter-container">
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Poder de Negociação:</span>
          <div class="power-bar-track">
            <div class="power-bar-fill" style="width: ${st.negotiationPower}%;"></div>
          </div>
          <span style="font-weight: 800; font-size: 0.9rem; color: ${st.negotiationPower >= 70 ? '#34d399' : (st.negotiationPower >= 40 ? '#fbbf24' : '#f87171')};">
            ${st.negotiationPower}/100
          </span>
        </div>

        <div style="text-align: right;">
          <span style="font-size: 0.72rem; color: var(--text-muted);">Oferta Atual:</span>
          <div style="font-size: 1.05rem; font-weight: 800; color: #38bdf8;">
            R$ ${(st.currentOffer).toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      <div class="chat-history-scroll" id="chatScroll">
        ${st.history.map(msg => `
          <div class="chat-bubble ${msg.sender}">
            <div style="font-size: 0.75rem; color: ${msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--color-primary)'}; font-weight: 700; margin-bottom: 4px;">
              ${msg.sender === 'user' ? 'Você (Analista)' : st.personaName}
            </div>
            <div>${msg.text}</div>
            ${msg.offer ? `<div style="font-size: 0.75rem; color: #38bdf8; margin-top: 6px; font-weight: 600;">[Oferta calibrada: R$ ${msg.offer.toLocaleString('pt-BR')}]</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="negotiation-choices-panel">
        ${!st.isCompleted && currentRound ? `
          <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 10px; font-weight: 600;">
            Escolha seu argumento financeiro para defender o valuation:
          </div>
          ${currentRound.options.map((opt, idx) => `
            <button class="negotiation-choice-btn" onclick="chooseNegotiationOption(${idx})">
              <strong>${idx + 1}.</strong> ${opt.text}
            </button>
          `).join('')}
        ` : `
          <div style="text-align: center; padding: 12px;">
            <h4 style="font-size: 1.15rem; color: #6ee7b7; font-weight: 800; margin-bottom: 4px;">
              ${st.dealOutcome ? st.dealOutcome.title : 'Negociação Finalizada'}
            </h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
              ${st.dealOutcome ? st.dealOutcome.description : ''}
            </p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <button class="btn btn-secondary" onclick="startNegotiation('${st.personaId === 'albrecht' ? 'salles' : 'albrecht'}')">
                Negociar com ${st.personaId === 'albrecht' ? 'Beatriz Salles' : 'Dr. Albrecht'} ➔
              </button>
              <button class="btn btn-primary" onclick="switchTab('laudo')">Emitir Laudo Formal 📜</button>
            </div>
          </div>
        `}
      </div>
    </div>
  `;

  const scroll = document.getElementById('chatScroll');
  if (scroll) scroll.scrollTop = scroll.scrollHeight;
}

function chooseNegotiationOption(optionIndex) {
  negotiationState = processNegotiationChoice(negotiationState, optionIndex);
  sounds.click();

  if (negotiationState.isCompleted) {
    if (negotiationState.negotiationPower >= 75) {
      sounds.levelUp();
      const b = gameState.unlockBadge('tubarao_ma');
      if (b) showToast('Medalha Conquistada!', 'Tubarão da Mesa de M&A (+300 XP)', '🦈');
    } else {
      sounds.cashRegister();
      gameState.addXp(150, 'Acordo de M&A Concluído');
    }
  }

  renderNegotiationArena();
}

/* ==================== 8. LAUDO & BADGES ==================== */
function renderLaudo() {
  const container = document.getElementById('laudoDisplayContainer');
  if (!container) return;

  const data = {
    studentName: gameState.state.studentName,
    dcfResult: latestDcfResult || runFullDCF(dcfParams),
    sensitivity: latestSensitivity || generateSensitivityMatrix(dcfParams)
  };

  container.innerHTML = ValuationReportGenerator.generateReportHtml(data);
}

function initBadgesModal() {
  const btnOpen = document.getElementById('btnOpenBadges');
  const btnClose = document.getElementById('btnCloseBadges');
  const modal = document.getElementById('badgesModal');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      sounds.click();
      renderModalBadges();
      modal.classList.add('active');
    });
  }
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}

function renderModalBadges() {
  const list = document.getElementById('modalBadgesList');
  if (!list) return;

  const badges = gameState.state.badges;
  list.innerHTML = Object.keys(badges).map(k => {
    const b = badges[k];
    return `
      <div class="card" style="margin-bottom: 0; background: ${b.unlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)'}; border-color: ${b.unlocked ? 'var(--color-success)' : 'var(--border-color)'};">
        <div style="font-size: 32px; filter: ${b.unlocked ? 'none' : 'grayscale(100%) opacity(40%)'}; margin-bottom: 6px;">${b.icon}</div>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: ${b.unlocked ? '#fff' : 'var(--text-muted)'};">${b.title}</h4>
        <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 4px 0 8px 0;">${b.description}</p>
        <span style="font-size: 0.72rem; font-weight: 700; color: ${b.unlocked ? '#34d399' : '#64748b'};">
          ${b.unlocked ? '✓ Desbloqueada' : '🔒 Bloqueada'}
        </span>
      </div>
    `;
  }).join('');
}

function renderDashboardBadges(badges) {
  const grid = document.getElementById('dashboardBadgesGrid');
  if (!grid) return;

  grid.innerHTML = Object.keys(badges).map(k => {
    const b = badges[k];
    return `
      <div class="card" style="margin-bottom: 0; background: ${b.unlocked ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)'}; border-color: ${b.unlocked ? 'var(--color-primary)' : 'var(--border-color)'};">
        <div style="font-size: 28px; filter: ${b.unlocked ? 'none' : 'grayscale(100%) opacity(35%)'}; margin-bottom: 6px;">${b.icon}</div>
        <h4 style="font-size: 0.95rem; font-weight: 700; color: ${b.unlocked ? '#fff' : 'var(--text-muted)'};">${b.title}</h4>
        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">${b.description}</p>
      </div>
    `;
  }).join('');
}
