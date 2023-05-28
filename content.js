let shown;
let found;
let timer;

// Reference: https://stackoverflow.com/a/49961880
const expandRange = (range) => {
  if (!range.startContainer) {
    return null;
  }
  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    return null;
  }
  range.expand("word");
  return range;
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

const addTooltip = (position, wordRect) => {
  if (
    position.x < wordRect.left ||
    position.x > wordRect.right ||
    position.y < wordRect.top ||
    position.y > wordRect.bottom
  ) {
    return;
  }
  if (shown == found) {
    return;
  }
  shown = found;

  (async () => {
    const response = await chrome.runtime.sendMessage({ word: shown });
    const meaning = response.meaning;
    if (!meaning) {
      shown = "";
      return;
    }

    const tooltip = document.createElement("div");
    tooltip.id = "tooltip-result";
    tooltip.textContent = `${shown}: ${meaning}`;

    tooltip.style.left = `${wordRect.left}px`;
    tooltip.style.top = `${wordRect.bottom}px`;
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = 999999;
    tooltip.style.backgroundColor = "#fafafa";
    tooltip.style.fontSize = "16px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.padding = "4px";
    tooltip.style.boxShadow = "rgba(0, 0, 0, 0.35) 0px 5px 15px;";

    document.body.appendChild(tooltip);
  })();
};

const removeTooltip = () => {
  const tooltipElement = document.getElementById("tooltip-result");
  if (!tooltipElement) {
    return;
  }
  tooltipElement.remove();
  shown = "";
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

  const word = getWordAtRange(wordRange);
  if (!word || word == shown) {
    return;
  }

  removeTooltip();

  found = word;
  clearTimeout(timer);
  timer = setTimeout(() => {
    addTooltip(
      { x: event.clientX, y: event.clientY },
      wordRange.getBoundingClientRect()
    );
  }, 300);
});

document.addEventListener("scroll", () => {
  removeTooltip();
});
