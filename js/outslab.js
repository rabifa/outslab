// Estado do Jogo
let gameState = {
  level: null,
  timer: null,
  score: 0,
  currentQuestion: 1,
  totalQuestions: 10,
  correct: 0,
  wrong: 0,
  skipped: 0,
  timeLeft: 0,
  timerInterval: null,
  currentSituation: null,
};

// Naipes e Valores
const suits = ["♠", "♥", "♦", "♣"];
const values = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

// Seleção de Nível
function selectLevel(level) {
  gameState.level = level;
  document.querySelectorAll(".level-card").forEach((card) => {
    card.classList.remove("ring-4", "ring-white");
  });
  event.currentTarget.classList.add("ring-4", "ring-white");
  checkCanStart();
}

// Seleção de Timer
function selectTimer(time) {
  gameState.timer = time;
  document.querySelectorAll(".timer-option").forEach((option) => {
    option.classList.remove("ring-4", "ring-blue-500");
  });
  event.currentTarget.classList.add("ring-4", "ring-blue-500");
  checkCanStart();
}

// Verificar se pode iniciar
function checkCanStart() {
  const startButton = document.getElementById("startButton");
  if (gameState.level && gameState.timer !== null) {
    startButton.disabled = false;
  }
}

// Iniciar Jogo
function startGame() {
  document.getElementById("menuScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");

  // Reset
  gameState.score = 0;
  gameState.currentQuestion = 1;
  gameState.correct = 0;
  gameState.wrong = 0;
  gameState.skipped = 0;

  updateDisplay();
  generateSituation();
}

// Gerar Situação
function generateSituation() {
  const situation = createSituation(gameState.level);
  gameState.currentSituation = situation;

  displaySituation(situation);
  startTimer();

  // Limpar inputs
  document.getElementById("outsInput").value = "";
  document.getElementById("potOddsInput").value = "";
  document.getElementById("feedback").classList.add("hidden");
  document.getElementById("outsInput").value = "";
  document.getElementById("potOddsInput").value = "";
  document.getElementById("equityInput").value = ""; // ADICIONAR ESTA LINHA
  document.getElementById("feedback").classList.add("hidden");
}

// Calcular Equity baseado nos Outs
function calculateEquity(outs, street) {
  if (street === "flop") {
    // Flop para River (2 cartas): Regra de 4
    // Mais precisa: Outs * 4 - (Outs - 8) se Outs > 8
    if (outs > 8) {
      return parseFloat((outs * 4 - (outs - 8)).toFixed(1));
    }
    return parseFloat((outs * 4).toFixed(1));
  } else if (street === "turn") {
    // Turn para River (1 carta): Regra de 2
    return parseFloat((outs * 2).toFixed(1));
  }
  return 0;
}

// Criar Situação baseada no nível
function createSituation(level) {
  let situation = {
    holeCards: [],
    board: [],
    pot: 0,
    bet: 0,
    players: 2,
    street: "flop",
    correctOuts: 0,
    correctPotOdds: 0,
    description: "",
    drawType: "",
    impliedOdds: false,
    effectiveStack: 0,
  };

  if (level === 1) {
    situation = generateBeginnerSituation();
  } else if (level === 2) {
    situation = generateIntermediateSituation();
  } else if (level === 3) {
    situation = generateAdvancedSituation();
  }

  return situation;
}

// Nível 1: Iniciante
function generateBeginnerSituation() {
  const drawTypes = ["flush", "straightOESD"];
  const drawType = drawTypes[Math.floor(Math.random() * drawTypes.length)];

  let situation = {
    holeCards: [],
    board: [],
    pot: Math.floor(Math.random() * 5 + 1) * 100,
    players: 2,
    street: "flop",
    impliedOdds: false,
  };

  situation.bet =
    Math.floor((situation.pot * (0.5 + Math.random() * 0.5)) / 50) * 50;

  if (drawType === "flush") {
    situation = generateFlushDraw(situation);
    situation.correctOuts = 9;
    situation.correctEquity = calculateEquity(9, situation.street);
    situation.drawType = "Flush Draw";
  } else {
    situation = generateOESD(situation);
    situation.correctOuts = 8;
    situation.correctEquity = calculateEquity(8, situation.street);
    situation.drawType = "Open-Ended Straight Draw";
  }

  situation.correctPotOdds = calculatePotOdds(situation.pot, situation.bet);
  situation.description = `Você está no ${situation.street.toUpperCase()} com um ${
    situation.drawType
  }`;

  return situation;
}

