
import { watch } from 'melanke-watchjs';

export default (state, data) => {
  const formAddChannel = document.querySelector('.add-channel-form');
  const elements = {
    inputUrlAdd: formAddChannel.querySelector('#urlToChannel'),
    feedbackAdd: formAddChannel.querySelector('.feedback'),
    buttonAdd: formAddChannel.querySelector('button[type="submit"]'),
    channelsList: document.querySelector('.channels-list'),
    postsList: document.querySelector('.posts-list'),
  };

  watch(state, 'stateChannel', () => {
    if (state.stateChannel === 'valid') {
      elements.inputUrlAdd.classList.remove('is-invalid');
      return;
    }
    elements.feedbackAdd.textContent = state.feedbackChannel;
    elements.inputUrlAdd.classList.add('is-invalid');
  });
  watch(state, 'process', () => {
    if (state.process === 'fetching') {
      elements.buttonAdd.disabled = true;
      return;
    }
    if (state.process === 'fetched') {
      elements.inputUrlAdd.value = '';
    }
    elements.buttonAdd.disabled = false;
  });
  watch(data, 'channels', () => {
    const channelsItems = data.channels.map((channel) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${channel}">${channel}</a>`;
      return newItem;
    });
    elements.channelsList.innerHTML = '';
    elements.channelsList.append(...channelsItems);
  });
  watch(data, 'posts', () => {
    const postsItems = data.posts.map((post) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${post.url}">${post.title}</a>`;
      return newItem;
    });
    elements.postsList.innerHTML = '';
    elements.postsList.append(...postsItems);
  });
};
