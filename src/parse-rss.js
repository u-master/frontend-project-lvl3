
export default (rawData) => {
  const parser = new DOMParser();
  const parsedResponse = parser.parseFromString(rawData.data, 'text/xml');
  if (parsedResponse.querySelector('parsererror')) throw new Error('Wrong data format received');
  const postsItems = [...parsedResponse.getElementsByTagName('item')];
  return postsItems.map((newsElem) => ({
    title: newsElem.querySelector('title').textContent,
    url: newsElem.querySelector('link').textContent,
    description: newsElem.querySelector('description').textContent,
    pubDate: newsElem.querySelector('pubDate').textContent,
  }));
};
