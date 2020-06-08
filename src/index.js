import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as yup from 'yup';
import { watch } from 'melanke-watchjs';
import axios from 'axios';

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
  watch(data, 'news', () => {
    const newsItems = data.news.map((news) => {
      const newItem = document.createElement('li');
      newItem.innerHTML = `<a href="${news.url}">${news.title}</a>`;
      return newItem;
    });
    elements.newsList.innerHTML = '';
    elements.newsList.append(...newsItems);
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

  const parseNews = (rawData) => {
    const parser = new DOMParser();
    const parsedResponse = parser.parseFromString(rawData.data, 'application/xml');
    const newsElements = [...parsedResponse.getElementsByTagName('item')];
    return newsElements.map((newsElem) => ({
      title: newsElem.querySelector('title').innerHTML,
      url: newsElem.querySelector('link').innerHTML,
    }));
  };

  const loadNews = () => data.channels
    .map((channel) => axios
      .get(channel)
      .then(parseNews)
      .catch(() => {
        console.log(`Data cannot be fetched. URL: ${channel}`);
        return [];
      }));

  elements.formAdd.addEventListener('submit', (e) => {
    e.preventDefault();
    validateChannel()
      .then((result) => {
        if (result === false) throw new Error();
        state.process = 'sending';
        data.channels.push(state.urlChannel);
      })
      .then(loadNews)
      .then((news) => {
        data.news.push(...news);
        console.log(data.news);
        state.urlChannel = '';
        state.process = 'filling';
      })
      .catch(() => {
        console.error('Cannot load a channel');
      });
  });
};

main();
