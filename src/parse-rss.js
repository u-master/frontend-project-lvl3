
const getValue = (element, valueName) => element.querySelector(valueName).textContent;

export default (rawData) => {
  const parser = new DOMParser();
  const parsedResponse = parser.parseFromString(rawData.data, 'text/xml');
  if (parsedResponse.querySelector('parsererror')) {
    const e = new Error('Wrong data format received');
    e.isParseRssError = true;
    throw e;
  }
  const title = getValue(parsedResponse, 'title');
  const url = getValue(parsedResponse, 'link');
  const description = getValue(parsedResponse, 'description');
  const pubDate = getValue(parsedResponse, 'pubDate');
  const postElements = [...parsedResponse.getElementsByTagName('item')];
  const posts = postElements.map((postElement) => ({
    title: getValue(postElement, 'title'),
    url: getValue(postElement, 'link'),
    description: getValue(postElement, 'description'),
    pubDate: getValue(postElement, 'pubDate'),
  }));
  return {
    title,
    url,
    description,
    pubDate,
    posts,
  };
};
