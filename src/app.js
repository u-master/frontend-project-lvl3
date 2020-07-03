/* eslint no-param-reassign: ["error", { "props": false }] */

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';

import initView from './view.js';
import parsePosts from './parse-rss.js';
import resources from './locales';

const getProxiedUrl = (url) => {
  // const urlProxy = 'https://cors-anywhere.herokuapp.com/';
  // return `${urlProxy}${url}`;
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
      state.error = { type: err.message };
      state.formState = 'invalid';
      return false;
    }
    throw err;
  }
  state.formState = 'valid';
  return true;
};

const addChannel = (state, urlRss) => {
  state.process = 'fetching';
  fetchChannel(urlRss)
    .then((rawRss) => {
      const rssData = parsePosts(rawRss);
      state.channels.push({ title: rssData.title, url: rssData.url, urlRss });
      state.posts.unshift(...rssData.posts);
      state.process = 'fetched';
      state.formState = 'empty';
    })
    .catch((error) => {
      if (!error.isAxiosError && !error.isParseRssError) throw error;
      if (error.isAxiosError) {
        state.error = { type: 'cannotFetch', data: { statusCode: error.response.status, statusText: error.response.statusText } };
      } else {
        state.error = { type: 'cannotParse' };
      }
      state.process = 'fetch-failed';
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
      process: 'ready',
      formState: 'empty',
      error: null, // { type: 'error-type', data: { extraField1: 'data1', extraField2: 'data2' } }
      channels: [],
      posts: [],
    },
  );

  const schemaUrl = yup
    .string()
    .required()
    .url('wrongURL')
    .test('notExist', 'alreadyExist', (value) => !state.channels.map(({ urlRss }) => urlRss).includes(value));

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
