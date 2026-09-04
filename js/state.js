// ValuationQuest - state.js
// Gerenciador de estado global reativo com persistência em LocalStorage

const CAREER_LEVELS = [
  { level: 1, title: 'Analista Trainee de Finanças', minXp: 0, icon: '🌱' },
  { level: 2, title: 'Analista Júnior de Valuation', minXp: 250, icon: '📊' },
  { level: 3, title: 'Especialista em FCD & Modelagem', minXp: 600, icon: '🔬' },
  { level: 4, title: 'Associado de Fusões & Aquisições (M&A)', minXp: 1100, icon: '💼' },
  { level: 5, title: 'Diretor de Estratégia e Valor', minXp: 1800, icon: '🏛️' },
  { level: 6, title: 'CFO Lendário & Mestre do MVA', minXp: 2600, icon: '👑' }
];

const BADGES = {
  detetive_fcd: {
    id: 'detetive_fcd',
    title: 'Detetive do Fluxo de Caixa',
    description: 'Completou a metodologia rigorosa dos 10 passos do FCD.',
    icon: '🔍',
    unlocked: false
  },
  mestre_multiplos: {
    id: 'mestre_multiplos',
    title: 'Mestre dos Múltiplos',
    description: 'Associou com perfeição os múltiplos financeiros no M&A Blitz.',
    icon: '⚡',
    unlocked: false
  },
  sobrevivente_inflacao: {
    id: 'sobrevivente_inflacao',
    title: 'Sobrevivente da Inflação',
    description: 'Dominou a Regra de Ouro do FCF contra a escalada do WACC.',
    icon: '🛡️',
    unlocked: false
  },
  arquiteto_mva: {
    id: 'arquiteto_mva',
    title: 'Arquiteto de Riqueza Real',
    description: 'Superou o WACC gerando mais de R$ 100M em MVA acumulado.',
    icon: '💎',
    unlocked: false
  },
  heroi_saelpa: {
    id: 'heroi_saelpa',
    title: 'Herói do Caso SAELPA',
    description: 'Desvendou o mistério da destruição em 2004 e comandou a virada de 2005.',
    icon: '⚡',
    unlocked: false
  },
  tubarao_ma: {
    id: 'tubarao_ma',
    title: 'Tubarão da Mesa de M&A',
    description: 'Defendeu o valuation intrínseco com maestria contra o Private Equity.',
    icon: '🦈',
    unlocked: false
  }
};

const STORAGE_KEY = 'valuationquest_save_v1';

class GameStateManager {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  getDefaultState() {
    return {
      studentName: 'Analista Convidado',
      xp: 0,
      level: 1,
      careerTitle: CAREER_LEVELS[0].title,
      careerIcon: CAREER_LEVELS[0].icon,
      cumulativeMva: 0,
      currentEva: 0,
      currentRoi: 0,
      currentWacc: 0.12,
      soundEnabled: true,
      darkMode: true,
      activeTab: 'dashboard',
      badges: { ...BADGES },
      progress: {
        module1Step: 1,
        module1Completed: false,
        module2Completed: false,
        module3Completed: false,
        module4Completed: false,
        saelpaCompleted: false,
        negotiationCompleted: false
      },
      lastEvaluation: null,
      lastLaudo: null
    };
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...this.getDefaultState(), ...parsed };
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar localStorage:', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
    this.notify();
  }

  reset() {
    this.state = this.getDefaultState();
    this.saveState();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    for (const cb of this.listeners) {
      try {
        cb(this.state);
      } catch (e) {
        console.error('Erro no listener do state:', e);
      }
    }
  }

  addXp(points, reason = '') {
    this.state.xp += points;
    
    // Atualiza nível
    let currentLevel = CAREER_LEVELS[0];
    for (const lvl of CAREER_LEVELS) {
      if (this.state.xp >= lvl.minXp) {
        currentLevel = lvl;
      }
    }
    const leveledUp = currentLevel.level > this.state.level;
    this.state.level = currentLevel.level;
    this.state.careerTitle = currentLevel.title;
    this.state.careerIcon = currentLevel.icon;

    this.saveState();
    return { leveledUp, newLevel: currentLevel, points, reason };
  }

  unlockBadge(badgeId) {
    if (this.state.badges[badgeId] && !this.state.badges[badgeId].unlocked) {
      this.state.badges[badgeId].unlocked = true;
      this.addXp(300, 'Medalha Desbloqueada: ' + this.state.badges[badgeId].title);
      this.saveState();
      return this.state.badges[badgeId];
    }
    return null;
  }

  updateHudMetrics(eva, mva, roi, wacc) {
    if (eva !== undefined) this.state.currentEva = Math.round(eva);
    if (mva !== undefined) this.state.cumulativeMva = Math.round(mva);
    if (roi !== undefined) this.state.currentRoi = Number((roi * 100).toFixed(2));
    if (wacc !== undefined) this.state.currentWacc = Number((wacc * 100).toFixed(2));
    this.saveState();
  }

  setEvaluation(evaluation) {
    this.state.lastEvaluation = evaluation;
    this.saveState();
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.saveState();
    return this.state.soundEnabled;
  }

  toggleDarkMode() {
    this.state.darkMode = !this.state.darkMode;
    this.saveState();
    return this.state.darkMode;
  }
}

// Instância global
const gameState = new GameStateManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CAREER_LEVELS,
    BADGES,
    GameStateManager,
    gameState
  };
}
