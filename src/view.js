/* eslint no-param-reassign: ["error", { "props": false }] */

import onChange from 'on-change';
import i18next from 'i18next';

import resources from './locales';

const makeChannelsLIElems = (channels) => channels
  .map((channel) => {
    const newItem = document.createElement('li');
    newItem.innerHTML = `<a href="${channel}">${channel}</a>`;
    return newItem;
  });

const makePostsLIElems = (posts) => posts
  .map(({ url, title }) => {
    const newItem = document.createElement('li');
    newItem.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
    return newItem;
  });

const renderInvalid = (elements, state) => {
  elements.feedbackFailAdd.textContent = i18next.t(`feedbacks.${state.validState}`);
  elements.feedbackSuccessAdd.classList.add('d-none');
  elements.inputUrlAdd.classList.add('is-invalid');
};

const renderValid = (elements, state) => {
  elements.feedbackSuccessAdd.textContent = i18next.t(`feedbacks.${state.validState}`);
  elements.inputUrlAdd.classList.remove('is-invalid');
  elements.feedbackSuccessAdd.classList.remove('d-none');
};

const enableControls = (elements) => {
  elements.buttonAdd.disabled = false;
  elements.inputUrlAdd.disabled = false;
};

const disableControls = (elements) => {
  elements.buttonAdd.disabled = true;
  elements.inputUrlAdd.disabled = true;
};

const renderers = [
  {
    check: (key, value) => (key === 'validState' && value.startsWith('invalid')),
    render: renderInvalid,
  },
  {
    check: (key, value) => (key === 'validState' && value.startsWith('valid')),
    render: renderValid,
  },
  {
    check: (key, value) => (key === 'process' && value === 'fetching'),
    render: disableControls,
  },
  {
    check: (key, value) => (key === 'process' && value === 'fetched'),
    render: (elements) => {
      elements.inputUrlAdd.value = '';
      enableControls(elements);
    },
  },
  {
    check: (key, value) => (key === 'process' && value === 'filling'),
    render: enableControls,
  },
  {
    check: (key) => (key === 'channels'),
    render: (elements, { channels }) => {
      const channelsListItems = makeChannelsLIElems(channels);
      elements.channelsList.innerHTML = '';
      elements.channelsList.append(...channelsListItems);
    },
  },
  {
    check: (key) => (key === 'posts'),
    render: (elements, { posts }) => {
      const postsListItems = makePostsLIElems(posts);
      elements.postsList.innerHTML = '';
      elements.postsList.append(...postsListItems);
    },
  },
];

export default (state) => {
  const formAddChannel = document.querySelector('.add-channel-form');
  const elements = {
    inputUrlAdd: formAddChannel.querySelector('#urlToChannel'),
    feedbackFailAdd: formAddChannel.querySelector('.feedback-fail'),
    feedbackSuccessAdd: document.querySelector('.feedback-success'),
    buttonAdd: formAddChannel.querySelector('button[type="submit"]'),
    channelsList: document.querySelector('.channels-list'),
    postsList: document.querySelector('.posts-list'),
  };

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  });

  const watchedState = onChange(state,
    (path, value) => {
      const { render } = renderers.find(({ check }) => check(path, value)) || {};
      if (render) render(elements, state);
    });

  return watchedState;
};
