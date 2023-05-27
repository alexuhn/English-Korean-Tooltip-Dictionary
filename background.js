const fetchMeaning = async (word) => {
  const requestUrl = new URL("http://tooltip.dic.naver.com/tooltip.nhn");
  requestUrl.searchParams.append("wordString", word);
  requestUrl.searchParams.append("languageCode", 4);

  const response = await fetch(requestUrl);
  const jsonResponse = await response.json();
  const meaning = jsonResponse.mean;
  if (!meaning) {
    return "";
  }
  return meaning.join(", ");
};

chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  (async function () {
    const meaning = await fetchMeaning(request.word);
    sendResponse({ meaning });
  })();
  return true;
});
