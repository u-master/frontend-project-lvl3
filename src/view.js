
import onChange from 'on-change';

export default (state, data) => {
  const formAddChannel = document.querySelector('.add-channel-form');
  const elements = {
    inputUrlAdd: formAddChannel.querySelector('#urlToChannel'),
    feedbackAdd: formAddChannel.querySelector('.feedback'),
    buttonAdd: formAddChannel.querySelector('button[type="submit"]'),
    channelsList: document.querySelector('.channels-list'),
    postsList: document.querySelector('.posts-list'),
  };

  const watchedState = onChange(state,
    (path, value) => {
      switch (path) {
        case 'stateChannel':
          if (value === 'valid') {
            elements.inputUrlAdd.classList.remove('is-invalid');
            break;
          }
          elements.feedbackAdd.textContent = state.feedbackChannel;
          elements.inputUrlAdd.classList.add('is-invalid');
          break;

        case 'process':
          if (value === 'fetching') {
            elements.buttonAdd.disabled = true;
            break;
          }
          if (value === 'fetched') {
            elements.inputUrlAdd.value = '';
          }
          elements.buttonAdd.disabled = false;
          break;

        default:
      }
    });

  const makeChannelsLIElems = () => data.channels
    .map((channel) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${channel}">${channel}</a>`;
      return newItem;
    });

  const makePostsLIElems = () => data.posts
    .map(({ url, title }) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${url}">${title}</a>`;
      return newItem;
    });

  const watchedData = onChange(data,
    (path) => {
      switch (path) {
        case 'channels':
          elements.channelsList.innerHTML = '';
          elements.channelsList.append(...makeChannelsLIElems());
          break;

        case 'posts':
          elements.postsList.innerHTML = '';
          elements.postsList.append(...makePostsLIElems());
          break;

        default:
      }
    });

  return { state: watchedState, data: watchedData };
};
