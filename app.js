const games = {
  binary: {
    title: "Hit & Blow 探索",
    label: "候補削減 / 制約探索",
    score: "得点",
    init: initBinary,
    description: "判定結果から候補を絞る数字推理です。",
    settings: [
      { key: "level", label: "桁数", options: [
        { value: "three", label: "3桁", description: "短く推理しやすい基本問題。" },
        { value: "four", label: "4桁", description: "候補が増えて本格的になります。" },
        { value: "five", label: "5桁", description: "候補削減をかなり意識する難問。" }
      ] }
    ]
  },
  cargo: {
    title: "スタック & キュー",
    label: "LIFO / FIFO",
    score: "操作 / ミス",
    init: initCargo,
    description: "StackとQueueを使い分け、指定順に数字を取り出します。",
    settings: [
      { key: "level", label: "難易度", options: [
        { value: "easy", label: "やさしい", description: "6個の数字で基本を確認。" },
        { value: "normal", label: "ふつう", description: "8個の数字で少し先読み。" },
        { value: "hard", label: "むずかしい", description: "10個の数字で読み切りが必要。" }
      ] },
      { key: "mode", label: "モード", options: [
        { value: "normal", label: "通常", description: "すべてのデータが見える基本モード。" },
        { value: "capacity", label: "容量制限", description: "StackとQueueに3個までしか置けません。" },
        { value: "preview", label: "先読み制限", description: "次の3個だけ見えるモード。" }
      ] }
    ]
  },
  hanoi: {
    title: "川渡ゲーム",
    label: "状態探索 / BFS",
    score: "手数",
    init: initRiver,
    description: "船を操縦できる人と制約を考えて全員を対岸へ運びます。",
    settings: [
      { key: "level", label: "難易度", options: [
        { value: "easy", label: "やさしい", description: "農夫・狼・ヤギ・キャベツ。" },
        { value: "normal", label: "ふつう", description: "宣教師と人食い人の定番問題。" },
        { value: "hard", label: "むずかしい", description: "家族・メイド・犬の複雑な制約。" }
      ] }
    ]
  },
  coloring: {
    title: "グラフ塗り分け",
    label: "グラフ理論 / 四色定理",
    score: "衝突",
    init: initColoring,
    description: "隣り合う頂点が同じ色にならないように塗ります。",
    settings: [
      { key: "level", label: "難易度", options: [
        { value: "easy", label: "やさしい", description: "頂点が少なく、4色使える入門ステージ。" },
        { value: "normal", label: "ふつう", description: "3色で塗り分ける中級ステージ。" },
        { value: "hard", label: "むずかしい", description: "頂点と辺が多い高密度ステージ。" }
      ] }
    ]
  },
  maze: {
    title: "迷路設計",
    label: "BFS / DFS / A*",
    score: "探索数",
    init: initMaze,
    description: "壁を置いて、BFSで解ける迷路を設計します。",
    settings: []
  }
};

