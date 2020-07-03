/* eslint no-param-reassign: ["error", { "props": false }] */

import onChange from 'on-change';
import i18next from 'i18next';

/* const getFeedbackText =
(feedbackType, textType, extraData) => i18next.t(`${feedbackType}.${textType}`, extraData);

const renderInvalid = (elements, { type, data }) => {
  elements.feedbackFailAdd.textContent = getFeedbackText('error', type, data);
  elements.feedbackSuccessAdd.classList.add('d-none');
  elements.inputUrlAdd.classList.add('is-invalid');
};

const renderValid = (elements, { type, data }) => {
  elements.feedbackSuccessAdd.textContent = getFeedbackText('success', type, data);
  elements.inputUrlAdd.classList.remove('is-invalid');
  elements.feedbackSuccessAdd.classList.remove('d-none');
}; */

const resetFeedback = (elements) => {
  elements.feedbackSuccessAdd.textContent = '';
  elements.inputUrlAdd.classList.remove('is-invalid');
  elements.feedbackSuccessAdd.classList.add('d-none');
};

const applyFeedback = (elements, feedbackType, { type, data }) => {
  elements.feedbackFailAdd.textContent = i18next.t(`${feedbackType}.${type}`, data);
  if (feedbackType === 'success') elements.feedbackSuccessAdd.classList.remove('d-none');
  if (feedbackType === 'error') elements.inputUrlAdd.classList.add('is-invalid');
};


const enableControls = (elements) => {
  elements.buttonAdd.disabled = false;
  elements.inputUrlAdd.disabled = false;
};

const disableControls = (elements) => {
  elements.buttonAdd.disabled = true;
  elements.inputUrlAdd.disabled = true;
};

const buildLinkString = ({ url, title }) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`;

const renderers = {
  formState: (elements, formState, state) => {
    resetFeedback(elements);
    if (formState === 'invalid') applyFeedback(elements, 'error', state.error);
    if (formState === 'empty') elements.inputUrlAdd.value = '';
  },
  process: (elements, process, state) => {
    if (process === 'fetching') {
      disableControls(elements);
      return;
    }
    resetFeedback(elements);
    if (process === 'fetched') applyFeedback(elements, 'success', { type: 'loaded' });
    if (process === 'fetch-failed') applyFeedback(elements, 'error', state.error);
    enableControls(elements);
  },
  channels: (elements, channels) => {
    elements.channelsList.innerHTML = channels.map(buildLinkString).join('\n');
  },
  posts: (elements, posts) => {
    elements.postsList.innerHTML = posts.map(buildLinkString).join('\n');
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

  const watchedState = onChange(state,
    function _handle(path, value) {
      const render = renderers[path];
      if (render) render(elements, value, this);
    });

  return watchedState;
};
