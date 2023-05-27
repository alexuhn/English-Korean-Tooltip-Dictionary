let shown;
let found;
let foundRange;
let timer;

// Reference: https://stackoverflow.com/a/49961880
const getWordAtRange = (range) => {
  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    return null;
  }
  range.expand("word");

  const word = range.toString().trim();
  if (word === "") {
    return null;
  }
  if (!/^[A-Za-z]+$/.test(word)) {
    return null;
  }
  return word;
};

const addTooltip = () => {
  if (shown == found) {
    return;
  }
  shown = found;

  const tooltip = document.createElement("div");
  tooltip.id = "tooltip-result";
  tooltip.textContent = shown;

  const rangeRect = foundRange.getBoundingClientRect();
  tooltip.style.left = `${rangeRect.left}px`;
  tooltip.style.top = `${rangeRect.bottom}px`;
  tooltip.style.position = "fixed";
  tooltip.style.zIndex = 999999;
  tooltip.style.backgroundColor = "#fafafa";
  tooltip.style.fontSize = "16px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.padding = "4px";
  tooltip.style.boxShadow = "rgba(0, 0, 0, 0.35) 0px 5px 15px;";

  document.body.appendChild(tooltip);
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
  foundRange = range;

  const word = getWordAtRange(range);
  if (!word || word == shown) {
    return;
  }

  removeTooltip();

  found = word;
  clearTimeout(timer);
  timer = setTimeout(() => {
    addTooltip();
  }, 300);
});
