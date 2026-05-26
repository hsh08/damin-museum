/**
 * 다민박힌물관 — 3×3 스와이프 교환 퍼즐
 * 조각 두 개를 끌어다 놓거나 탭해서 서로 바꾸며 원본을 맞춥니다.
 */

(function initPuzzleGame() {
  const GRID_SIZE = 3;
  const TOTAL_CELLS = 9;
  const MIN_DRAG_DISTANCE = 20;

  const boardElement = document.getElementById("puzzle-board");
  const imageSelect = document.getElementById("puzzle-image-select");
  const shuffleButton = document.getElementById("puzzle-shuffle");
  const statsElement = document.getElementById("puzzle-stats");
  const hintElement = document.getElementById("puzzle-hint");
  const winMessage = document.getElementById("puzzle-win");

  if (!boardElement || !imageSelect || !shuffleButton) {
    return;
  }

  /** @type {number[]} 각 칸에 놓인 조각 번호 */
  let boardState = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let moveCount = 0;
  let isGameWon = false;
  let slotElements = [];

  /** 첫 번째로 고른 칸 (탭으로 바꿀 때) */
  let selectedCellIndex = null;

  /** @type {{ fromCell: number, startX: number, startY: number, pointerId: number } | null} */
  let activeDrag = null;

  function isSolved() {
    for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex += 1) {
      if (boardState[cellIndex] !== cellIndex) {
        return false;
      }
    }
    return true;
  }

  function swapCells(indexA, indexB) {
    if (indexA === indexB) {
      return;
    }
    const temporary = boardState[indexA];
    boardState[indexA] = boardState[indexB];
    boardState[indexB] = temporary;
  }

  /** Fisher–Yates 셔플 (완성 상태가 아닐 때까지) */
  function shuffleBoard() {
    boardState = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    do {
      for (let index = TOTAL_CELLS - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        swapCells(index, randomIndex);
      }
    } while (isSolved());
  }

  function getBackgroundPosition(pieceId) {
    const row = Math.floor(pieceId / GRID_SIZE);
    const col = pieceId % GRID_SIZE;
    const percentX = col === 0 ? "0%" : col === 1 ? "50%" : "100%";
    const percentY = row === 0 ? "0%" : row === 1 ? "50%" : "100%";
    return `${percentX} ${percentY}`;
  }

  function getSelectedImageUrl() {
    const selectedValue = imageSelect.value;
    if (!selectedValue || typeof selectedValue !== "string") {
      return "assets/임다민1.png";
    }
    return selectedValue;
  }

  function updateStats() {
    if (statsElement) {
      statsElement.textContent = `교환 ${moveCount}회`;
    }
  }

  function showWinMessage() {
    isGameWon = true;
    clearSelection();
    if (winMessage) {
      winMessage.classList.remove("puzzle__message--hidden");
    }
    if (hintElement) {
      hintElement.textContent =
        "완성했습니다! 다른 작품을 골라 다시 도전해 보세요.";
    }
  }

  function hideWinMessage() {
    isGameWon = false;
    if (winMessage) {
      winMessage.classList.add("puzzle__message--hidden");
    }
    if (hintElement) {
      hintElement.textContent =
        "조각을 다른 조각 위로 끌어 놓거나, 두 조각을 차례로 탭해 서로 바꿔 주세요.";
    }
  }

  function clearSelection() {
    selectedCellIndex = null;
    slotElements.forEach((slot) => {
      slot.classList.remove("puzzle__slot--selected");
    });
  }

  function setSelection(cellIndex) {
    clearSelection();
    selectedCellIndex = cellIndex;
    const slot = slotElements[cellIndex];
    if (slot) {
      slot.classList.add("puzzle__slot--selected");
    }
  }

  function getCellIndexFromElement(element) {
    const slot = element?.closest?.(".puzzle__slot");
    if (!slot) {
      return null;
    }
    const cellIndex = Number(slot.dataset.cellIndex);
    if (Number.isNaN(cellIndex) || cellIndex < 0 || cellIndex >= TOTAL_CELLS) {
      return null;
    }
    return cellIndex;
  }

  function performSwap(cellIndexA, cellIndexB) {
    if (isGameWon || cellIndexA === cellIndexB) {
      return false;
    }

    swapCells(cellIndexA, cellIndexB);
    moveCount += 1;
    updateStats();
    updateBoardView();

    if (isSolved()) {
      showWinMessage();
    }

    return true;
  }

  /** 탭 두 번으로 교환 */
  function handleTapSelect(cellIndex) {
    if (isGameWon) {
      return;
    }

    if (selectedCellIndex === null) {
      setSelection(cellIndex);
      return;
    }

    if (selectedCellIndex === cellIndex) {
      clearSelection();
      return;
    }

    performSwap(selectedCellIndex, cellIndex);
    clearSelection();
  }

  function getTileElement(cellIndex) {
    const slot = slotElements[cellIndex];
    return slot ? slot.querySelector(".puzzle__tile") : null;
  }

  function resetTileTransform(cellIndex) {
    const tile = getTileElement(cellIndex);
    if (tile) {
      tile.style.transform = "";
      tile.classList.remove("puzzle__tile--dragging");
    }
  }

  function onPointerDown(event, cellIndex) {
    if (isGameWon) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const tile = getTileElement(cellIndex);
    if (!tile) {
      return;
    }

    event.preventDefault();
    tile.setPointerCapture(event.pointerId);
    tile.classList.add("puzzle__tile--dragging");

    activeDrag = {
      fromCell: cellIndex,
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
    };
  }

  function onPointerMove(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - activeDrag.startX;
    const deltaY = event.clientY - activeDrag.startY;
    const tile = getTileElement(activeDrag.fromCell);

    if (tile) {
      tile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    const hoverTarget = document.elementFromPoint(event.clientX, event.clientY);
    const hoverCell = getCellIndexFromElement(hoverTarget);

    slotElements.forEach((slot, index) => {
      slot.classList.toggle(
        "puzzle__slot--swap-target",
        hoverCell !== null && hoverCell === index && hoverCell !== activeDrag.fromCell
      );
    });
  }

  function onPointerUp(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }

    const { fromCell, startX, startY } = activeDrag;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const dragDistance = Math.hypot(deltaX, deltaY);

    const tile = getTileElement(fromCell);
    if (tile) {
      tile.releasePointerCapture(event.pointerId);
    }

    resetTileTransform(fromCell);

    slotElements.forEach((slot) => {
      slot.classList.remove("puzzle__slot--swap-target");
    });

    const dropTarget = document.elementFromPoint(event.clientX, event.clientY);
    const targetCell = getCellIndexFromElement(dropTarget);

    if (
      targetCell !== null &&
      targetCell !== fromCell &&
      dragDistance >= MIN_DRAG_DISTANCE
    ) {
      performSwap(fromCell, targetCell);
      clearSelection();
    } else if (dragDistance < MIN_DRAG_DISTANCE) {
      handleTapSelect(fromCell);
    }

    activeDrag = null;
  }

  function onPointerCancel(event) {
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }

    resetTileTransform(activeDrag.fromCell);
    slotElements.forEach((slot) => {
      slot.classList.remove("puzzle__slot--swap-target");
    });
    activeDrag = null;
  }

  function attachSwapHandlers(tile, cellIndex) {
    tile.addEventListener("pointerdown", (event) =>
      onPointerDown(event, cellIndex)
    );
    tile.addEventListener("pointermove", onPointerMove);
    tile.addEventListener("pointerup", onPointerUp);
    tile.addEventListener("pointercancel", onPointerCancel);
  }

  function buildBoardSlots() {
    boardElement.innerHTML = "";
    slotElements = [];

    for (let cellIndex = 0; cellIndex < TOTAL_CELLS; cellIndex += 1) {
      const slot = document.createElement("div");
      slot.className = "puzzle__slot";
      slot.dataset.cellIndex = String(cellIndex);

      const tile = document.createElement("div");
      tile.className = "puzzle__tile";
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");

      attachSwapHandlers(tile, cellIndex);
      slot.appendChild(tile);
      boardElement.appendChild(slot);
      slotElements.push(slot);
    }
  }

  function updateBoardView() {
    const imageUrl = getSelectedImageUrl();

    slotElements.forEach((slot, cellIndex) => {
      const pieceId = boardState[cellIndex];
      const tile = slot.querySelector(".puzzle__tile");
      if (!tile) {
        return;
      }

      const isCorrectPlace = pieceId === cellIndex;
      slot.classList.toggle("puzzle__slot--correct", !isGameWon && isCorrectPlace);
      slot.classList.toggle(
        "puzzle__slot--selected",
        selectedCellIndex === cellIndex
      );

      tile.style.backgroundImage = `url("${imageUrl}")`;
      tile.style.backgroundSize = "300% 300%";
      tile.style.backgroundPosition = getBackgroundPosition(pieceId);
      tile.setAttribute(
        "aria-label",
        `조각 ${pieceId + 1}, 끌어 다른 조각과 바꾸거나 탭하여 선택`
      );
    });
  }

  function startNewGame() {
    moveCount = 0;
    hideWinMessage();
    clearSelection();
    shuffleBoard();
    updateStats();
    buildBoardSlots();
    updateBoardView();
  }

  shuffleButton.addEventListener("click", startNewGame);

  imageSelect.addEventListener("change", () => {
    if (!imageSelect.value) {
      imageSelect.value = "assets/임다민1.png";
    }
    startNewGame();
  });

  startNewGame();
})();
