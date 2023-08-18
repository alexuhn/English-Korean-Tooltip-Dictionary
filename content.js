let shownWord;
let foundWord;
let timer;

// Reference: https://stackoverflow.com/a/49961880
const expandRange = (range) => {
  if (
    !range.startContainer ||
    range.startContainer.nodeType !== Node.TEXT_NODE
  ) {
    return null;
  }

  try {
    range.expand("word");
    return range;
  } catch {
    return null;
  }
};

const getWordAtRange = (range) => {
  const word = range.toString().trim();
  if (word === "") {
    return null;
  }
  if (!/^[A-Za-z]+$/.test(word)) {
    return null;
  }
  return word;
};

const notInWordRect = (position, rect) => {
  if (!rect) {
    return false;
  }
  return (
    position.x < rect.left ||
    position.x > rect.right ||
    position.y < rect.top ||
    position.y > rect.bottom
  );
};

const addTooltip = (position, wordRect) => {
  if (notInWordRect(position, wordRect)) {
    return;
  }
  if (shownWord == foundWord) {
    return;
  }
  shownWord = foundWord;

  (async () => {
    const response = await chrome.runtime.sendMessage({
      word: shownWord.toLowerCase(),
    });
    const meaning = response.meaning;
    if (!meaning) {
      shownWord = "";
      return;
    }

    const tooltip = document.createElement("div");
    tooltip.id = "tooltip-result";
    tooltip.textContent = `${shownWord}: ${meaning}`;

    tooltip.style.top = `${wordRect.bottom}px`;
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = 999999;
    tooltip.style.backgroundColor = "#fafafa";
    tooltip.style.fontSize = "16px";
    tooltip.style.fontFamily = "Pretendard";
    tooltip.style.borderRadius = "4px";
    tooltip.style.padding = "4px";
    tooltip.style.boxShadow = "rgba(0, 0, 0, 0.35) 0px 5px 15px;";
    tooltip.style.whiteSpace = "nowrap";
    // Temporarily hide the tooltip to measure its width without displaying it.
    tooltip.style.visibility = "hidden";

    document.body.appendChild(tooltip);

    // Position the tooltip to ensure the text does not wrap into multiple lines.
    if (tooltip.offsetWidth + wordRect.left > window.innerWidth) {
      tooltip.style.right = "4px";
    } else {
      tooltip.style.left = `${wordRect.left}px`;
    }
    // Make the tooltip visible after positioning it correctly.
    tooltip.style.visibility = "visible";
  })();
};

const removeTooltip = () => {
  const tooltipElement = document.getElementById("tooltip-result");
  if (!tooltipElement) {
    return;
  }
  tooltipElement.remove();
  shownWord = null;
};

document.addEventListener("mousemove", function (event) {
  const range = document.caretRangeFromPoint(event.clientX, event.clientY);
  if (!range) {
    return;
  }

  const wordRange = expandRange(range);
  if (!wordRange) {
    return;
  }

  const position = { x: event.clientX, y: event.clientY };
  const wordRect = wordRange.getBoundingClientRect();
  if (shownWord && notInWordRect(position, wordRect)) {
    removeTooltip();
  }

  const word = getWordAtRange(wordRange);
  if (!word || word == shownWord) {
    return;
  }
  foundWord = word;

  clearTimeout(timer);
  timer = setTimeout(() => {
    addTooltip(position, wordRect);
  }, 300);
});

document.addEventListener("scroll", () => {
  shownWord !== "" && removeTooltip();
});