// Nível 2: Intermediário
function generateIntermediateSituation() {
  const drawTypes = ["comboFlushOESD", "flushGutshot", "doubleGutshot"];
  const drawType = drawTypes[Math.floor(Math.random() * drawTypes.length)];

  let situation = {
    holeCards: [],
    board: [],
    pot: Math.floor(Math.random() * 150 + 75),
    players: 2,
    street: "flop",
    impliedOdds: false,
  };

  situation.bet = Math.floor(situation.pot * (0.4 + Math.random() * 0.7));

  if (drawType === "comboFlushOESD") {
    situation = generateComboFlushOESD(situation);
    situation.correctOuts = 15;
    situation.correctEquity = calculateEquity(15, situation.street);
    situation.drawType = "Combo Draw (Flush + Straight)";
  } else if (drawType === "flushGutshot") {
    situation = generateFlushGutshot(situation);
    situation.correctOuts = 12;
    situation.correctEquity = calculateEquity(12, situation.street);
    situation.drawType = "Flush Draw + Gutshot";
  } else {
    situation = generateDoubleGutshot(situation);
    situation.correctOuts = 8;
    situation.correctEquity = calculateEquity(8, situation.street);
    situation.drawType = "Double Gutshot";
  }

  situation.correctPotOdds = calculatePotOdds(situation.pot, situation.bet);
  situation.description = `Você está no ${situation.street.toUpperCase()} com ${
    situation.drawType
  }`;

  return situation;
}

// Nível 3: Avançado
function generateAdvancedSituation() {
  const scenarios = ["backdoor", "implied", "multiway"];
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  let situation = {
    holeCards: [],
    board: [],
    pot: Math.floor(Math.random() * 200 + 100),
    players: 2,
    street: "flop",
    impliedOdds: false,
  };

  if (scenario === "backdoor") {
    situation = generateBackdoorDraw(situation);
    situation.correctEquity = calculateEquity(
      situation.correctOuts,
      situation.street
    );
    situation.description = `${situation.street.toUpperCase()} com Backdoor Draw`;
  } else if (scenario === "implied") {
    situation.impliedOdds = true;
    situation.effectiveStack = Math.floor(
      situation.pot * (3 + Math.random() * 4)
    );
    situation = generateFlushDraw(situation);
    situation.correctOuts = 9;
    situation.correctEquity = calculateEquity(9, situation.street);
    situation.drawType = "Flush Draw";
    situation.description = `${situation.street.toUpperCase()} com ${
      situation.drawType
    } e Implied Odds`;
  } else {
    situation.players = Math.floor(Math.random() * 2) + 3;
    situation = generateFlushDraw(situation);
    situation.correctOuts = 9;
    situation.correctEquity = calculateEquity(9, situation.street);
    situation.drawType = "Flush Draw";
    situation.description = `${situation.street.toUpperCase()} Multiway (${
      situation.players
    } jogadores)`;
  }

  situation.bet = Math.floor(situation.pot * (0.3 + Math.random() * 0.8));
  situation.correctPotOdds = calculatePotOdds(situation.pot, situation.bet);

  return situation;
}

// Gerar Flush Draw
function generateFlushDraw(situation) {
  const flushSuit = suits[Math.floor(Math.random() * 4)];
  const otherSuits = suits.filter((s) => s !== flushSuit);

  // 2 cartas do mesmo naipe na mão
  situation.holeCards = [
    { value: values[Math.floor(Math.random() * 13)], suit: flushSuit },
    { value: values[Math.floor(Math.random() * 13)], suit: flushSuit },
  ];

  // 2 cartas do mesmo naipe no board
  situation.board = [
    { value: values[Math.floor(Math.random() * 13)], suit: flushSuit },
    { value: values[Math.floor(Math.random() * 13)], suit: flushSuit },
    { value: values[Math.floor(Math.random() * 13)], suit: otherSuits[0] },
  ];

  return situation;
}

