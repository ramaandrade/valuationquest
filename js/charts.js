// ValuationQuest - charts.js
// Gráficos financeiros interativos em Canvas nativo de alta fidelidade (zero dependências)

class FinanceCharts {
  static formatBRL(val) {
    if (Math.abs(val) >= 1000000) {
      return 'R$ ' + (val / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(val) >= 1000) {
      return 'R$ ' + (val / 1000).toFixed(0) + 'k';
    }
    return 'R$ ' + val;
  }

  /**
   * Renderiza o Gráfico Football Field (Região de Preço do Valuation)
   */
  static renderFootballField(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 600;
    const height = canvas.height = 280;

    ctx.clearRect(0, 0, width, height);

    // Dados de exemplo caso não venham
    const minVal = data.minPrice || 280000;
    const centralVal = data.centralPrice || 350000;
    const maxVal = data.maxPrice || 430000;
    const multiMin = data.multiMin || Math.round(centralVal * 0.88);
    const multiMax = data.multiMax || Math.round(centralVal * 1.15);

    const lowest = Math.min(minVal, multiMin) * 0.85;
    const highest = Math.max(maxVal, multiMax) * 1.15;
    const range = highest - lowest;

    const scaleX = (val) => 120 + ((val - lowest) / range) * (width - 160);

    // Background e Linhas de Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let step = 0; step <= 5; step++) {
      const v = lowest + (range / 5) * step;
      const x = scaleX(v);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 40);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(FinanceCharts.formatBRL(v), x, height - 20);
    }

    // Barras do Football Field
    const bars = [
      { label: 'FCD (Sensibilidade)', min: minVal, max: maxVal, mid: centralVal, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.25)' },
      { label: 'Múltiplos (EV/EBITDA)', min: multiMin, max: multiMax, mid: (multiMin + multiMax) / 2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.25)' },
      { label: 'Região de Preço Alvo', min: Math.min(minVal, multiMin), max: Math.max(maxVal, multiMax), mid: centralVal, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.25)' }
    ];

    bars.forEach((bar, idx) => {
      const y = 40 + idx * 60;
      const x1 = scaleX(bar.min);
      const x2 = scaleX(bar.max);
      const xMid = scaleX(bar.mid);
      const barHeight = 28;

      // Label à esquerda
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(bar.label, 15, y + 18);

      // Barra de intervalo
      ctx.fillStyle = bar.bg;
      ctx.strokeStyle = bar.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x1, y, Math.max(10, x2 - x1), barHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Marcador central
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(xMid, y + barHeight / 2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Textos de min, mid, max
      ctx.fillStyle = bar.color;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(FinanceCharts.formatBRL(bar.min), x1 - 5, y + 18);

      ctx.textAlign = 'left';
      ctx.fillText(FinanceCharts.formatBRL(bar.max), x2 + 5, y + 18);
    });
  }

  /**
   * Renderiza Projeção dos Fluxos de Caixa Livres (5 Anos)
   */
  static renderCashFlowProjections(canvasId, projections) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !projections || projections.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 600;
    const height = canvas.height = 240;

    ctx.clearRect(0, 0, width, height);

    const maxFcf = Math.max(...projections.map(p => Math.max(p.fcf, p.presentValue))) * 1.25;
    const paddingLeft = 60;
    const paddingBottom = 40;
    const chartW = width - paddingLeft - 20;
    const chartH = height - paddingBottom - 20;

    // Grid Y
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const yVal = (maxFcf / 4) * i;
      const y = height - paddingBottom - (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(FinanceCharts.formatBRL(yVal), paddingLeft - 8, y + 3);
    }

    const colWidth = chartW / projections.length;

