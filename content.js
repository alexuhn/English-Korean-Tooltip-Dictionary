let currentWord = "";

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
  if (word === currentWord) {
    return currentWord;
  }
  return word;
};

document.addEventListener("mousemove", function (event) {
  const range = document.caretRangeFromPoint(event.clientX, event.clientY);
  const word = getWordAtRange(range);
});
