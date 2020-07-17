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

const formStateRenderers = {
  invalid: (elements, error) => setErrorFeedback(elements, error),
  empty: (elements) => {
    elements.inputUrlAdd.value = '';
  },
  valid: () => {},
};

const loadingStateRenderers = {
  fetching: (elements) => disableControls(elements),
  fetched: (elements) => {
    setSuccessFeedback(elements, 'loaded');
    enableControls(elements);
  },
  failed: (elements, error, errorData) => {
    setErrorFeedback(elements, error, errorData);
    enableControls(elements);
  },
};

const renderers = {
  form: (elements, { state, error }) => {
    formStateRenderers[state](elements, error);
  },
  loadingProcess: (elements, { state, error, errorData }) => {
    loadingStateRenderers[state](elements, error, errorData);
  },
  channels: (elements, channels) => {
    elements.channelsList.innerHTML = channels.map(buildLinkString).join('\n');
  },
  posts: (elements, posts) => {
    elements.postsList.innerHTML = posts.map(buildLinkString).join('\n');
  },
};

export default (elements) => (changed, value) => {
  const render = renderers[changed];
  render(elements, value);
};
