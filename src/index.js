import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';

import initView from './view.js';
import parsePosts from './parse-rss.js';
import resources from './locales';

const schema = yup.object().shape({
  urlChannel: yup.string().url(),
});

const { state, data } = initView(
  {
    process: 'filling',
    stateChannel: 'valid',
    feedbackChannel: '',
  },
  {
    channels: [],
    posts: [],
  },
);

const formAddChannel = document.querySelector('.add-channel-form');
const inputUrlAdd = formAddChannel.querySelector('#urlToChannel');

const checks = {
  wrongUrl: (urlChannel) => schema
    .validate({ urlChannel })
    .then(
      () => urlChannel,
      () => { throw new Error('rss-invalid-wrong'); },
    ),
  existUrl: (urlChannel) => (data.channels.includes(urlChannel)
    ? Promise.reject(new Error('rss-invalid-exist'))
    : Promise.resolve(urlChannel)),
  fetchError: ({ message }) => {
    if (message.startsWith('rss-invalid-')) throw new Error(message);
    console.error(message);
    throw new Error('rss-invalid-fetch');
  },
  parseError: ({ message }) => {
    if (message.startsWith('rss-invalid-')) throw new Error(message);
    throw new Error('rss-invalid-parse');
  },
};

i18next.init({
  lng: 'en',
  debug: false,
  resources,
});

const fetchChannel = (urlChannel) => {
  const urlProxy = 'https://cors-anywhere.herokuapp.com/';
  return axios.get(`${urlProxy}${urlChannel}`);
};

const timeoutUpdatePosts = 5000;

const updatePosts = () => {
  const oldTitles = data.posts.map(({ title }) => title);
  const updaters = data.channels
    .map((channel) => fetchChannel(channel)
      .then(parsePosts)
      .then((posts) => {
        const newPosts = posts.filter(({ title }) => (!oldTitles.includes(title)));
        data.posts.push(...newPosts);
      }));
  Promise.all(updaters)
    .finally(() => setTimeout(updatePosts, timeoutUpdatePosts));
};

// Controller

formAddChannel.addEventListener('submit', (e) => {
  e.preventDefault();
  const newUrl = inputUrlAdd.value.trim();
  state.process = 'fetching';
  checks.wrongUrl(newUrl)
    .then(checks.existUrl)
    .then(fetchChannel)
    .catch(checks.fetchError)
    .then(parsePosts)
    .catch(checks.parseError)
    .then((posts) => {
      data.channels.push(newUrl);
      data.posts.push(...posts);
      state.process = 'fetched';
      state.feedbackChannel = '';
      state.stateChannel = 'valid';
    })
    .catch((error) => {
      state.process = 'filling';
      state.feedbackChannel = i18next.t(`feedbacks.${error.message}`);
      state.stateChannel = error.message;
    });
});

setTimeout(updatePosts, timeoutUpdatePosts);
