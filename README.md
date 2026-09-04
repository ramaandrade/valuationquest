# ValuationQuest: A Jornada do Gestor

> **Status do Projeto:** Vers?o 1.0 (Publica??o Final ? Conforme PRD Setembro de 2026)  
> **P?blico-Alvo:** Estudantes iniciantes de Finan?as, Economia e Administra??o; Analistas de M&A e Professores  
> **Origem Te?rica:** Grounded no conte?do do Tema 7 (FCD, M?ltiplos, EVA, MVA e Estudo SAELPA)  
> **Plataforma:** Aplica??o Web SPA responsiva, interativa e gamificada (Zero depend?ncias externas de build)

---

## 1. Introdu??o e Vis?o Geral do Produto

O **ValuationQuest: A Jornada do Gestor** ? uma plataforma web gamificada voltada ao ensino pr?tico e intuitivo de avalia??o de empresas (*valuation*). O processo de valuation ? uma disciplina central em finan?as corporativas, indispens?vel em Fus?es e Aquisi??es (M&A), decis?es de investimento e planejamento estrat?gico.

### A dor que o produto resolve
O ensino tradicional de valuation costuma ser excessivamente te?rico e focado em f?rmulas est?ticas de planilhas. Iniciantes frequentemente enfrentam dificuldades para ligar a matem?tica financeira ? realidade de neg?cios. Este aplicativo transp?e essa barreira atrav?s da metodologia de **valuation consultivo**, transformando c?lculos abstratos em ferramentas din?micas de tomada de decis?o e gest?o de valor estrat?gico.

### Objetivos Estrat?gicos de Aprendizagem
- **Determinar uma Regi?o de Pre?o:** Ensinar ao aluno que o valuation n?o gera um n?mero ?nico e absoluto, mas uma faixa de valor baseada em cen?rios econ?micos operacionais.
- **Dominar a An?lise Intr?nseca (FCD):** Capacitar o aluno a projetar fluxos de caixa operacionais livres e aplicar o custo de capital (WACC) para encontrar o valor intr?nseco.
- **Dominar a An?lise Relativa (M?ltiplos):** Proporcionar o julgamento de mercado ?gil, identificando quais m?ltiplos utilizar (`EV/EBITDA`, `P/L` ou `EV/Receita`) conforme o est?gio da firma.
- **Compreender a Gera??o de Riqueza Real (EVA/MVA):** Ensinar que o lucro cont?bil convencional pode mascarar a destrui??o de valor caso o custo do capital pr?prio n?o seja integralmente remunerado.
- **Vivenciar o Impacto Macroecon?mico:** Simular os efeitos da infla??o na compress?o de margens e na eleva??o da taxa de desconto (WACC).

---

## 2. Estrutura dos M?dulos e Mec?nicas de Gamifica??o

| M?dulo | Desafio Gamificado | Pilar Conceitual |
|---|---|---|
| **Top HUD** | Acompanhamento cont?nuo de carreira | Exibi??o em tempo real de MVA acumulado, EVA da rodada, Spread Econ?mico (ROI vs. WACC) e medalhas conquistadas. |
| **M?dulo I: O Detetive do Fluxo de Caixa** | 10 Passos do FCD | Diagn?stico hist?rico, sliders de premissas e cen?rios, proje??o de 5 anos de FCFF, Valor Terminal perp?tuo, WACC/CAPM, Enterprise Value, D?vida L?quida, Shareholder Value, Matriz 5x5 de Sensibilidade e gr?fico Football Field. |
| **M?dulo II: O Jogo dos M?ltiplos** | M&A Blitz de Alta Velocidade | Associa??o estrat?gica de m?ltiplos (`EV/EBITDA`, `P/L`, `EV/Receita`) aos perfis de Startups SaaS, Ind?stria de Infraestrutura, Farmac?uticas e Concess?es. |
| **M?dulo III: A Crise Econ?mica** | CEO sob Amea?a da Infla??o | Tomada de decis?es de repasse de pre?os, enfrentamento da disparada do WACC, armadilha fiscal da deprecia??o hist?rica e teste da **Regra de Ouro** ($g_{FCF} > \Delta WACC$). |
| **M?dulo IV: Gest?o EVA e MVA** | Aloca??o de Or?amento Anual | Execu??o dos 3 Caminhos Fundamentais de cria??o de valor econ?mico: Aumentar Lucros Operacionais, Otimizar Capital Investido e Projetos de Alto Retorno ($ROI > WACC$). |
| **Chefe de Fase: O Caso Real SAELPA** | Mist?rio Hist?rico (2003?2005) | Par?metros regulat?rios reais da ANEEL ($K_e = 16,22\%$). Desvendar o paradoxo de 2004 (Lucro cont?bil positivo com EVA negativo) e liderar a virada de recupera??o de 2005. |
| **Arena de Negocia??o de M&A** | Mini-chat com IA Conversacional | Defesa t?cnica da Regi?o de Pre?o contra investidores institucionais (*Dr. Paulo Albrecht* de Private Equity e *Beatriz Salles* de M&A Estrat?gico), com medidor de **Poder de Negocia??o** (0 a 100). |
| **Gerador de Laudos de Avalia??o** | Information Memorandum Formal | Emiss?o padronizada de laudo t?cnico com demonstrativo completo, mem?ria de c?lculo e certificado de entrega para download/impress?o em PDF. |