// Gerar OESD (Open-Ended Straight Draw)
function generateOESD(situation) {
  // Para ter OESD, precisamos de 4 cartas consecutivas
  // Limite: não pode começar acima de 9 (para garantir 4 cartas consecutivas sem ultrapassar o Ás)
  // Valores possíveis: 2-3-4-5, 3-4-5-6, ... até 9-10-J-Q
  const startValue = Math.floor(Math.random() * 9); // 0 a 8 (2 a T no array values)

  // Garante que temos 4 cartas consecutivas válidas
  if (startValue + 3 >= values.length) {
    return generateOESD(situation); // Retry se inválido
  }

  // Distribuir as 4 cartas: 2 na mão + 2 no board
  // Exemplo: Se startValue = 3 (valor '5'), teremos 5-6-7-8
  // Hole cards: 5-6
  // Board: 7-8-X (onde X é carta aleatória que não completa)

  const usedValues = [
    values[startValue],
    values[startValue + 1],
    values[startValue + 2],
    values[startValue + 3],
  ];

  situation.holeCards = [
    { value: usedValues[0], suit: suits[Math.floor(Math.random() * 4)] },
    { value: usedValues[1], suit: suits[Math.floor(Math.random() * 4)] },
  ];

  situation.board = [
    { value: usedValues[2], suit: suits[Math.floor(Math.random() * 4)] },
    { value: usedValues[3], suit: suits[Math.floor(Math.random() * 4)] },
    // Terceira carta do board: não pode ser carta que completa o straight
    {
      value: getRandomNonCompletingCard(startValue),
      suit: suits[Math.floor(Math.random() * 4)],
    },
  ];

  return situation;
}

// Função auxiliar para pegar carta que não completa o straight
function getRandomNonCompletingCard(startValue) {
  // Cartas que completariam: startValue-1 e startValue+4
  const avoidValues = [];

  if (startValue > 0) {
    avoidValues.push(values[startValue - 1]);
  }
  if (startValue + 4 < values.length) {
    avoidValues.push(values[startValue + 4]);
  }

  // Também evitar as cartas já usadas
  avoidValues.push(
    values[startValue],
    values[startValue + 1],
    values[startValue + 2],
    values[startValue + 3]
  );

  const availableValues = values.filter((v) => !avoidValues.includes(v));

  if (availableValues.length === 0) {
    return values[0]; // Fallback
  }

  return availableValues[Math.floor(Math.random() * availableValues.length)];
}

// Gerar Combo Draw
function generateComboFlushOESD(situation) {
  const flushSuit = suits[Math.floor(Math.random() * 4)];
  const startValue = Math.floor(Math.random() * 7) + 3;

  situation.holeCards = [
    { value: values[startValue], suit: flushSuit },
    { value: values[startValue + 1], suit: flushSuit },
  ];

  situation.board = [
    { value: values[startValue + 2], suit: flushSuit },
    { value: values[startValue + 3], suit: flushSuit },
    {
      value: values[Math.floor(Math.random() * 13)],
      suit: suits.filter((s) => s !== flushSuit)[0],
    },
  ];

  return situation;
}

// Gerar Flush + Gutshot
function generateFlushGutshot(situation) {
  const flushSuit = suits[Math.floor(Math.random() * 4)];

  situation.holeCards = [
    { value: values[5], suit: flushSuit },
    { value: values[6], suit: flushSuit },
  ];

  situation.board = [
    { value: values[8], suit: flushSuit },
    { value: values[9], suit: flushSuit },
    { value: values[2], suit: suits.filter((s) => s !== flushSuit)[0] },
  ];

  return situation;
}

// Gerar Double Gutshot
function generateDoubleGutshot(situation) {
  situation.holeCards = [
    { value: values[5], suit: suits[0] },
    { value: values[6], suit: suits[1] },
  ];

  situation.board = [
    { value: values[4], suit: suits[2] },
    { value: values[8], suit: suits[3] },
    { value: values[2], suit: suits[0] },
  ];

  return situation;
}

// Gerar Backdoor Draw
function generateBackdoorDraw(situation) {
  const flushSuit = suits[Math.floor(Math.random() * 4)];

  situation.holeCards = [
    { value: values[Math.floor(Math.random() * 13)], suit: flushSuit },
    { value: values[Math.floor(Math.random() * 13)], suit: flushSuit },
  ];

  situation.board = [
    { value: values[Math.floor(Math.random() * 13)], suit: flushSuit },
    {
      value: values[Math.floor(Math.random() * 13)],
      suit: suits.filter((s) => s !== flushSuit)[0],
    },
    {
      value: values[Math.floor(Math.random() * 13)],
      suit: suits.filter((s) => s !== flushSuit)[1],
    },
  ];

  situation.correctOuts = 4; // Aproximado para backdoor flush
  situation.drawType = "Backdoor Flush Draw";

  return situation;
}

