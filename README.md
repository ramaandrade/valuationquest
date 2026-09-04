# ValuationQuest: A Jornada do Gestor

> **Status do Projeto:** Versão 1.0 (Publicação Final — Conforme PRD Setembro de 2026)  
> **Público-Alvo:** Estudantes iniciantes de Finanças, Economia e Administração; Analistas de M&A e Professores  
> **🌐 Aplicação Online (GitHub Pages):** [https://ramaandrade.github.io/valuationquest/](https://ramaandrade.github.io/valuationquest/)  
> **📁 Repositório no GitHub:** [https://github.com/ramaandrade/valuationquest](https://github.com/ramaandrade/valuationquest)  
> **Origem Teórica:** Grounded no conteúdo do Tema 7 (FCD, Múltiplos, EVA, MVA e Estudo SAELPA)  
> **Plataforma:** Aplicação Web SPA responsiva, interativa e gamificada (Zero dependências externas de build)

---

## 1. Introdução e Visão Geral do Produto

O **ValuationQuest: A Jornada do Gestor** é uma plataforma web gamificada voltada ao ensino prático e intuitivo de avaliação de empresas (*valuation*). O processo de valuation é uma disciplina central em finanças corporativas, indispensável em Fusões e Aquisições (M&A), decisões de investimento e planejamento estratégico.

### A dor que o produto resolve
O ensino tradicional de valuation costuma ser excessivamente teórico e focado em fórmulas estáticas de planilhas. Iniciantes frequentemente enfrentam dificuldades para ligar a matemática financeira à realidade de negócios. Este aplicativo transpõe essa barreira através da metodologia de **valuation consultivo**, transformando cálculos abstratos em ferramentas dinâmicas de tomada de decisão e gestão de valor estratégico.

### Objetivos Estratégicos de Aprendizagem
- **Determinar uma Região de Preço:** Ensinar ao aluno que o valuation não gera um número único e absoluto, mas uma faixa de valor baseada em cenários econômicos operacionais.
- **Dominar a Análise Intrínseca (FCD):** Capacitar o aluno a projetar fluxos de caixa operacionais livres e aplicar o custo de capital (WACC) para encontrar o valor intrínseco.
- **Dominar a Análise Relativa (Múltiplos):** Proporcionar o julgamento de mercado ágil, identificando quais múltiplos utilizar (`EV/EBITDA`, `P/L` ou `EV/Receita`) conforme o estágio da firma.
- **Compreender a Geração de Riqueza Real (EVA/MVA):** Ensinar que o lucro contábil convencional pode mascarar a destruição de valor caso o custo do capital próprio não seja integralmente remunerado.
- **Vivenciar o Impacto Macroeconômico:** Simular os efeitos da inflação na compressão de margens e na elevação da taxa de desconto (WACC).

---

## 2. Estrutura dos Módulos e Mecânicas de Gamificação

| Módulo | Desafio Gamificado | Pilar Conceitual |
|---|---|---|
| **Top HUD** | Acompanhamento contínuo de carreira | Exibição em tempo real de MVA acumulado, EVA da rodada, Spread Econômico (ROI vs. WACC) e medalhas conquistadas. |
| **Módulo I: O Detetive do Fluxo de Caixa** | 10 Passos do FCD | Diagnóstico histórico, sliders de premissas e cenários, projeção de 5 anos de FCFF, Valor Terminal perpétuo, WACC/CAPM, Enterprise Value, Dívida Líquida, Shareholder Value, Matriz 5x5 de Sensibilidade e gráfico Football Field. |
| **Módulo II: O Jogo dos Múltiplos** | M&A Blitz de Alta Velocidade | Associação estratégica de múltiplos (`EV/EBITDA`, `P/L`, `EV/Receita`) aos perfis de Startups SaaS, Indústria de Infraestrutura, Farmacêuticas e Concessões. |
| **Módulo III: A Crise Econômica** | CEO sob Ameaça da Inflação | Tomada de decisões de repasse de preços, enfrentamento da disparada do WACC, armadilha fiscal da depreciação histórica e teste da **Regra de Ouro** ($g_{FCF} > \Delta WACC$). |
| **Módulo IV: Gestão EVA e MVA** | Alocação de Orçamento Anual | Execução dos 3 Caminhos Fundamentais de criação de valor econômico: Aumentar Lucros Operacionais, Otimizar Capital Investido e Projetos de Alto Retorno ($ROI > WACC$). |
| **Chefe de Fase: O Caso Real SAELPA** | Mistério Histórico (2003–2005) | Parâmetros regulatórios reais da ANEEL ($K_e = 16,22\%$). Desvendar o paradoxo de 2004 (Lucro contábil positivo com EVA negativo) e liderar a virada de recuperação de 2005. |
| **Arena de Negociação de M&A** | Mini-chat com IA Conversacional | Defesa técnica da Região de Preço contra investidores institucionais (*Dr. Paulo Albrecht* de Private Equity e *Beatriz Salles* de M&A Estratégico), com medidor de **Poder de Negociação** (0 a 100). |
| **Gerador de Laudos de Avaliação** | Information Memorandum Formal | Emissão padronizada de laudo técnico com demonstrativo completo, memória de cálculo e certificado de entrega para download/impressão em PDF. |

---

## 3. Fundamentação Teórica e Fórmulas Matemáticas

### 3.1. Custo de Capital Próprio (CAPM) e WACC
$$\text{Ke} = K_{rf} + \beta \times (K_m - K_{rf}) + rr$$

$$\text{WACC} = \text{Ke} \times \left(\frac{E}{E+D}\right) + K_d \times (1 - T) \times \left(\frac{D}{E+D}\right)$$

*No caso da SAELPA (ANEEL):* $K_{rf} = 5,06\%$, $K_m = 13,02\%$, $\beta = 0,4448$, $rr = 7,62\% \Rightarrow \mathbf{K_e = 16,22\%}$.

### 3.2. Modelo do Fluxo de Caixa Livre da Firma (FCFF) e Valor Terminal
$$\text{FCFF} = \text{NOPAT} + \text{Depreciação} - \text{CapEx} - \Delta\text{NCG}$$

$$\text{Valor Terminal (VT)} = \frac{\text{FCFF}_{n+1}}{\text{WACC} - g}$$

$$\text{Enterprise Value (EV)} = \sum_{t=1}^n \frac{\text{FCFF}_t}{(1+\text{WACC})^t} + \frac{\text{VT}}{(1+\text{WACC})^n}$$

$$\text{Shareholder Value} = \text{Enterprise Value} - \text{Dívida Líquida}$$

### 3.3. Economic Value Added (EVA) e Market Value Added (MVA)
$$\text{EVA} = \text{NOPAT} - (\text{WACC} \times \text{Investimento Total}) = (\text{ROI} - \text{WACC}) \times \text{Investimento Total}$$

$$\text{MVA} = \text{Valor de Mercado da Empresa} - \text{Capital Total Investido}$$

> **O Paradoxo Educativo de 2004:** Uma firma pode reportar lucro contábil positivo e, ao mesmo tempo, destruir riqueza econômica dos investidores se o retorno sobre o capital investido (ROI) for menor que o custo de oportunidade total (WACC).

---

## 4. Estrutura do Código-Fonte

```
valuationquest/
├── index.html                  # Interface SPA principal (HTML5 semântico)
├── package.json                # Metadados e scripts npm (start, test)
├── server.js                   # Servidor HTTP estático leve (Node.js nativo)
├── README.md                   # Documentação completa
├── css/
│   ├── styles.css              # Design system, HUD e componentes globais
│   ├── modules.css             # Estilos de cada simulação e arena de negociação
│   └── report.css              # Folha de estilos para emissão e impressão do laudo em PDF
├── js/
│   ├── state.js                # Gerenciador reativo de estado e persistência (LocalStorage)
│   ├── soundFx.js              # Efeitos sonoros procedurais via Web Audio API
│   ├── charts.js               # Renderização de gráficos dinâmicos em Canvas nativo
│   ├── reportGenerator.js      # Compilador e gerador de Laudo de Avaliação formal
│   ├── app.js                  # Controlador central de interface e eventos
│   └── engines/
│       ├── dcfEngine.js        # Motor matemático do FCD e sensibilidade
│       ├── multiplesEngine.js  # Motor e desafios do Jogo dos Múltiplos
│       ├── inflationEngine.js  # Motor da crise inflacionária e regra de ouro
│       ├── evaMvaEngine.js     # Motor de alavancas de valor EVA/MVA
│       ├── saelpaEngine.js     # Estudo de caso real SAELPA (2003-2005)
│       └── negotiationEngine.js# Motor conversacional de negociação de M&A
└── tests/
    └── engine.test.js          # Suíte de testes unitários com 100% de aprovação
```

---

## 5. Como Executar e Testar

### 5.1. Execução do Servidor Local
Não requer instalação de dependências pesadas (`npm install` não é obrigatório):

```bash
# Iniciar o servidor HTTP na porta 3355
node server.js
```
Acesse no navegador: **`http://localhost:3355`**

### 5.2. Execução da Suíte de Testes Matemáticos
```bash
# Rodar todos os testes unitários de finanças
node tests/engine.test.js
# ou
npm test
```
Resultados validados:
- Cálculo do CAPM e Ke histórico ANEEL (16,22%)
- Ponderação do WACC e benefício fiscal da dívida
- Perpetuidade de Gordon-Shapiro e validação de consistência ($WACC > g$)
- Enterprise Value, Dívida Líquida e Shareholder Value
- Matriz bidimensional de sensibilidade (WACC × g)
- Múltiplos relativos (EV/EBITDA, P/L, EV/Receita)
- Paradoxo e dados reais da SAELPA (2003, 2004 e 2005)
- Alavancas de criação de valor EVA/MVA e spread econômico
- Efeitos macroeconômicos da inflação e simulação de negociação

---

## 6. Licença
Projeto desenvolvido com fins estritamente educacionais para o curso de Finanças Corporativas e Valuation. Licença MIT.
