// ValuationQuest - negotiationEngine.js
// Motor da Arena de Negociação de M&A (IA Conversacional de Feedback)

const NEGOTIATION_PERSONAS = {
  albrecht: {
    id: 'albrecht',
    name: 'Dr. Paulo Albrecht',
    title: 'Managing Partner @ Apex Global Private Equity',
    avatar: '💼',
    style: 'Rigoroso, cético e focado em desvalorizar premissas de longo prazo para obter o maior desconto possível.',
    initialOfferDiscount: 0.25, // Oferece 25% abaixo do preço central
    rounds: [
      {
        roundNumber: 1,
        botMessage: 'Analisamos o modelo de vocês. Vocês estão usando um WACC muito generoso e uma taxa de crescimento perpétuo (g) de 3,5%. Com a volatilidade macroeconômica, o risco de execução é alto. Minha oferta inicial é 25% abaixo da sua estimativa central.',
        options: [
          {
            text: 'Nosso WACC foi calibrado rigorosamente via CAPM com o beta regulatório da ANEEL (0,75) e o prêmio de risco país real. O setor elétrico de transmissão tem receitas fixas e blindadas contra oscilações de PIB.',
            powerDelta: 15,
            botReply: 'Ponto justo sobre a previsibilidade das concessões de transmissão. Admito que o beta reflete estabilidade. Vou reduzir o desconto para 15%.'
          },
          {
            text: 'Podemos conceder esse desconto se vocês pagarem 100% à vista no fechamento e dispensarem a auditoria confirmatória.',
            powerDelta: -10,
            botReply: 'Nenhum fundo de private equity sério dispensa auditoria. Conceder 25% logo de cara me mostra que sua estimativa inicial estava inflada.'
          },
          {
            text: 'Se o problema for o WACC, observe nossa Matriz de Sensibilidade: mesmo no cenário estressado com WACC 2 p.p. maior, o valor presente dos fluxos operacionais cobre confortavelmente o valor patrimonial.',
            powerDelta: 12,
            botReply: 'A matriz de sensibilidade é sólida. Ela nos dá uma margem de segurança satisfatória. Vamos recalibrar a proposta.'
          }
        ]
      },
      {
        roundNumber: 2,
        botMessage: 'Mesmo aceitando o fluxo operacional, mais de 65% do valor da sua empresa depende do Valor Terminal na perpetuidade. Isso é arriscado demais para colocarmos dinheiro bom agora. Queremos um desconto de liquidez de 15% sobre o Equity Value.',
        options: [
          {
            text: 'O Valor Terminal representa fatia expressiva justamente por se tratar de um ativo perpétuo de infraestrutura básica com ativos de vida útil de 30 anos e histórico de reinvestimento disciplinado que sustenta o g perpétuo.',
            powerDelta: 15,
            botReply: 'Excelente defesa técnica. O perfil dos ativos realmente amortiza ao longo de décadas sem obsolescência rápida.'
          },
          {
            text: 'Tudo bem, podemos retirar o valor terminal e avaliar apenas os 5 anos de projeção explícita para fechar logo.',
            powerDelta: -20,
            botReply: 'Ignorar o valor terminal em uma empresa operacional contínua é um erro financeiro primário! Seus acionistas seriam prejudicados.'
          },
          {
            text: 'Propomos uma estrutura com Earn-out: fixamos o valor base no meio da nossa Região de Preço e condicionamos uma parcela adicional ao atingimento do EBITDA orçado no Ano 3.',
            powerDelta: 10,
            botReply: 'Interessante. Alinhar o risco futuro com um Earn-out nos dá proteção contra desvios de projeção. Estamos perto de um consenso.'
          }
        ]
      },
      {
        roundNumber: 3,
        botMessage: 'Chegamos à rodada final da mesa. Seus argumentos técnicos foram consistentes. Se vocês aceitarem fechar o acordo no valor central da Região de Preço com assinatura imediata do Acordo de Acionistas, assinamos o Term Sheet agora.',
        options: [
          {
            text: 'Negócio fechado! O valor central reflete com exatidão o valor justo econômico equilibrado entre retorno dos investidores e valor para os acionistas fundadores.',
            powerDelta: 15,
            botReply: 'Temos um acordo, colega! Parabéns pela condução impecável da tese financeira.'
          },
          {
            text: 'Só aceito se for pelo valor teto da região de preço, sem concessões.',
            powerDelta: -10,
            botReply: 'Inflexibilidade sem dados adicionais esfria a mesa. Tivemos que assinar com ressalvas de comitê.'
          }
        ]
      }
    ]
  },
  salles: {
    id: 'salles',
    name: 'Beatriz Salles',
    title: 'VP de Fusões & Aquisições @ Grupo NeoEnergia Corporativa',
    avatar: '⚡',
    style: 'Compradora estratégica industrial: busca capturar sinergias operacionais, mas compara agressivamente com múltiplos de mercado recentes.',
    initialOfferDiscount: 0.18,
    rounds: [
      {
        roundNumber: 1,
        botMessage: 'Adoramos o ativo, mas transações recentes no setor elétrico fecharam a um múltiplo de 5,5x EV/EBITDA. O valuation intrínseco de vocês está apontando algo equivalente a 7,2x EV/EBITDA. Como vocês justificam esse prêmio?',
        options: [
          {
            text: 'As transações de 5,5x eram empresas em recuperação judicial e com concessões a vencer. A nossa empresa possui margem EBITDA de 45% (vs 32% dos pares) e contratos regulatórios vigentes por mais 22 anos, justificando plenamente o valuation intrínseco superior.',
            powerDelta: 15,
            botReply: 'Excelente diferenciação! A qualidade do ativo e o prazo remanescente do contrato realmente demandam um prêmio de qualidade.'
          },
          {
            text: 'Podemos baixar o preço imediatamente para 5,5x para igualar a média de mercado.',
            powerDelta: -15,
            botReply: 'Se vocês entregam valor sem defender sua margem superior, fico em dúvida se há passivos ocultos.'
          }
        ]
      },
      {
        roundNumber: 2,
        botMessage: 'Se nós adquirirmos 100% da empresa, vamos capturar sinergias de R$ 15 milhões por ano em despesas administrativas. Quanto dessa sinergia vocês esperam incorporar no preço de fechamento?',
        options: [
          {
            text: 'A literatura e a prática de M&A recomendam uma divisão 50/50 do valor presente das sinergias entre comprador e vendedor, agregando R$ 35M ao Enterprise Value negociado.',
            powerDelta: 15,
            botReply: 'Uma partilha 50/50 é a melhor prática em M&A bilateral. Concordamos com esse acréscimo justo.'
          },
          {
            text: 'As sinergias pertencem 100% a vocês compradores, não queremos nenhum centavo disso.',
            powerDelta: -10,
            botReply: 'Vocês deixaram muito dinheiro na mesa desnecessariamente!'
          }
        ]
      },
      {
        roundNumber: 3,
        botMessage: 'Perfeito. Estamos prontos para fechar a transação no topo da Região de Preço considerando a qualidade das concessões e as sinergias compartilhadas.',
        options: [
          {
            text: 'Acordo selado com excelência estratégica!',
            powerDelta: 15,
            botReply: 'Parabéns! Foi uma das negociações mais técnicas e fundamentadas que já liderei.'
          }
        ]
      }
    ]
  }
};

