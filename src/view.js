
import onChange from 'on-change';

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

  const makeChannelsLIElems = () => state.data.channels
    .map((channel) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${channel}">${channel}</a>`;
      return newItem;
    });

  const makePostsLIElems = () => state.data.posts
    .map(({ url, title }) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
      return newItem;
    });

  const watchedState = onChange(state,
    (path, value) => {
      console.log(`onChange: path=${path}; value=${value}`);
      switch (path) {
        case 'state':
          if (value === 'valid') {
            elements.feedbackSuccessAdd.textContent = state.feedback;
            elements.inputUrlAdd.classList.remove('is-invalid');
            elements.feedbackSuccessAdd.classList.remove('d-none');
            break;
          }
          elements.feedbackFailAdd.textContent = state.feedback;
          elements.feedbackSuccessAdd.classList.add('d-none');
          elements.inputUrlAdd.classList.add('is-invalid');
          break;

        case 'process':
          if (value === 'fetching') {
            elements.buttonAdd.disabled = true;
            elements.inputUrlAdd.disabled = true;
            break;
          }
          if (value === 'fetched') {
            elements.inputUrlAdd.value = '';
          }
          elements.buttonAdd.disabled = false;
          elements.inputUrlAdd.disabled = false;
          break;

        case 'data.channels':
          elements.channelsList.innerHTML = '';
          elements.channelsList.append(...makeChannelsLIElems());
          break;

        case 'data.posts':
          elements.postsList.innerHTML = '';
          elements.postsList.append(...makePostsLIElems());
          break;

        default:
      }
    });

  return watchedState;
};


// /* eslint no-param-reassign: ["error", { "props": false }] */

/* import onChange from 'on-change';

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

  const makeChannelsLIElems = (channels) => channels
    .map((channel) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${channel}">${channel}</a>`;
      return newItem;
    });

  const makePostsLIElems = () => state.data.posts
    .map(({ url, title }) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
      return newItem;
    });

  const renderInvalid = (elems, s) => {
    elems.feedbackFailAdd.textContent = s.feedback;
    elems.feedbackSuccessAdd.classList.add('d-none');
    elems.inputUrlAdd.classList.add('is-invalid');
  };

  const renderValid = (elems, s) => {
    elems.feedbackSuccessAdd.textContent = s.feedback;
    elems.inputUrlAdd.classList.remove('is-invalid');
    elems.feedbackSuccessAdd.classList.remove('d-none');
  }

  const enableControls = (elems) => {
    elems.buttonAdd.disabled = false;
    elems.inputUrlAdd.disabled = false;
  }

  const disableControls = (elems) => {
    elems.buttonAdd.disabled = true;
    elems.inputUrlAdd.disabled = true;
  };

  const renderers = {
    state: (value) => {
      if (value.startsWith('invalid')) return renderInvalid;
      return renderValid;
    },
    process: (value) => {
      if (value === 'filling') return enableControls;
      if (value === 'fetching') {
        return (elems) => {
          elems.feedbackSuccessAdd.textContent = '';
          disableControls(elems);
        };
      }
      if (value === 'fetched') {
        return (elems) => {
          elems.inputUrlAdd.value = '';
          enableControls(elems);
        };
      }
    },
    'data.channels': (data) => {
        return (elems) => {}
        elems.channelsList.innerHTML = '';
        elems.channelsList.append(...makeChannelsLIElems(data));
      },
    },
  };

  const render = (cond, elements, state) => {
    const renderer = renderers[cond];
    if (renderer) renderer(elements, state);
  };

  const watchedState = onChange(state,
    function _onChangeCallback(path, value) {
      console.log(`path: ${path}, value: ${value}`);
      const render = (renders[path] || [])[value];
      if (render) render(elements, this);
      switch (path) {
        case 'data.channels':
          break;

        case 'data.posts':
          elements.postsList.innerHTML = '';
          elements.postsList.append(...makePostsLIElems());
          break;

        default:
      }
    });

  return watchedState;
};
*/
