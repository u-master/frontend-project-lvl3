
export default (rawData) => {
  const parser = new DOMParser();
  const parsedResponse = parser.parseFromString(rawData.data, 'text/xml');
  if (parsedResponse.querySelector('parsererror')) {
    const e = new Error('Wrong data format received');
    e.isParseRssError = true;
    throw e;
  }
  const title = parsedResponse.querySelector('title').textContent;
  const url = parsedResponse.querySelector('link').textContent;
  const description = parsedResponse.querySelector('description').textContent;
  const pubDate = parsedResponse.querySelector('pubDate').textContent;
  const postElements = [...parsedResponse.getElementsByTagName('item')];
  const posts = postElements.map((postElement) => ({
    title: postElement.querySelector('title').textContent,
    url: postElement.querySelector('link').textContent,
    description: postElement.querySelector('description').textContent,
    pubDate: postElement.querySelector('pubDate').textContent,
  }));
  return {
    title,
    url,
    description,
    pubDate,
    posts,
  };
};