// Calcular Pot Odds
function calculatePotOdds(pot, bet) {
  const totalPot = pot + bet;
  const odds = (bet / totalPot) * 100;
  return parseFloat(odds.toFixed(1));
}

// Exibir Situação
// Exibir Situação
function displaySituation(situation) {
  // Descrição
  document.getElementById("situationDescription").textContent =
    situation.description;

  // Street Indicator
  document.getElementById("streetIndicator").textContent =
    situation.street.toUpperCase();

  // Cartas da mão
  const holeCardsDiv = document.getElementById("holeCards");
  holeCardsDiv.innerHTML = "";
  situation.holeCards.forEach((card) => {
    holeCardsDiv.innerHTML += createCardHTML(card);
  });

  // Cartas da mesa
  const boardCardsDiv = document.getElementById("boardCards");
  boardCardsDiv.innerHTML = "";
  situation.board.forEach((card) => {
    boardCardsDiv.innerHTML += createCardHTML(card);
  });

  // Valores
  document.getElementById("potValue").textContent = `$${situation.pot}`;
  document.getElementById("potValueInfo").textContent = `$${situation.pot}`;
  document.getElementById("betValue").textContent = `$${situation.bet}`;
  document.getElementById("playersCount").textContent = situation.players;

  // Mostrar/Esconder informações avançadas
  const playersInfoDiv = document.getElementById("playersInfo");
  const impliedInfoDiv = document.getElementById("impliedInfo");

  if (situation.players > 2) {
    playersInfoDiv.classList.remove("hidden");
  } else {
    playersInfoDiv.classList.add("hidden");
  }

  if (situation.impliedOdds) {
    impliedInfoDiv.classList.remove("hidden");
    document.getElementById(
      "stackValue"
    ).textContent = `$${situation.effectiveStack}`;
  } else {
    impliedInfoDiv.classList.add("hidden");
  }
}

// Criar HTML da Carta
// Criar HTML da Carta
function createCardHTML(card) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  const colorClass = isRed ? "red" : "black";
  return `
        <div class="card ${colorClass}" style="box-shadow: 0 8px 16px rgba(0,0,0,0.4);">
            <div style="font-size: 1.8rem; line-height: 1;">${card.value}</div>
            <div class="text-3xl" style="line-height: 1; margin-top: -5px;">${card.suit}</div>
        </div>
    `;
}

// Timer
function startTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  if (gameState.timer === "unlimited") {
    document.getElementById("timeLeft").textContent = "∞";
    return;
  }

  gameState.timeLeft = gameState.timer;
  updateTimerDisplay();

  gameState.timerInterval = setInterval(() => {
    gameState.timeLeft--;
    updateTimerDisplay();

    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timerInterval);
      timeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const display = document.getElementById("timeLeft");
  display.textContent = gameState.timeLeft + "s";

  if (gameState.timeLeft <= 5) {
    display.classList.add("timer-warning", "text-red-500");
  } else {
    display.classList.remove("timer-warning", "text-red-500");
  }
}

function timeUp() {
  showFeedback(
    false,
    "Tempo esgotado!",
    "O tempo acabou antes de você responder."
  );
  gameState.wrong++;
  setTimeout(() => {
    nextQuestion();
  }, 3000);
}

// Submeter Resposta
function submitAnswer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  const outsAnswer = parseInt(document.getElementById("outsInput").value);
  const potOddsAnswer = parseFloat(
    document.getElementById("potOddsInput").value
  );
  const equityAnswer = parseFloat(document.getElementById("equityInput").value);

  if (isNaN(outsAnswer) || isNaN(potOddsAnswer) || isNaN(equityAnswer)) {
    alert("Por favor, preencha todos os campos!");
    return;
  }

  const situation = gameState.currentSituation;

  // Tolerância de 10% para pot odds e equity
  const potOddsTolerance = situation.correctPotOdds * 0.1;
  const equityTolerance = situation.correctEquity * 0.1;

  const outsCorrect = outsAnswer === situation.correctOuts;
  const potOddsCorrect =
    Math.abs(potOddsAnswer - situation.correctPotOdds) <= potOddsTolerance;
  const equityCorrect =
    Math.abs(equityAnswer - situation.correctEquity) <= equityTolerance;

  const isCorrect = outsCorrect && potOddsCorrect && equityCorrect;

  if (isCorrect) {
    gameState.correct++;
    gameState.score += 100;
    showFeedback(
      true,
      "Correto! 🎉",
      `Outs: ${situation.correctOuts} | Pot Odds: ${situation.correctPotOdds}% | Equity: ${situation.correctEquity}%`
    );
  } else {
    gameState.wrong++;
    let message = "";
    if (!outsCorrect) message += `Outs: ${situation.correctOuts}. `;
    if (!potOddsCorrect) message += `Pot Odds: ${situation.correctPotOdds}%. `;
    if (!equityCorrect) message += `Equity: ${situation.correctEquity}%. `;
    showFeedback(false, "Incorreto", message);
  }

  updateDisplay();
  setTimeout(() => {
    nextQuestion();
  }, 3000);
}

