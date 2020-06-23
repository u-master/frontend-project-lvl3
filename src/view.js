/* eslint no-param-reassign: ["error", { "props": false }] */

import onChange from 'on-change';
import i18next from 'i18next';

import resources from './locales';

const getFeedbackText = (state) => i18next.t(`feedbacks.${state}`);

const renderInvalid = (elements, validState) => {
  elements.feedbackFailAdd.textContent = getFeedbackText(validState);
  elements.feedbackSuccessAdd.classList.add('d-none');
  elements.inputUrlAdd.classList.add('is-invalid');
};

const renderValid = (elements, validState) => {
  elements.feedbackSuccessAdd.textContent = getFeedbackText(validState);
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

const buildChannelString = (channel) => `<li><a href="${channel}">${channel}</a></li>`;

const buildPostString = ({ url, title }) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`;

const renderers = {
  validState: (elements, validState) => {
    if (validState.startsWith('invalid')) renderInvalid(elements, validState);
    else renderValid(elements, validState);
  },
  process: (elements, process) => {
    if (process === 'fetching') {
      disableControls(elements);
      return;
    }
    if (process === 'fetched') {
      elements.inputUrlAdd.value = '';
    }
    enableControls(elements);
  },
  channels: (elements, channels) => {
    elements.channelsList.innerHTML = channels.map(buildChannelString);
  },
  posts: (elements, posts) => {
    elements.postsList.innerHTML = posts.map(buildPostString);
  },
};

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
      const render = renderers[path];
      if (render) render(elements, value);
    });

  return watchedState;
};
