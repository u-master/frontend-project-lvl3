import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as yup from 'yup';
import { watch } from 'melanke-watchjs';
// import axios from 'axios';

console.log('RSS reader entry point');

const schema = yup.object().shape({
  urlChannel: yup.string().url(),
});

const main = () => {
  const formAdd = document.querySelector('.add-channel-form');
  const elements = {
    formAdd,
    inputUrlAdd: formAdd.querySelector('#urlToChannel'),
    feedbackAdd: formAdd.querySelector('.feedback'),
    buttonAdd: formAdd.querySelector('button[type="submit"]'),
    channelsList: document.querySelector('.channels-list'),
    newsList: document.querySelector('.news-list'),
  };

  const state = {
    process: 'filling',
    urlChannel: '',
    stateChannel: 'valid',
    feedbackChannel: '',
  };

  const data = {
    channels: [],
    news: [],
  };

  // View
  watch(state, 'stateChannel', () => {
    if (state.stateChannel === 'valid') {
      elements.inputUrlAdd.classList.remove('is-invalid');
      return;
    }
    elements.feedbackAdd.textContent = state.feedbackChannel;
    elements.inputUrlAdd.classList.add('is-invalid');
  });
  watch(state, 'process', () => {
    if (state.process === 'sending') {
      elements.inputUrlAdd.value = '';
      elements.buttonAdd.disabled = true;
      return;
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

  // Controller
  const validateChannel = () => schema
    .validate({ urlChannel: elements.inputUrlAdd.value })
    .then(() => {
      const newUrl = elements.inputUrlAdd.value.trim();
      if (data.channels.includes(newUrl)) {
        state.urlChannel = '';
        state.stateChannel = 'invalid-exist';
        state.feedbackChannel = 'Already in track!';
        return false;
      }
      state.urlChannel = newUrl;
      state.feedbackChannel = '';
      state.stateChannel = 'valid';
      return true;
    })
    .catch(() => {
      state.urlChannel = '';
      state.stateChannel = 'invalid-wrong';
      state.feedbackChannel = 'Wrong channel URL!';
      return false;
    });

  elements.formAdd.addEventListener('submit', (e) => {
    e.preventDefault();
    validateChannel()
      .then((result) => {
        if (result === false) return;
        state.process = 'sending';
        setTimeout(() => {
          data.channels.push(state.urlChannel);
          state.urlChannel = '';
          state.process = 'filling';
        }, 3000);
      });
  });
};

main();
