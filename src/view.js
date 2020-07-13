/* eslint no-param-reassign: ["error", { "props": false }] */

import i18next from 'i18next';

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
  form: (elements, { state, error }) => {
    if (state === 'invalid') setErrorFeedback(elements, error);
    if (state === 'empty') elements.inputUrlAdd.value = '';
  },
  loadingProcess: (elements, { state, error, errorData }) => {
    if (state === 'fetching') {
      disableControls(elements);
      return;
    }
    if (state === 'fetched') setSuccessFeedback(elements, 'loaded');
    if (state === 'fetch-failed') setErrorFeedback(elements, error, errorData);
    enableControls(elements);
  },
  channels: (elements, channels) => {
    elements.channelsList.innerHTML = channels.map(buildLinkString).join('\n');
  },
  posts: (elements, posts) => {
    elements.postsList.innerHTML = posts.map(buildLinkString).join('\n');
  },
};

export default (changed, value) => {
  const formAddChannel = document.querySelector('.add-channel-form');
  const elements = {
    inputUrlAdd: formAddChannel.querySelector('#urlToChannel'),
    feedbackErrorAdd: formAddChannel.querySelector('.feedback-error'),
    feedbackSuccessAdd: document.querySelector('.feedback-success'),
    buttonAdd: formAddChannel.querySelector('button[type="submit"]'),
    channelsList: document.querySelector('.channels-list'),
    postsList: document.querySelector('.posts-list'),
  };

  const render = renderers[changed];
  if (render) render(elements, value);
};