    projections.forEach((p, idx) => {
      const x = paddingLeft + idx * colWidth + colWidth * 0.15;
      const barW = colWidth * 0.35;

      // Barra de FCF Nominal
      const hNominal = (p.fcf / maxFcf) * chartH;
      const yNominal = height - paddingBottom - hNominal;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x, yNominal, barW, hNominal);

      // Barra de Valor Presente
      const hPv = (p.presentValue / maxFcf) * chartH;
      const yPv = height - paddingBottom - hPv;
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(x + barW + 4, yPv, barW, hPv);

      // Labels X
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ano ' + p.year, x + barW, height - paddingBottom + 18);
    });

    // Legenda
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(width - 220, 10, 12, 12);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FCF Nominal', width - 202, 20);

    ctx.fillStyle = '#818cf8';
    ctx.fillRect(width - 120, 10, 12, 12);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Valor Presente', width - 102, 20);
  }

  /**
   * Renderiza Medidor Visual de Spread Econômico (ROI vs WACC)
   */
  static renderRoiVsWacc(canvasId, roiPercent, waccPercent) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 300;
    const height = canvas.height = 160;

    ctx.clearRect(0, 0, width, height);

    const spread = roiPercent - waccPercent;
    const isPositive = spread >= 0;

    // Barra de comparação
    const maxScale = Math.max(30, Math.max(roiPercent, waccPercent) * 1.3);
    const chartW = width - 80;

    // Linha ROI
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ROI: ' + roiPercent.toFixed(1) + '%', 10, 40);

    ctx.fillStyle = isPositive ? '#10b981' : '#f59e0b';
    const roiW = (roiPercent / maxScale) * chartW;
    ctx.beginPath();
    ctx.roundRect(10, 48, roiW, 20, 4);
    ctx.fill();

    // Linha WACC
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('WACC: ' + waccPercent.toFixed(1) + '%', 10, 95);

    ctx.fillStyle = '#ef4444';
    const waccW = (waccPercent / maxScale) * chartW;
    ctx.beginPath();
    ctx.roundRect(10, 103, waccW, 20, 4);
    ctx.fill();

    // Texto de Spread
    ctx.fillStyle = isPositive ? '#34d399' : '#f87171';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      (isPositive ? 'Criação de Valor: +' : 'Destruição de Valor: ') + spread.toFixed(1) + '% de Spread',
      10, 145
    );
  }

  /**
   * Renderiza o Gráfico Histórico do Caso SAELPA (Lucro Contábil vs EVA)
   */
  static renderSaelpaComparison(canvasId, historicalData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 550;
    const height = canvas.height = 240;

    ctx.clearRect(0, 0, width, height);

    const years = [2003, 2004, 2005];
    const paddingLeft = 70;
    const paddingBottom = 40;
    const chartW = width - paddingLeft - 20;
    const chartH = height - paddingBottom - 30;

    // Escala Y (-20k a +80k)
    const minY = -20000;
    const maxY = 80000;
    const rangeY = maxY - minY;

    const scaleY = (val) => height - paddingBottom - ((val - minY) / rangeY) * chartH;
    const zeroY = scaleY(0);

    // Linha de Zero
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, zeroY);
    ctx.lineTo(width - 20, zeroY);
    ctx.stroke();

    const colW = chartW / years.length;

    years.forEach((yr, idx) => {
      const d = historicalData[yr];
      const xCenter = paddingLeft + idx * colW + colW / 2;
      const barW = 32;

      // Lucro Líquido Contábil (Barra Roxa/Azul)
      const yProfit = scaleY(d.accountingNetIncome);
      const hProfit = zeroY - yProfit;
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(xCenter - barW - 4, yProfit, barW, hProfit);

      // EVA (Barra Verde se positivo, Vermelha se negativo)
      const yEva = scaleY(d.eva);
      const hEva = Math.abs(zeroY - yEva);
      ctx.fillStyle = d.eva >= 0 ? '#10b981' : '#ef4444';
      ctx.fillRect(xCenter + 4, d.eva >= 0 ? yEva : zeroY, barW, hEva);

      // Ano
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(yr.toString(), xCenter, height - paddingBottom + 20);

      // Destaque do Dilema de 2004
      if (yr === 2004) {
        ctx.fillStyle = '#f87171';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('EVA Negativo!', xCenter + 20, yEva + (d.eva < 0 ? 25 : -10));
      }
    });

    // Legenda Superior
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(paddingLeft + 10, 10, 12, 12);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Lucro Líquido Contábil', paddingLeft + 28, 20);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(paddingLeft + 190, 10, 12, 12);
    ctx.fillText('EVA Positivo', paddingLeft + 208, 20);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(paddingLeft + 310, 10, 12, 12);
    ctx.fillText('EVA Negativo (Destruição)', paddingLeft + 328, 20);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FinanceCharts };
}