const colors = ["#5d95d6", "#f0b84b", "#e4667b", "#15996f"];
const views = {
  select: document.querySelector("#selectView"),
  settings: document.querySelector("#settingsView"),
  play: document.querySelector("#playView")
};
const area = document.querySelector("#gameArea");
const message = document.querySelector("#message");
const title = document.querySelector("#gameTitle");
const label = document.querySelector("#modeLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const scoreValue = document.querySelector("#scoreValue");
const settingsTitle = document.querySelector("#settingsTitle");
const settingsLabel = document.querySelector("#settingsLabel");
const settingsMessage = document.querySelector("#settingsMessage");
const settingsArea = document.querySelector("#settingsArea");
let currentGame = "binary";
let selectedSettings = {};
let cleanup = () => {};

document.querySelectorAll(".game-card").forEach((button) => {
  button.addEventListener("click", () => openSettings(button.dataset.game));
});

document.querySelector("#resetGame").addEventListener("click", () => {
  if (views.play.classList.contains("active")) startGame();
});
document.querySelector("#backToSelect").addEventListener("click", showSelect);
document.querySelector("#backToSettings").addEventListener("click", () => openSettings(currentGame));
document.querySelector("#backToGames").addEventListener("click", showSelect);
document.querySelector("#startGame").addEventListener("click", startGame);

function showView(name) {
  Object.entries(views).forEach(([key, view]) => view.classList.toggle("active", key === name));
}

function showSelect() {
  cleanup();
  cleanup = () => {};
  area.innerHTML = "";
  showView("select");
}

function openSettings(key) {
  cleanup();
  cleanup = () => {};
  currentGame = key;
  const game = games[key];
  settingsTitle.textContent = game.title;
  settingsLabel.textContent = game.label;
  settingsMessage.textContent = game.description;
  if (!selectedSettings[key]) selectedSettings[key] = defaultSettings(game);
  renderSettings(game);
  showView("settings");
}

function defaultSettings(game) {
  const values = {};
  game.settings.forEach((group) => {
    values[group.key] = group.options[0].value;
  });
  return values;
}

function renderSettings(game) {
  settingsArea.innerHTML = "";
  const values = selectedSettings[currentGame];
  if (!game.settings.length) {
    settingsArea.append(element("div", "rule-note", "このゲームには追加設定はありません。そのまま開始できます。"));
    return;
  }
  game.settings.forEach((group) => {
    const section = element("section", "setting-group");
    section.append(element("h3", "", group.label));
    const options = element("div", "setting-options");
    group.options.forEach((option) => {
      const button = element("button", "setting-option");
      button.dataset.value = option.value;
      button.innerHTML = "<strong>" + option.label + "</strong><span>" + option.description + "</span>";
      button.classList.toggle("active", values[group.key] === option.value);
      button.addEventListener("click", () => {
        values[group.key] = option.value;
        renderSettings(game);
      });
      options.append(button);
    });
    section.append(options);
    settingsArea.append(section);
  });
}

function startGame() {
  cleanup();
  const game = games[currentGame];
  title.textContent = game.title;
  label.textContent = game.label;
  scoreLabel.textContent = game.score;
  scoreValue.textContent = "0";
  message.textContent = "";
  area.innerHTML = "";
  showView("play");
  cleanup = game.init({ ...(selectedSettings[currentGame] || {}) });
}

function setMessage(text) {
  message.textContent = text;
}

function setScore(value) {
  scoreValue.textContent = value;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function initBinary(options = {}) {
  const levels = {
    three: { name: "3桁", digits: 3 },
    four: { name: "4桁", digits: 4 },
    five: { name: "5桁", digits: 5 }
  };
  let levelKey = options.level || "three";
  let secret = "";
  let candidates = [];
  let history = [];
  let attempts = 0;
  let finished = false;

  const panel = element("div", "binary-panel");
  const status = element("div", "binary-status");
  const digitBox = element("div", "binary-stat");
  const candidateBox = element("div", "binary-stat");
  const attemptBox = element("div", "binary-stat");
  status.append(digitBox, candidateBox, attemptBox);

  const controls = element("div", "controls binary-controls");
  const input = element("input", "binary-input");
  input.type = "text";
  input.inputMode = "numeric";
  input.autocomplete = "off";
  const guess = element("button", "tool-button primary", "判定");
  const retry = element("button", "tool-button", "やり直し");
  controls.append(input, guess, retry);

  const historyPanel = element("div", "binary-history");
  const historyTitle = element("h3", "", "推理履歴");
  const historyList = element("div", "hit-history-list");
  historyPanel.append(historyTitle, historyList);
  panel.append(status, controls);
  area.append(panel, historyPanel);

  function startLevel(key) {
    levelKey = key;
    const level = levels[levelKey];
    candidates = generateHitBlowCandidates(level.digits);
    secret = candidates[Math.floor(Math.random() * candidates.length)];
    history = [];
    attempts = 0;
    finished = false;
    input.value = "";
    input.placeholder = "0".repeat(level.digits);
    input.maxLength = level.digits;
    input.disabled = false;
    guess.disabled = false;
    setScore("0");
    setMessage(level.digits + "桁の数字を推理しよう。数字は重複なしです。");
    render();
  }

  function render() {
    const level = levels[levelKey];
    digitBox.innerHTML = "<span>難易度</span><strong>" + level.digits + "桁</strong>";
    candidateBox.innerHTML = "<span>残り候補</span><strong>" + candidates.length + "</strong>";
    attemptBox.innerHTML = "<span>手数</span><strong>" + attempts + "</strong>";
    historyList.innerHTML = "";
    history.forEach((item) => {
      const row = element("div", "hit-history-row");
      row.append(element("strong", "", item.guess));
      row.append(element("span", "", item.hit + " Hit"));
      row.append(element("span", "", item.blow + " Blow"));
      row.append(element("small", "", item.before + " -> " + item.after));
      historyList.append(row);
    });
  }

  function submit() {
    if (finished) return;
    const value = input.value.trim();
    const level = levels[levelKey];
    if (!isValidHitBlowGuess(value, level.digits)) {
      setMessage(level.digits + "桁の重複しない数字を入力してください。例: " + (level.digits === 3 ? "012" : "0123"));
      return;
    }
    attempts += 1;
    const before = candidates.length;
    const result = judgeHitBlow(value, secret);
    candidates = candidates.filter((candidate) => {
      const check = judgeHitBlow(value, candidate);
      return check.hit === result.hit && check.blow === result.blow;
    });
    history.unshift({ guess: value, hit: result.hit, blow: result.blow, before, after: candidates.length });
    if (result.hit === level.digits) {
      finished = true;
      input.disabled = true;
      guess.disabled = true;
      const score = Math.max(10, Math.round(250 - attempts * 22 + level.digits * 35));
      setScore(score);
      setMessage("正解。秘密の数字は" + secret + "。" + attempts + "手でクリアです。");
      render();
      return;
    }
    input.value = "";
    setScore(Math.max(0, 200 - attempts * 15));
    setMessage(value + ": " + result.hit + " Hit / " + result.blow + " Blow。候補は" + before + "個から" + candidates.length + "個に減りました。");
    render();
  }

  guess.addEventListener("click", submit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });
  input.addEventListener("input", () => {
    const level = levels[levelKey];
    input.value = input.value.replace(/\D/g, "").slice(0, level.digits);
  });
  retry.addEventListener("click", () => startLevel(levelKey));
  startLevel(levelKey);
  return () => {};
}

function generateHitBlowCandidates(digits) {
  const results = [];
  function build(prefix, used) {
    if (prefix.length === digits) {
      results.push(prefix);
      return;
    }
    for (let digit = 0; digit <= 9; digit += 1) {
      const text = String(digit);
      if (!used.has(text)) {
        used.add(text);
        build(prefix + text, used);
        used.delete(text);
      }
    }
  }
  build("", new Set());
  return results;
}

function isValidHitBlowGuess(value, digits) {
  return new RegExp("^\\d{" + digits + "}$").test(value) && new Set(value).size === digits;
}

function judgeHitBlow(guess, answer) {
  let hit = 0;
  let blow = 0;
  for (let index = 0; index < guess.length; index += 1) {
    if (guess[index] === answer[index]) hit += 1;
    else if (answer.includes(guess[index])) blow += 1;
  }
  return { hit, blow };
}

function initCargo(options = {}) {
  const levels = {
    easy: { name: "やさしい", count: 6, chunk: 2 },
    normal: { name: "ふつう", count: 8, chunk: 3 },
    hard: { name: "むずかしい", count: 10, chunk: 4 }
  };
  const modes = {
    normal: { name: "通常", capacity: Infinity, visible: Infinity },
    capacity: { name: "容量制限", capacity: 3, visible: Infinity },
    preview: { name: "先読み制限", capacity: Infinity, visible: 3 }
  };
  let levelKey = options.level || "easy";
  let modeKey = options.mode || "normal";
  let target = [];
  let waiting = [];
  let stack = [];
  let queue = [];
  let output = [];
  let lastAction = "";
  let steps = 0;
  let misses = 0;

  const controls = element("div", "controls");
  const addStack = element("button", "tool-button", "Stackに入れる");
  const removeStack = element("button", "tool-button primary", "Stackから出す");
  const addQueue = element("button", "tool-button", "Queueに入れる");
  const removeQueue = element("button", "tool-button primary", "Queueから出す");
  const retry = element("button", "tool-button", "やり直し");
  controls.append(addStack, removeStack, addQueue, removeQueue, retry);

  const waitingPanel = element("div", "waiting-panel");
  const waitingTitle = element("h3", "", "データ置き場");
  const waitingList = element("div", "waiting-list");
  waitingPanel.append(waitingTitle, waitingList);
  const board = element("div", "structure-board");
  const stackPanel = structurePanel("スタック", "LIFO: 最後に入れたデータから出る", "stack");
  const queuePanel = structurePanel("キュー", "FIFO: 最初に入れたデータから出る", "queue");
  board.append(stackPanel.wrap, queuePanel.wrap);
  const targetLine = element("div", "rule-note");
  const outputPanel = element("div", "output-panel");
  area.append(controls, waitingPanel, targetLine, board);
  area.append(outputPanel);

  function resetCargo() {
    const level = levels[levelKey];
    const mode = modes[modeKey];
    target = Array.from({ length: level.count }, (_, index) => String(index));
    waiting = makeSolvableOrder(target, mode.capacity);
    stack = [];
    queue = [];
    output = [];
    steps = 0;
    misses = 0;
    lastAction = `${level.name}・${mode.name}モード。数字を0から${target[target.length - 1]}の順番で取り出そう。`;
    setScore("0");
    render();
  }

  function structurePanel(name, caption, type) {
    const wrap = element("section", `structure-panel ${type}`);
    const head = element("div", "structure-head");
    head.append(element("h3", "", name), element("p", "", caption));
    const visual = element("div", "structure-visual");
    const enter = element("div", "arrow enter", "↓");
    const exit = element("div", `arrow exit ${type === "stack" ? "top" : "bottom"}`, type === "stack" ? "↑" : "↓");
    const rails = element("div", "data-rails");
    visual.append(enter, exit, rails);
    wrap.append(head, visual);
    return { wrap, rails };
  }

  function dataBlock(name, marker = "") {
    const node = element("div", `data-block${marker ? ` ${marker}` : ""}`, name);
    if (marker === "next-in") node.title = "次に入れる数字";
    if (marker === "next-out") node.title = "次に取り出せる数字";
    return node;
  }

  function act(type, action) {
    if (output.length === target.length) return;
    if (type === "queue" && action === "add") {
      if (!waiting.length) return setMessage("データ置き場は空です。リセットすると新しく並びます。");
      if (queue.length >= modes[modeKey].capacity) return setMessage(`Queueは満杯です。先に取り出して空きを作ってください。`);
      const data = waiting.shift();
      queue.push(data);
      lastAction = `${data}をQueueへ追加。Queueは列の最後に並びます。`;
    }
    if (type === "queue" && action === "remove") {
      if (!queue.length) return setMessage("Queueは空です。先にデータを入れてください。");
      const next = target[output.length];
      if (queue[0] !== next) return miss(`次に取り出すのは${next}です。Queueの先頭は${queue[0]}なので、まだ取り出せません。`);
      output.push(queue.shift());
      lastAction = `${next}をQueueから取り出しました。Queueは最初に入ったデータが先に出ます。`;
    }
    if (type === "stack" && action === "add") {
      if (!waiting.length) return setMessage("データ置き場は空です。リセットすると新しく並びます。");
      if (stack.length >= modes[modeKey].capacity) return setMessage(`Stackは満杯です。先に取り出して空きを作ってください。`);
      const data = waiting.shift();
      stack.push(data);
      lastAction = `${data}をStackへ追加。Stackは一番上に積まれます。`;
    }
    if (type === "stack" && action === "remove") {
      if (!stack.length) return setMessage("Stackは空です。先にデータを入れてください。");
      const next = target[output.length];
      if (stack[stack.length - 1] !== next) return miss(`次に取り出すのは${next}です。Stackの一番上は${stack[stack.length - 1]}なので、まだ取り出せません。`);
      output.push(stack.pop());
      lastAction = `${next}をStackから取り出しました。Stackは最後に入ったデータが先に出ます。`;
    }
    steps += 1;
    setScore(steps);
    render();
  }

  function miss(text) {
    misses += 1;
    setScore(`${steps} / ミス${misses}`);
    setMessage(text);
  }

  function render() {
    waitingList.innerHTML = "";
    queuePanel.rails.innerHTML = "";
    stackPanel.rails.innerHTML = "";
    const visibleCount = modes[modeKey].visible;
    const visibleWaiting = waiting.slice(0, visibleCount);
    visibleWaiting.forEach((item, index) => waitingList.append(dataBlock(item, index === 0 ? "next-in" : "")));
    if (waiting.length > visibleWaiting.length) {
      waitingList.append(hiddenBlock(waiting.length - visibleWaiting.length));
    }
    queue.forEach((item, index) => queuePanel.rails.append(dataBlock(item, index === 0 ? "next-out" : "")));
    stack.forEach((item, index) => stackPanel.rails.append(dataBlock(item, index === stack.length - 1 ? "next-out" : "")));
    const capacityText = Number.isFinite(modes[modeKey].capacity) ? ` / 容量: 各${modes[modeKey].capacity}個` : "";
    const previewText = Number.isFinite(modes[modeKey].visible) ? ` / 見える数: ${modes[modeKey].visible}個` : "";
    targetLine.textContent = `目標: ${target.join(" → ")} / 次: ${target[output.length] || "完了"} / ミス: ${misses}${capacityText}${previewText}`;
    outputPanel.innerHTML = "";
    outputPanel.append(element("h3", "", "取り出した順番"));
    const outputList = element("div", "output-list");
    output.forEach((item) => outputList.append(dataBlock(item)));
    outputPanel.append(outputList);
    const cleared = output.length === target.length;
    const rank = misses === 0 ? "ノーミス" : `ミス${misses}`;
    const stuck = !cleared && !canCurrentStateFinish(waiting, stack, queue, target.slice(output.length), modes[modeKey].capacity);
    setMessage(cleared ? `クリア。${rank}で0から${target[target.length - 1]}まで順番に取り出せました。` : stuck ? "詰みです。この状態から目標順には戻せません。やり直しで再挑戦できます。" : lastAction);
    setScore(cleared ? `${steps} / ${rank}` : `${steps} / ミス${misses}`);
    [addStack, removeStack, addQueue, removeQueue].forEach((button) => {
      button.disabled = cleared;
    });
  }

  addQueue.addEventListener("click", () => act("queue", "add"));
  removeQueue.addEventListener("click", () => act("queue", "remove"));
  addStack.addEventListener("click", () => act("stack", "add"));
  removeStack.addEventListener("click", () => act("stack", "remove"));
  retry.addEventListener("click", resetCargo);
  resetCargo();
  return () => {};
}

function hiddenBlock(count) {
  const node = element("div", "data-block hidden-block", `+${count}`);
  node.title = "まだ見えないデータ";
  return node;
}

function makeSolvableOrder(target, capacity) {
  let best = null;
  let bestScore = -Infinity;
  for (let attempt = 0; attempt < 260; attempt += 1) {
    const order = shuffle(target);
    if (!isSolvableOrder(order, target, capacity)) continue;
    const score = scrambleScore(order);
    if (score > bestScore) {
      best = order;
      bestScore = score;
    }
    if (countAdjacentPairs(order) === 0) return order;
  }
  return best || makeGuaranteedOrder(target, capacity);
}

function makeGuaranteedOrder(target, capacity) {
  const limit = Number.isFinite(capacity) ? Math.max(1, capacity) : target.length;
  const order = [];
  for (let index = 0; index < target.length; index += limit) {
    order.push(...target.slice(index, index + limit).reverse());
  }
  return order;
}

function scrambleScore(order) {
  const adjacentPenalty = countAdjacentPairs(order) * 12;
  const distanceScore = order.reduce((sum, item, index) => sum + Math.abs(Number(item) - index), 0);
  return distanceScore - adjacentPenalty;
}

function countAdjacentPairs(order) {
  let count = 0;
  for (let index = 1; index < order.length; index += 1) {
    if (Math.abs(Number(order[index]) - Number(order[index - 1])) === 1) count += 1;
  }
  return count;
}

function isSolvableOrder(order, target, capacity) {
  return canCurrentStateFinish(order, [], [], target, capacity);
}

function canCurrentStateFinish(waiting, stack, queue, remainingTarget, capacity) {
  const limit = Number.isFinite(capacity) ? capacity : waiting.length + stack.length + queue.length + remainingTarget.length;
  const memo = new Set();

  function dfs(inputIndex, nextIndex, stack, queue) {
    if (nextIndex === remainingTarget.length) return true;
    const key = `${inputIndex}|${nextIndex}|${stack.join(",")}|${queue.join(",")}`;
    if (memo.has(key)) return false;
    memo.add(key);

    const next = remainingTarget[nextIndex];
    if (stack[stack.length - 1] === next && dfs(inputIndex, nextIndex + 1, stack.slice(0, -1), queue)) return true;
    if (queue[0] === next && dfs(inputIndex, nextIndex + 1, stack, queue.slice(1))) return true;

    if (inputIndex < waiting.length) {
      const item = waiting[inputIndex];
      if (stack.length < limit && dfs(inputIndex + 1, nextIndex, [...stack, item], queue)) return true;
      if (queue.length < limit && dfs(inputIndex + 1, nextIndex, stack, [...queue, item])) return true;
    }
    return false;
  }

  return dfs(0, 0, [...stack], [...queue]);
}

function initRiver(options = {}) {
  const levels = {
    easy: {
      name: "やさしい",
      capacity: 2,
      kind: "wolf",
      pilots: ["farmer"],
      items: [
        { id: "farmer", name: "農夫", icon: "農夫" },
        { id: "wolf", name: "狼", icon: "狼" },
        { id: "goat", name: "ヤギ", icon: "ヤギ" },
        { id: "cabbage", name: "キャベツ", icon: "キャベツ" }
      ],
      ruleText: "農夫だけが操縦できます。農夫がいない岸で、狼とヤギ、またはヤギとキャベツを残すと失敗。"
    },
    normal: {
      name: "ふつう",
      capacity: 2,
      kind: "missionary",
      pilots: ["m1", "m2", "m3", "c1", "c2", "c3"],
      items: [
        { id: "m1", name: "宣教師1", icon: "宣1" },
        { id: "m2", name: "宣教師2", icon: "宣2" },
        { id: "m3", name: "宣教師3", icon: "宣3" },
        { id: "c1", name: "人食い人1", icon: "人1" },
        { id: "c2", name: "人食い人2", icon: "人2" },
        { id: "c3", name: "人食い人3", icon: "人3" }
      ],
      ruleText: "船は2人まで。どちらの岸でも、宣教師が1人以上いるときに人食い人の数が宣教師より多いと失敗。"
    },
    hard: {
      name: "むずかしい",
      capacity: 2,
      kind: "family",
      pilots: ["father", "mother", "maid"],
      items: [
        { id: "father", name: "父", icon: "父" },
        { id: "mother", name: "母", icon: "母" },
        { id: "son1", name: "息子1", icon: "息1" },
        { id: "son2", name: "息子2", icon: "息2" },
        { id: "daughter1", name: "娘1", icon: "娘1" },
        { id: "daughter2", name: "娘2", icon: "娘2" },
        { id: "maid", name: "メイド", icon: "メイド" },
        { id: "dog", name: "犬", icon: "犬" }
      ],
      ruleText: "操縦できるのは父・母・メイド。父は母なしで娘と残れません。母は父なしで息子と残れません。犬はメイドなしで誰かと残れません。"
    }
  };
  let levelKey = options.level || "easy";
  let level = levels[levelKey];
  let items = level.items;
  let state = { boat: "left", left: items.map((item) => item.id), right: [] };
  let selected = new Set();
  let moves = 0;
  let best = [];

  const controls = element("div", "controls river-controls");
  const moveButton = element("button", "tool-button primary", "船を動かす");
  const hintButton = element("button", "tool-button", "ヒント");
  const retry = element("button", "tool-button", "やり直し");
  controls.append(moveButton, hintButton, retry);

  const rule = element("div", "rule-note");
  const board = element("div", "river-board");
  const leftBank = bankPanel("左岸");
  const river = element("div", "river-water");
  const boat = element("div", "boat");
  const boatTitle = element("strong", "", "船");
  const boatList = element("div", "boat-list");
  boat.append(boatTitle, boatList);
  river.append(boat);
  const rightBank = bankPanel("右岸");
  board.append(leftBank.wrap, river, rightBank.wrap);
  area.append(controls, rule, board);

  function startLevel(key) {
    levelKey = key;
    level = levels[levelKey];
    items = level.items;
    best = solveRiver(level);
    reset();
  }

  function bankPanel(name) {
    const wrap = element("section", "river-bank");
    wrap.append(element("h3", "", name));
    const list = element("div", "river-items");
    wrap.append(list);
    return { wrap, list };
  }

  function render() {
    leftBank.list.innerHTML = "";
    rightBank.list.innerHTML = "";
    boatList.innerHTML = "";
    renderBank("left", leftBank.list);
    renderBank("right", rightBank.list);
    selected.forEach((id) => boatList.append(itemButton(id, true)));
    boat.className = `boat ${state.boat}`;
    rule.textContent = `ルール: 船は${level.capacity}人まで。${level.ruleText} 最短は${best.length - 1}手です。`;
    setScore(`${moves} / ${best.length - 1}`);
    const problem = riverProblem(state, level);
    const cleared = state.right.length === items.length && state.boat === "right";
    if (cleared) {
      setMessage(`クリア。${moves}手で全員を右岸へ運びました。`);
      moveButton.disabled = true;
      hintButton.disabled = true;
    } else if (problem) {
      setMessage(`失敗: ${problem}。やり直しで再挑戦できます。`);
      moveButton.disabled = true;
      hintButton.disabled = true;
    }
  }

  function renderBank(side, list) {
    state[side].forEach((id) => {
      const node = itemButton(id, false);
      node.disabled = state.boat !== side;
      node.classList.toggle("selected", selected.has(id));
      list.append(node);
    });
  }

  function itemButton(id, inBoat) {
    const item = items.find((entry) => entry.id === id);
    const node = element("button", `river-item ${inBoat ? "in-boat" : ""}`, item.icon);
    if (level.pilots.includes(id)) node.classList.add("pilot");
    node.title = level.pilots.includes(id) ? `${item.name} / 操縦可` : item.name;
    node.setAttribute("aria-label", item.name);
    if (!inBoat) {
      node.addEventListener("click", () => toggleItem(id));
    }
    return node;
  }

  function toggleItem(id) {
    if (!state[state.boat].includes(id)) return;
    if (selected.has(id)) selected.delete(id);
    else {
      if (selected.size >= level.capacity) selected.delete([...selected][0]);
      selected.add(id);
    }
    render();
  }

  function moveBoat() {
    if (!selected.size) {
      setMessage("船に乗る人を選んでください。");
      return;
    }
    if (![...selected].some((id) => level.pilots.includes(id))) {
      setMessage("この組み合わせでは船を操縦できません。操縦できる人を乗せてください。");
      return;
    }
    const from = state.boat;
    const to = from === "left" ? "right" : "left";
    selected.forEach((id) => {
      state[from] = state[from].filter((item) => item !== id);
      state[to].push(id);
    });
    state.boat = to;
    selected.clear();
    moves += 1;
    setMessage("船を移動しました。残された岸の制約に注意。");
    render();
  }

  function showHint() {
    const path = solveRiver(level, state);
    if (path.length < 2) {
      setMessage("この状態からの最短手は見つかりません。");
      return;
    }
    const current = path[0];
    const next = path[1];
    const moved = difference(current, next);
    setMessage(moved.length ? `ヒント: ${moved.map(nameOf).join("・")}を乗せて船を動かす。` : "ヒント: 荷物を乗せずに船だけ戻す。");
  }

  function reset() {
    state = { boat: "left", left: items.map((item) => item.id), right: [] };
    selected.clear();
    moves = 0;
    moveButton.disabled = false;
    hintButton.disabled = false;
    setMessage(`${level.name}モード。すべて右岸へ運ぼう。岸に残す組み合わせに注意。`);
    render();
  }

  function nameOf(id) {
    return items.find((item) => item.id === id).name;
  }

  moveButton.addEventListener("click", moveBoat);
  hintButton.addEventListener("click", showHint);
  retry.addEventListener("click", reset);
  startLevel(levelKey);
  return () => {};
}

function riverProblem(state, level) {
  if (level.kind === "wolf") {
    return riverWolfProblem(state);
  }
  if (level.kind === "missionary") {
    return riverMissionaryProblem(state);
  }
  if (level.kind === "family") {
    return riverFamilyProblem(state);
  }
  return "";
}

function riverWolfProblem(state) {
  for (const side of ["left", "right"]) {
    const bank = state[side];
    if (bank.includes("farmer")) continue;
    if (bank.includes("wolf") && bank.includes("goat")) return "農夫がいない岸で狼がヤギを食べます";
    if (bank.includes("goat") && bank.includes("cabbage")) return "農夫がいない岸でヤギがキャベツを食べます";
  }
  return "";
}

function riverMissionaryProblem(state) {
  for (const side of ["left", "right"]) {
    const bank = state[side];
    const missionaries = bank.filter((id) => id.startsWith("m")).length;
    const cannibals = bank.filter((id) => id.startsWith("c")).length;
    if (missionaries > 0 && cannibals > missionaries) return "宣教師より人食い人が多い岸があります";
  }
  return "";
}

function riverFamilyProblem(state) {
  for (const side of ["left", "right"]) {
    const bank = state[side];
    const hasFather = bank.includes("father");
    const hasMother = bank.includes("mother");
    const hasMaid = bank.includes("maid");
    const hasDaughter = bank.includes("daughter1") || bank.includes("daughter2");
    const hasSon = bank.includes("son1") || bank.includes("son2");
    const hasDog = bank.includes("dog");
    if (hasFather && hasDaughter && !hasMother) return "母がいない岸で父と娘が一緒です";
    if (hasMother && hasSon && !hasFather) return "父がいない岸で母と息子が一緒です";
    if (hasDog && !hasMaid && bank.length > 1) return "メイドがいない岸で犬が危険です";
  }
  return "";
}

function solveRiver(level, startState = null) {
  const ids = level.items.map((item) => item.id);
  const start = startState ? cloneRiver(startState) : { boat: "left", left: [...ids], right: [] };
  const goalKey = riverKey({ boat: "right", left: [], right: [...ids] });
  const queue = [[start]];
  const seen = new Set([riverKey(start)]);
  while (queue.length) {
    const path = queue.shift();
    const current = path[path.length - 1];
    if (riverKey(current) === goalKey) return path;
    nextRiverStates(current, level).forEach((next) => {
      const key = riverKey(next);
      if (!seen.has(key) && !riverProblem(next, level)) {
        seen.add(key);
        queue.push([...path, next]);
      }
    });
  }
  return [];
}

function nextRiverStates(state, level) {
  const from = state.boat;
  const to = from === "left" ? "right" : "left";
  const cargoOptions = riverCargoOptions(state[from], level.capacity);
  return cargoOptions.map((cargoList) => {
    const next = cloneRiver(state);
    cargoList.forEach((cargo) => {
      next[from] = next[from].filter((id) => id !== cargo);
      next[to].push(cargo);
    });
    next.boat = to;
    return normalizeRiver(next);
  }).filter((next, index) => cargoOptions[index].some((id) => level.pilots.includes(id)));
}

function riverCargoOptions(ids, capacity) {
  const options = [];
  function build(start, chosen) {
    if (chosen.length > 0) options.push([...chosen]);
    if (chosen.length === capacity) return;
    for (let index = start; index < ids.length; index += 1) {
      chosen.push(ids[index]);
      build(index + 1, chosen);
      chosen.pop();
    }
  }
  build(0, []);
  return options;
}

function cloneRiver(state) {
  return { boat: state.boat, left: [...state.left], right: [...state.right] };
}

function normalizeRiver(state) {
  state.left.sort();
  state.right.sort();
  return state;
}

function riverKey(state) {
  const normalized = normalizeRiver(cloneRiver(state));
  return `${normalized.boat}|${normalized.left.join(",")}|${normalized.right.join(",")}`;
}

function difference(a, b) {
  const all = [...new Set([...a.left, ...a.right, ...b.left, ...b.right])];
  return all.filter((id) => a.left.includes(id) !== b.left.includes(id));
}

function initColoring(options = {}) {
  const stageSets = {
    easy: [
      graphStage("三角と枝", 4, [[20, 28], [50, 14], [78, 32], [50, 68]], [[0, 1], [1, 2], [2, 0], [1, 3]]),
      graphStage("四角形", 4, [[24, 24], [76, 24], [76, 72], [24, 72]], [[0, 1], [1, 2], [2, 3], [3, 0]]),
      graphStage("小さな星", 4, [[50, 16], [78, 38], [66, 72], [34, 72], [22, 38]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2]])
    ],
    normal: [
      graphStage("六角形", 3, [[50, 10], [78, 28], [78, 66], [50, 84], [22, 66], [22, 28]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4]]),
      graphStage("中心つき", 3, [[50, 12], [78, 35], [68, 74], [32, 74], [22, 35], [50, 45]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [1, 5], [2, 5], [3, 5]]),
      graphStage("二つの輪", 3, [[22, 24], [50, 18], [78, 24], [68, 68], [50, 82], [32, 68]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4], [2, 5]]),
      graphStage("橋つき", 3, [[18, 20], [42, 20], [30, 48], [18, 76], [42, 76], [70, 30], [82, 58]], [[0, 1], [1, 2], [2, 0], [3, 4], [4, 2], [2, 3], [1, 5], [5, 6], [6, 4]])
    ],
    hard: [
      graphStage("密な七角形", 3, [[50, 8], [76, 22], [84, 52], [64, 78], [36, 78], [16, 52], [24, 22]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 3], [0, 4], [1, 4], [1, 5], [2, 5], [2, 6]]),
      graphStage("八頂点", 3, [[20, 18], [50, 10], [80, 18], [84, 48], [72, 78], [42, 84], [16, 64], [36, 44]], [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [0, 7], [1, 7], [2, 7], [3, 7], [5, 7], [6, 7], [1, 5], [2, 6]]),
      graphStage("三角格子", 3, [[20, 20], [50, 16], [80, 20], [34, 48], [66, 48], [20, 78], [50, 82], [80, 78]], [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 4], [3, 5], [3, 6], [4, 6], [4, 7], [5, 6], [6, 7]])
    ]
  };
  const levelKey = options.level || "easy";
  const stages = stageSets[levelKey];
  let stageIndex = 0;
  let fill = {};
  let activeColor = colors[0];
  let solvedStages = 0;

  const controls = element("div", "controls coloring-controls");
  const nextButton = element("button", "tool-button primary", "次のステージ");
  const retry = element("button", "tool-button", "塗り直し");
  controls.append(nextButton, retry);
  const info = element("div", "rule-note");
  const palette = element("div", "palette");
  const board = element("div", "coloring-board");
  area.append(controls, info, palette, board);

  function currentStage() {
    return stages[stageIndex];
  }

  function renderPalette() {
    palette.innerHTML = "";
    colors.slice(0, currentStage().colorCount).forEach((color) => {
      const swatch = element("button", "swatch");
      swatch.style.background = color;
      swatch.title = color;
      swatch.classList.toggle("active", color === activeColor);
      swatch.addEventListener("click", () => {
        activeColor = color;
        render();
      });
      palette.append(swatch);
    });
  }

  function render() {
    const stage = currentStage();
    renderPalette();
    board.innerHTML = "";
    info.textContent = `ステージ ${stageIndex + 1} / ${stages.length}: ${stage.name}。使える色は${stage.colorCount}色です。`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("graph-svg");
    stage.edges.forEach(([a, b]) => {
      const one = stage.nodes[a];
      const two = stage.nodes[b];
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", `${one.x}%`);
      line.setAttribute("y1", `${one.y}%`);
      line.setAttribute("x2", `${two.x}%`);
      line.setAttribute("y2", `${two.y}%`);
      line.setAttribute("stroke", isConflict(a, b) ? "#e4667b" : "#9aa8a4");
      line.setAttribute("stroke-width", isConflict(a, b) ? "6" : "4");
      svg.append(line);
    });
    board.append(svg);
    stage.nodes.forEach((node, index) => {
      const button = element("button", "node", node.id);
      button.style.left = `calc(${node.x}% - 29px)`;
      button.style.top = `calc(${node.y}% - 29px)`;
      button.style.background = fill[index] || "#fff";
      button.addEventListener("click", () => {
        fill[index] = activeColor;
        render();
      });
      board.append(button);
    });
    const conflicts = countConflicts();
    const complete = Object.keys(fill).length === stage.nodes.length;
    const cleared = complete && conflicts === 0;
    setScore(`${conflicts} / ${solvedStages}`);
    nextButton.disabled = !cleared;
    if (cleared) {
      setMessage(stageIndex === stages.length - 1 ? `全ステージクリア。${stages.length}問を塗り分けました。` : "クリア。次のステージへ進めます。");
    } else {
      setMessage(`同じ色で隣接している辺は${conflicts}本。すべての頂点を塗り分けよう。`);
    }
  }

  function isConflict(a, b) {
    return fill[a] && fill[a] === fill[b];
  }

  function countConflicts() {
    return currentStage().edges.filter(([a, b]) => isConflict(a, b)).length;
  }

  function resetStage() {
    fill = {};
    nextButton.disabled = true;
    render();
  }

  function nextStage() {
    if (nextButton.disabled) return;
    solvedStages = Math.max(solvedStages, stageIndex + 1);
    if (stageIndex < stages.length - 1) {
      stageIndex += 1;
      resetStage();
    } else {
      render();
    }
  }

  nextButton.addEventListener("click", nextStage);
  retry.addEventListener("click", resetStage);
  resetStage();
  return () => {};
}

