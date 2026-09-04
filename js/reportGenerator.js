// ValuationQuest - reportGenerator.js
// Compilador e Gerador do Laudo de Avaliação Técnico / Information Memorandum formal

class ValuationReportGenerator {
  static formatBRL(val) {
    if (val === null || val === undefined || isNaN(val)) return 'R$ -';
    return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  static formatPercent(val) {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return (val * 100).toFixed(2) + '%';
  }

  static generateReportHtml(data) {
    const studentName = data.studentName || 'Analista de Valuation';
    const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const reportCode = 'VQ-LAUDO-' + Math.floor(100000 + Math.random() * 900000);
    const dcf = data.dcfResult || {};
    const proj = dcf.projections || [];
    const sens = data.sensitivity || {};

    let projRowsHtml = '';
    for (const p of proj) {
      projRowsHtml += `<tr>
        <td class="text-center font-bold">Ano ${p.year}</td>
        <td class="text-right">${ValuationReportGenerator.formatBRL(p.revenue)}</td>
        <td class="text-right">${ValuationReportGenerator.formatBRL(p.ebitda)} (${(p.ebitdaMargin * 100).toFixed(1)}%)</td>
        <td class="text-right">${ValuationReportGenerator.formatBRL(p.ebit)}</td>
        <td class="text-right">${ValuationReportGenerator.formatBRL(p.nopat)}</td>
        <td class="text-right">${ValuationReportGenerator.formatBRL(p.capex)}</td>
        <td class="text-right">${ValuationReportGenerator.formatBRL(p.deltaNcg)}</td>
        <td class="text-right font-bold text-primary">${ValuationReportGenerator.formatBRL(p.fcf)}</td>
        <td class="text-center">${p.discountFactor.toFixed(4)}</td>
        <td class="text-right font-bold text-success">${ValuationReportGenerator.formatBRL(p.presentValue)}</td>
      </tr>`;
    }

    let sensHtml = '';
    if (sens.matrix) {
      for (const row of sens.matrix) {
        sensHtml += `<tr><td class="font-bold text-center bg-light">${row.waccLabel}</td>`;
        for (const c of row.cells) {
          sensHtml += `<td class="text-right ${c.valid ? '' : 'text-muted'}">
            ${c.valid ? ValuationReportGenerator.formatBRL(c.enterpriseValue) : 'N/A'}
          </td>`;
        }
        sensHtml += '</tr>';
      }
    }

    let matrixCols = '';
    if (sens.matrix && sens.matrix[0]) {
      for (const c of sens.matrix[0].cells) {
        matrixCols += `<th class="text-right">g = ${c.gLabel}</th>`;
      }
    }

    return `
      <div class="formal-laudo-document" id="laudoPrintArea">
        <div class="laudo-header">
          <div class="laudo-branding">
            <div class="laudo-logo-badge">VQ</div>
            <div>
              <h1 class="laudo-title">LAUDO DE AVALIAÇÃO ECONÔMICO-FINANCEIRA</h1>
              <p class="laudo-subtitle">Information Memorandum & Parecer Técnico de Valuation Consultivo</p>
            </div>
          </div>
          <div class="laudo-meta">
            <div><strong>Código:</strong> ${reportCode}</div>
            <div><strong>Data de Emissão:</strong> ${dateStr}</div>
            <div><strong>Avaliador Responsável:</strong> ${studentName}</div>
            <div><strong>Status:</strong> Homologado / Conclusão de Fase</div>
          </div>
        </div>

        <hr class="laudo-divider">

        <section class="laudo-section">
          <h2 class="section-title">1. Sumário Executivo de Resultados</h2>
          <p class="laudo-paragraph">
            O presente laudo técnico formaliza o processo de avaliação econômica pelo método do 
            <strong>Fluxo de Caixa Operacional Descontado da Firma (FCFF)</strong> da companhia avaliada 
            (<strong>Transmissão & Energia Alfa S.A.</strong>), ponderando seu histórico contábil, premissas 
            operacionais, custo médio ponderado de capital (WACC) e valor terminal perpétuo.
          </p>

          <div class="kpi-grid-laudo">
            <div class="kpi-card-laudo">
              <span class="kpi-label">Enterprise Value (Firma)</span>
              <span class="kpi-value text-primary">${ValuationReportGenerator.formatBRL(dcf.enterpriseValue)}</span>
              <span class="kpi-sub">VP Fluxos + VP Terminal</span>
            </div>
            <div class="kpi-card-laudo">
              <span class="kpi-label">Dívida Líquida</span>
              <span class="kpi-value text-danger">${ValuationReportGenerator.formatBRL(dcf.netDebt)}</span>
              <span class="kpi-sub">Empréstimos - Caixa</span>
            </div>
            <div class="kpi-card-laudo">
              <span class="kpi-label">Shareholder Value (Acionistas)</span>
              <span class="kpi-value text-success">${ValuationReportGenerator.formatBRL(dcf.shareholderValue)}</span>
              <span class="kpi-sub">EV - Dívida Líquida</span>
            </div>
            <div class="kpi-card-laudo">
              <span class="kpi-label">Preço por Ação</span>
              <span class="kpi-value text-purple">R$ ${dcf.sharePrice ? dcf.sharePrice.toFixed(2) : '-'}</span>
              <span class="kpi-sub">Base: 10.000.000 ações</span>
            </div>
          </div>

          <div class="price-range-box">
            <strong>Região de Preço Recomendada para Mesa de M&A: </strong>
            <span class="range-highlight">
              ${ValuationReportGenerator.formatBRL(sens.priceRange ? sens.priceRange.minPrice : dcf.enterpriseValue * 0.9)} 
              até 
              ${ValuationReportGenerator.formatBRL(sens.priceRange ? sens.priceRange.maxPrice : dcf.enterpriseValue * 1.1)}
            </span>
            <small> (Margem de negociação estratégica baseada na dispersão de sensibilidade e comparáveis).</small>
          </div>
        </section>

        <section class="laudo-section">
          <h2 class="section-title">2. Determinação da Taxa de Desconto (CAPM e WACC)</h2>
          <table class="laudo-table">
            <thead>
              <tr><th>Parâmetro</th><th>Símbolo</th><th>Valor Adotado</th><th>Fundamentação Técnica</th></tr>
            </thead>
            <tbody>
              <tr><td>Taxa Livre de Risco</td><td>Krf</td><td>5,06%</td><td>Rendimento dos títulos do tesouro americano (USTB 10y)</td></tr>
              <tr><td>Retorno da Carteira de Mercado</td><td>Km</td><td>13,02%</td><td>Média histórica do índice de ações S&P 500</td></tr>
              <tr><td>Coeficiente Beta Desalavancado/Setorial</td><td>β</td><td>0,75</td><td>Volatilidade do setor elétrico de transmissão regulada</td></tr>
              <tr><td>Prêmio de Risco País</td><td>rr</td><td>3,50%</td><td>Indicador de risco soberano EMBI+ Brasil</td></tr>
              <tr><td><strong>Custo do Capital Próprio (CAPM)</strong></td><td><strong>Ke</strong></td><td><strong>${ValuationReportGenerator.formatPercent(dcf.ke)}</strong></td><td><strong>Ke = Krf + β × (Km - Krf) + rr</strong></td></tr>
              <tr><td>Custo da Dívida Líquida de IR (34%)</td><td>Kd (1 - T)</td><td>6,27%</td><td>Taxa de captação de 9,50% a.a. com dedutibilidade fiscal</td></tr>
              <tr class="highlight-row"><td><strong>WACC (Custo Médio Ponderado)</strong></td><td><strong>WACC</strong></td><td><strong>${ValuationReportGenerator.formatPercent(dcf.wacc)}</strong></td><td><strong>65% Capital Próprio / 35% Capital de Terceiros</strong></td></tr>
            </tbody>
          </table>
        </section>

        <section class="laudo-section">
          <h2 class="section-title">3. Projeção dos Fluxos de Caixa Operacionais Livres (5 Anos)</h2>
          <div class="table-responsive-laudo">
            <table class="laudo-table compact-table">
              <thead><tr><th>Período</th><th>Receita Líquida</th><th>EBITDA</th><th>EBIT</th><th>NOPAT</th><th>CapEx</th><th>Δ NCG</th><th>FCFF (Livre)</th><th>Fator DF</th><th>Valor Presente</th></tr></thead>
              <tbody>${projRowsHtml}</tbody>
              <tfoot><tr class="footer-row"><td colspan="9" class="text-right font-bold">Soma dos Valores Presentes dos Fluxos Explícitos:</td><td class="text-right font-bold text-success">${ValuationReportGenerator.formatBRL(dcf.sumPvExplicit)}</td></tr></tfoot>
            </table>
          </div>
        </section>

        <section class="laudo-section">
          <h2 class="section-title">4. Cálculo do Valor Terminal (Perpetuidade de Gordon-Shapiro)</h2>
          <div class="terminal-formula-box">
            <p>VT = FCFF(n+1) / (WACC - g) = ${ValuationReportGenerator.formatBRL(dcf.fcfNext)} / (${ValuationReportGenerator.formatPercent(dcf.wacc)} - ${ValuationReportGenerator.formatPercent(dcf.terminalGrowth)}) = <strong>${ValuationReportGenerator.formatBRL(dcf.terminalValue)}</strong></p>
            <div class="terminal-pv-calc">Valor Presente do VT (descontado a 5 anos): <strong class="text-primary">${ValuationReportGenerator.formatBRL(dcf.pvTerminalValue)}</strong> (Representa <strong>${dcf.terminalValueWeight || 0}%</strong> do Enterprise Value).</div>
          </div>
        </section>

        <section class="laudo-section">
          <h2 class="section-title">5. Matriz de Sensibilidade Bidimensional (WACC × Taxa g)</h2>
          <div class="table-responsive-laudo">
            <table class="laudo-table matrix-table">
              <thead><tr><th>WACC \ Taxa g</th>${matrixCols}</tr></thead>
              <tbody>${sensHtml}</tbody>
            </table>
          </div>
        </section>

        <div class="laudo-certification">
          <div class="cert-badge">🎓 CERTIFICADO DE CONCLUSÃO DE MISSÃO</div>
          <p>Certificamos que <strong>${studentName}</strong> concluiu com êxito os rigorosos passos metodológicos de avaliação intrínseca, análise de sensibilidade e gestão baseada em valor no ambiente de simulação <strong>ValuationQuest: A Jornada do Gestor</strong>.</p>
          <div class="signature-row">
            <div class="sig-block"><div class="sig-line"></div><span>${studentName}</span><small>Analista de Valuation Responsável</small></div>
            <div class="sig-block"><div class="sig-line"></div><span>Comitê de Ensino de Finanças Corporativas</span><small>Gemini Notebook / ValuationQuest 2026</small></div>
          </div>
        </div>

        <div class="laudo-print-controls no-print">
          <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir ou Baixar em PDF</button>
        </div>
      </div>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ValuationReportGenerator };
}
