/* eslint no-param-reassign: ["error", { "props": false }] */

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';

import initView from './view.js';
import parsePosts from './parse-rss.js';
import resources from './locales';

const getProxiedUrl = (url) => {
  // const urlProxy = 'https://cors-anywhere.herokuapp.com/';
  const urlProxy = 'https://api.allorigins.win/raw?url=';
  return `${urlProxy}${encodeURIComponent(url)}`;
};

const fetchChannel = (urlChannel) => {
  const proxiedUrl = getProxiedUrl(urlChannel);
  return axios.get(proxiedUrl);
};

const updatePosts = (state, intervalPostsUpdate) => {
  const oldTitles = state.posts.map(({ title }) => title);
  const updaters = state.channels
    .map(({ urlRss }) => fetchChannel(urlRss)
      .then((rawRss) => {
        let posts;
        try {
          posts = parsePosts(rawRss).posts;
        } catch (error) {
          return;
        }
        const newPosts = posts.filter(({ title }) => (!oldTitles.includes(title)));
        state.posts.unshift(...newPosts);
      }));
  Promise.all(updaters)
    .finally(() => setTimeout(updatePosts, intervalPostsUpdate, state, intervalPostsUpdate));
};

// Controller

const validateUrl = (state, url, schema) => {
  try {
    schema.validateSync(url);
  } catch (err) {
    if (err.name === 'ValidationError') {
      state.validState = (err.type === 'isNotExist') ? 'invalid-exist' : 'invalid-wrong';
      state.process = 'filling';
      return false;
    }
    throw err;
  }
  state.validState = 'valid-ready';
  state.process = 'filled';
  return true;
};

const addChannel = (state, urlRss) => {
  state.process = 'fetching';
  fetchChannel(urlRss)
    .then((rawRss) => {
      let rssData;
      try {
        rssData = parsePosts(rawRss);
      } catch (error) {
        state.validState = 'invalid-parse';
        state.process = 'filling';
        return;
      }
      state.channels.push({ title: rssData.title, url: rssData.url, urlRss });
      state.posts.unshift(...rssData.posts);
      state.validState = 'valid-loaded';
      state.process = 'fetched';
    })
    .catch(({ message }) => {
      state.validState = 'invalid-fetch';
      state.process = 'filling';
      console.error(message);
    });
};

const app = () => {
  const formAddChannel = document.querySelector('.add-channel-form');

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  });

  const state = initView(
    {
      process: 'filling',
      validState: 'valid-initial',
      error: null,
      feedback: '',
      channels: [],
      posts: [],
    },
  );

  const schemaUrl = yup
    .string()
    .required()
    .url(() => i18next.t('invalid-wrong'))
    .test('isNotExist', () => i18next.t('invalid-exist'), (value) => !state.channels.map(({ urlRss }) => urlRss).includes(value));

  formAddChannel.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('urlToChannel').trim();
    if (validateUrl(state, url, schemaUrl)) {
      addChannel(state, url);
    }
  });

  const intervalPostsUpdate = 5000;

  setTimeout(updatePosts, intervalPostsUpdate, state, intervalPostsUpdate);
};

export default app;