function graphStage(name, colorCount, positions, edges) {
  return {
    name,
    colorCount,
    nodes: positions.map(([x, y], index) => ({ id: String.fromCharCode(65 + index), x, y })),
    edges
  };
}

function initMaze() {
  const size = 10;
  const start = 0;
  const goal = size * size - 1;
  let walls = new Set([12, 13, 14, 17, 22, 24, 27, 32, 34, 37, 42, 44, 47, 52, 54, 55, 56, 62, 72, 73, 74, 75, 76, 86]);
  let seen = new Set();
  let path = new Set();
  const controls = element("div", "controls");
  const solve = element("button", "tool-button primary", "探索");
  const clear = element("button", "tool-button", "壁を初期化");
  const boardWrap = element("div", "maze-wrap");
  const grid = element("div", "maze-grid");
  const legend = element("div", "legend");
  boardWrap.append(grid, legend);
  controls.append(solve, clear);
  area.append(controls, boardWrap);

  [
    ["start", "開始"],
    ["goal", "ゴール"],
    ["wall", "壁"],
    ["seen", "探索済み"],
    ["path", "最短経路"]
  ].forEach(([className, text]) => {
    const row = element("div", "legend-row");
    const dot = element("span", `legend-dot cell ${className}`);
    row.append(dot, document.createTextNode(text));
    legend.append(row);
  });

  function render() {
    grid.innerHTML = "";
    for (let index = 0; index < size * size; index += 1) {
      const cell = element("button", "cell");
      if (index === start) cell.classList.add("start");
      if (index === goal) cell.classList.add("goal");
      if (walls.has(index)) cell.classList.add("wall");
      if (seen.has(index)) cell.classList.add("seen");
      if (path.has(index)) cell.classList.add("path");
      cell.title = `${Math.floor(index / size)}, ${index % size}`;
      cell.addEventListener("click", () => {
        if (index === start || index === goal) return;
        walls.has(index) ? walls.delete(index) : walls.add(index);
        seen.clear();
        path.clear();
        setScore(0);
        setMessage("壁を編集しました。探索ボタンでBFSを実行できます。");
        render();
      });
      grid.append(cell);
    }
  }

  function neighbors(index) {
    const row = Math.floor(index / size);
    const col = index % size;
    return [
      row > 0 ? index - size : null,
      row < size - 1 ? index + size : null,
      col > 0 ? index - 1 : null,
      col < size - 1 ? index + 1 : null
    ].filter((value) => value !== null && !walls.has(value));
  }

  function bfs() {
    const queue = [start];
    const parent = new Map([[start, null]]);
    seen = new Set([start]);
    path = new Set();
    while (queue.length) {
      const current = queue.shift();
      if (current === goal) break;
      neighbors(current).forEach((next) => {
        if (!seen.has(next)) {
          seen.add(next);
          parent.set(next, current);
          queue.push(next);
        }
      });
    }
    if (!parent.has(goal)) {
      setMessage("ゴールへ到達できません。壁を少し取り除いてみよう。");
      setScore(seen.size);
      render();
      return;
    }
    let cursor = goal;
    while (cursor !== null) {
      path.add(cursor);
      cursor = parent.get(cursor);
    }
    setScore(seen.size);
    setMessage(`BFSで到達。最短経路は${path.size - 1}歩、探索したマスは${seen.size}個。`);
    render();
  }

  solve.addEventListener("click", bfs);
  clear.addEventListener("click", () => {
    walls = new Set();
    seen.clear();
    path.clear();
    setScore(0);
    setMessage("壁をすべて消しました。クリックで新しい迷路を設計できます。");
    render();
  });
  setMessage("クリックで壁を作り、探索ボタンでBFSの広がりを見よう。");
  render();
  return () => {};
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

loadGame(currentGame);