---

## 3. Fundamenta??o Te?rica e F?rmulas Matem?ticas

### 3.1. Custo de Capital Pr?prio (CAPM) e WACC
$$\text{Ke} = K_{rf} + \beta \times (K_m - K_{rf}) + rr$$

$$\text{WACC} = \text{Ke} \times \left(\frac{E}{E+D}\right) + K_d \times (1 - T) \times \left(\frac{D}{E+D}\right)$$

*No caso da SAELPA (ANEEL):* $K_{rf} = 5,06\%$, $K_m = 13,02\%$, $\beta = 0,4448$, $rr = 7,62\% \Rightarrow \mathbf{K_e = 16,22\%}$.

### 3.2. Modelo do Fluxo de Caixa Livre da Firma (FCFF) e Valor Terminal
$$\text{FCFF} = \text{NOPAT} + \text{Deprecia??o} - \text{CapEx} - \Delta\text{NCG}$$

$$\text{Valor Terminal (VT)} = \frac{\text{FCFF}_{n+1}}{\text{WACC} - g}$$

$$\text{Enterprise Value (EV)} = \sum_{t=1}^n \frac{\text{FCFF}_t}{(1+\text{WACC})^t} + \frac{\text{VT}}{(1+\text{WACC})^n}$$

$$\text{Shareholder Value} = \text{Enterprise Value} - \text{D?vida L?quida}$$

### 3.3. Economic Value Added (EVA) e Market Value Added (MVA)
$$\text{EVA} = \text{NOPAT} - (\text{WACC} \times \text{Investimento Total}) = (\text{ROI} - \text{WACC}) \times \text{Investimento Total}$$

$$\text{MVA} = \text{Valor de Mercado da Empresa} - \text{Capital Total Investido}$$

> **O Paradoxo Educativo de 2004:** Uma firma pode reportar lucro cont?bil positivo e, ao mesmo tempo, destruir riqueza econ?mica dos investidores se o retorno sobre o capital investido (ROI) for menor que o custo de oportunidade total (WACC).

---

## 4. Estrutura do C?digo-Fonte

```
valuationquest/
??? index.html                  # Interface SPA principal (HTML5 sem?ntico)
??? package.json                # Metadados e scripts npm (start, test)
??? server.js                   # Servidor HTTP est?tico leve (Node.js nativo)
??? README.md                   # Documenta??o completa
??? css/
?   ??? styles.css              # Design system, HUD e componentes globais
?   ??? modules.css             # Estilos de cada simula??o e arena de negocia??o
?   ??? report.css              # Folha de estilos para emiss?o e impress?o do laudo em PDF
??? js/
?   ??? state.js                # Gerenciador reativo de estado e persist?ncia (LocalStorage)
?   ??? soundFx.js              # Efeitos sonoros procedurais via Web Audio API
?   ??? charts.js               # Renderiza??o de gr?ficos din?micos em Canvas nativo
?   ??? reportGenerator.js      # Compilador e gerador de Laudo de Avalia??o formal
?   ??? app.js                  # Controlador central de interface e eventos
?   ??? engines/
?       ??? dcfEngine.js        # Motor matem?tico do FCD e sensibilidade
?       ??? multiplesEngine.js  # Motor e desafios do Jogo dos M?ltiplos
?       ??? inflationEngine.js  # Motor da crise inflacion?ria e regra de ouro
?       ??? evaMvaEngine.js     # Motor de alavancas de valor EVA/MVA
?       ??? saelpaEngine.js     # Estudo de caso real SAELPA (2003-2005)
?       ??? negotiationEngine.js# Motor conversacional de negocia??o de M&A
??? tests/
    ??? engine.test.js          # Su?te de testes unit?rios com 100% de aprova??o
```

---

## 5. Como Executar e Testar

### 5.1. Execu??o do Servidor Local
N?o requer instala??o de depend?ncias pesadas (`npm install` n?o ? obrigat?rio):

```bash
# Iniciar o servidor HTTP na porta 3355
node server.js
```
Acesse no navegador: **`http://localhost:3355`**

### 5.2. Execu??o da Su?te de Testes Matem?ticos
```bash
# Rodar todos os testes unit?rios de finan?as
node tests/engine.test.js
# ou
npm test
```
Resultados validados:
- C?lculo do CAPM e Ke hist?rico ANEEL (16,22%)
- Pondera??o do WACC e benef?cio fiscal da d?vida
- Perpetuidade de Gordon-Shapiro e valida??o de consist?ncia ($WACC > g$)
- Enterprise Value, D?vida L?quida e Shareholder Value
- Matriz bidimensional de sensibilidade (WACC ? g)
- M?ltiplos relativos (EV/EBITDA, P/L, EV/Receita)
- Paradoxo e dados reais da SAELPA (2003, 2004 e 2005)
- Alavancas de cria??o de valor EVA/MVA e spread econ?mico
- Efeitos macroecon?micos da infla??o e simula??o de negocia??o

---

## 6. Licen?a
Projeto desenvolvido com fins estritamente educacionais para o curso de Finan?as Corporativas e Valuation. Licen?a MIT.
