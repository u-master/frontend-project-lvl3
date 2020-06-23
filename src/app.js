/* eslint no-param-reassign: ["error", { "props": false }] */

import * as yup from 'yup';
import axios from 'axios';

import initView from './view.js';
import parsePosts from './parse-rss.js';

const getProxiedUrl = (url) => {
  const urlProxy = 'https://cors-anywhere.herokuapp.com/';
  return `${urlProxy}${url}`;
};

const fetchChannel = (urlChannel) => {
  const proxiedUrl = getProxiedUrl(urlChannel);
  return axios.get(proxiedUrl);
};

const updatePosts = (state, intervalPostsUpdate) => {
  const oldTitles = state.posts.map(({ title }) => title);
  const updaters = state.channels
    .map((channel) => fetchChannel(channel)
      .then((rawRss) => {
        let posts;
        try {
          posts = parsePosts(rawRss);
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

const validateUrl = (state, url) => {
  const schemaUrl = yup.string().required().url().notOneOf(state.channels);
  try {
    schemaUrl.validateSync(url);
  } catch (err) {
    if (err.name === 'ValidationError') {
      state.validState = (err.type === 'notOneOf') ? 'invalid-exist' : 'invalid-wrong';
      state.process = 'filling';
      return false;
    }
    throw err;
  }
  state.validState = 'valid-ready';
  state.process = 'filled';
  return true;
};

const addChannel = (state, urlChannel) => {
  state.process = 'fetching';
  fetchChannel(urlChannel)
    .then((rawRss) => {
      let posts;
      try {
        posts = parsePosts(rawRss);
      } catch (error) {
        state.validState = 'invalid-parse';
        state.process = 'filling';
        return;
      }
      state.channels.push(urlChannel);
      state.posts.unshift(...posts);
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

  const state = initView(
    {
      process: 'filling',
      validState: 'valid-initial',
      feedback: '',
      channels: [],
      posts: [],
    },
  );

  formAddChannel.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('urlToChannel').trim();
    if (validateUrl(state, url)) {
      addChannel(state, url);
    }
  });

  const intervalPostsUpdate = 5000;

  setTimeout(updatePosts, intervalPostsUpdate, state, intervalPostsUpdate);
};

export default app;
