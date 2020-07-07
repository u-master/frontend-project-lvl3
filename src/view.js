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
};

const resetFeedback = (elements) => {
  elements.feedbackSuccessAdd.textContent = '';
  elements.inputUrlAdd.classList.remove('is-invalid');
  elements.feedbackSuccessAdd.classList.add('d-none');
};

const applyFeedback = (elements, feedbackType, { type, data }) => {
  if (feedbackType === 'success') {
    elements.feedbackAdd.classList.remove('invalid-feedback');
    elements.feedbackAdd.classList.add('valid-feedback');
  }
  if (feedbackType === 'error') {
    elements.feedbackAdd.classList.remove('valid-feedback');
    elements.feedbackAdd.classList.add('invalid-feedback');
  }
}; */


const setErrorFeedback = (elements, errorType, errorData) => {
  elements.feedbackErrorAdd.textContent = i18next.t(`error.${errorType}`, errorData);
  elements.inputUrlAdd.classList.add('is-invalid');
  elements.feedbackSuccessAdd.classList.add('d-none');
};

const setSuccessFeedback = (elements, successType) => {
  elements.feedbackSuccessAdd.textContent = i18next.t(`success.${successType}`);
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

const buildLinkString = ({ url, title }) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`;

const renderers = {
  formState: (elements, { name, error }) => {
    if (name === 'invalid') setErrorFeedback(elements, error);
    if (name === 'empty') elements.inputUrlAdd.value = '';
  },
  process: (elements, { name, error, errorData }) => {
    if (name === 'fetching') {
      disableControls(elements);
      return;
    }
    if (name === 'fetched') setSuccessFeedback(elements, 'loaded');
    if (name === 'fetch-failed') setErrorFeedback(elements, error, errorData);
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
    feedbackErrorAdd: formAddChannel.querySelector('.feedback-error'),
    feedbackSuccessAdd: document.querySelector('.feedback-success'),
    buttonAdd: formAddChannel.querySelector('button[type="submit"]'),
    channelsList: document.querySelector('.channels-list'),
    postsList: document.querySelector('.posts-list'),
  };

  const watchedState = onChange(state,
    (path, value) => {
      const render = renderers[path];
      if (render) render(elements, value);
    });

  return watchedState;
};