// Pular Questão
function skipQuestion() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  gameState.skipped++;
  const situation = gameState.currentSituation;
  showFeedback(
    false,
    "Questão Pulada",
    `Resposta: ${situation.correctOuts} outs | ${situation.correctPotOdds}% pot odds | ${situation.correctEquity}% equity`
  );

  setTimeout(() => {
    nextQuestion();
  }, 2000);
}

// Próxima Questão
function nextQuestion() {
  if (gameState.currentQuestion >= gameState.totalQuestions) {
    endGame();
  } else {
    gameState.currentQuestion++;
    updateDisplay();
    generateSituation();
  }
}

// Mostrar Feedback
function showFeedback(isCorrect, title, message) {
  const feedbackDiv = document.getElementById("feedback");
  const bgColor = isCorrect ? "bg-green-600" : "bg-red-600";

  feedbackDiv.className = `mt-6 p-6 rounded-2xl ${bgColor}`;
  feedbackDiv.innerHTML = `
                <div class="text-2xl font-bold mb-2">${title}</div>
                <div class="text-lg">${message}</div>
            `;
  feedbackDiv.classList.remove("hidden");
}

// Atualizar Display
function updateDisplay() {
  document.getElementById("score").textContent = gameState.score;
  document.getElementById(
    "questionCounter"
  ).textContent = `${gameState.currentQuestion}/${gameState.totalQuestions}`;
}

// Finalizar Jogo
function endGame() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  document.getElementById("gameScreen").classList.add("hidden");
  document.getElementById("resultScreen").classList.remove("hidden");

  document.getElementById("finalScore").textContent = gameState.score;
  document.getElementById("correctAnswers").textContent = gameState.correct;
  document.getElementById("wrongAnswers").textContent = gameState.wrong;
  document.getElementById("skippedAnswers").textContent = gameState.skipped;

  const percentage = (gameState.correct / gameState.totalQuestions) * 100;
  let emoji = "🎉";
  let message = "";

  if (percentage >= 90) {
    emoji = "🏆";
    message = "Performance excepcional! Você domina o cálculo de outs!";
  } else if (percentage >= 70) {
    emoji = "🎯";
    message = "Ótimo trabalho! Continue praticando!";
  } else if (percentage >= 50) {
    emoji = "👍";
    message = "Bom desempenho! Você está no caminho certo!";
  } else {
    emoji = "📚";
    message = "Continue estudando! A prática leva à perfeição!";
  }

  document.getElementById("resultEmoji").textContent = emoji;
  document.getElementById("finalMessage").textContent = message;
}

// Sair do Jogo
function quitGame() {
  if (confirm("Tem certeza que deseja sair? Seu progresso será perdido.")) {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
    }
    returnToMenu();
  }
}

// Voltar ao Menu
function returnToMenu() {
  document.getElementById("gameScreen").classList.add("hidden");
  document.getElementById("resultScreen").classList.add("hidden");
  document.getElementById("menuScreen").classList.remove("hidden");

  // Reset seleções
  document.querySelectorAll(".level-card").forEach((card) => {
    card.classList.remove("ring-4", "ring-white");
  });
  document.querySelectorAll(".timer-option").forEach((option) => {
    option.classList.remove("ring-4", "ring-blue-500");
  });

  gameState.level = null;
  gameState.timer = null;
  document.getElementById("startButton").disabled = true;
}

// Atalhos de Teclado
document.addEventListener("keypress", (e) => {
  if (
    e.key === "Enter" &&
    !document.getElementById("gameScreen").classList.contains("hidden")
  ) {
    submitAnswer();
  }
});