function getInitialNegotiationState(personaId = 'albrecht', studentPriceRange = null) {
  const persona = NEGOTIATION_PERSONAS[personaId] || NEGOTIATION_PERSONAS.albrecht;
  const centralPrice = studentPriceRange ? studentPriceRange.centralPrice : 350000;
  const initialOffer = Math.round(centralPrice * (1 - persona.initialOfferDiscount));

  return {
    personaId: persona.id,
    personaName: persona.name,
    personaTitle: persona.title,
    personaAvatar: persona.avatar,
    negotiationPower: 50, // Inicia em 50
    currentRoundIndex: 0,
    totalRounds: persona.rounds.length,
    initialOffer,
    currentOffer: initialOffer,
    targetPrice: centralPrice,
    maxPrice: studentPriceRange ? studentPriceRange.maxPrice : 420000,
    minPrice: studentPriceRange ? studentPriceRange.minPrice : 290000,
    history: [
      {
        sender: 'bot',
        text: persona.rounds[0].botMessage,
        offer: initialOffer
      }
    ],
    isCompleted: false,
    dealOutcome: null
  };
}

function processNegotiationChoice(state, optionIndex) {
  const persona = NEGOTIATION_PERSONAS[state.personaId];
  const currentRound = persona.rounds[state.currentRoundIndex];
  const choice = currentRound.options[optionIndex];
  if (!choice) return state;

  const newPower = Math.min(100, Math.max(0, state.negotiationPower + choice.powerDelta));
  
  // Oferta sobe proporcionalmente ao poder de negociação
  const progressRatio = newPower / 100;
  const newOffer = Math.round(state.minPrice + (state.maxPrice - state.minPrice) * progressRatio);

  const newHistory = [
    ...state.history,
    { sender: 'user', text: choice.text },
    { sender: 'bot', text: choice.botReply, offer: newOffer }
  ];

  const nextRoundIndex = state.currentRoundIndex + 1;
  const isCompleted = nextRoundIndex >= persona.rounds.length;

  let dealOutcome = null;
  if (isCompleted) {
    if (newPower >= 75) {
      dealOutcome = { status: 'triumph', title: 'Vitória Extraordinária!', description: 'Você defendeu as premissas com maestria técnica e fechou no patamar superior da Região de Preço.' };
    } else if (newPower >= 45) {
      dealOutcome = { status: 'success', title: 'Acordo Equilibrado Fechado', description: 'Você fechou a transação dentro da margem de valor esperada para os acionistas.' };
    } else {
      dealOutcome = { status: 'weak', title: 'Negócio com Concessões Excessivas', description: 'Você aceitou cortes severos sem embasamento técnico nos dados do valuation.' };
    }
  } else {
    // Adiciona a pergunta da próxima rodada ao histórico
    newHistory.push({
      sender: 'bot',
      text: persona.rounds[nextRoundIndex].botMessage
    });
  }

  return {
    ...state,
    negotiationPower: newPower,
    currentRoundIndex: nextRoundIndex,
    currentOffer: newOffer,
    history: newHistory,
    isCompleted,
    dealOutcome
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NEGOTIATION_PERSONAS,
    getInitialNegotiationState,
    processNegotiationChoice
  };
}
