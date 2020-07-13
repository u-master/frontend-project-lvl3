/* eslint no-param-reassign: ["error", { "props": false }] */

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';

import renderView from './view.js';
import parsePosts from './parse-rss.js';
import resources from './locales';


const intervalPostsUpdate = 5000;

const intervalFetchTimeout = 5000;

const getProxiedUrl = (url) => {
  const urlProxy = 'https://cors-anywhere.herokuapp.com/';
  return `${urlProxy}${url}`;
  // const urlProxy = 'https://api.allorigins.win/raw?url=';
  // return `${urlProxy}${encodeURIComponent(url)}`;
  // return url;
};

const fetchChannel = (urlChannel) => {
  const proxiedUrl = getProxiedUrl(urlChannel);
  return axios.get(proxiedUrl, { timeout: intervalFetchTimeout });
};

const updatePosts = (state) => {
  const oldTitles = state.posts.map(({ title }) => title);
  const updaters = state.channels
    .map(({ urlRss }) => fetchChannel(urlRss)
      .then((rawRss) => {
        const { posts } = parsePosts(rawRss);
        const newPosts = posts.filter(({ title }) => (!oldTitles.includes(title)));
        state.posts.unshift(...newPosts);
      })
      .catch((error) => {
        if (!error.isAxiosError && !error.isParseRssError) throw error;
      }));
  Promise.all(updaters)
    .finally(() => setTimeout(updatePosts, intervalPostsUpdate, state));
};

// Controller

const validateUrl = (state, url, schema) => {
  try {
    schema.validateSync(url);
  } catch (err) {
    if (err.name === 'ValidationError') {
      state.form = { state: 'invalid', error: err.message };
      return false;
    }
    throw err;
  }
  state.form = { state: 'valid' };
  return true;
};

const addChannel = (state, urlRss) => {
  state.loadingProcess = { state: 'fetching' };
  fetchChannel(urlRss)
    .then((rawRss) => {
      const rssData = parsePosts(rawRss);
      state.channels.push({ title: rssData.title, url: rssData.url, urlRss });
      state.posts.unshift(...rssData.posts);
      state.loadingProcess = { state: 'fetched' };
      state.form = { state: 'empty' };
    })
    .catch((error) => {
      if (!error.isAxiosError && !error.isParseRssError) throw error;
      if (error.isAxiosError) {
        state.loadingProcess = { state: 'fetch-failed', error: 'cannotFetch', errorData: { errorDetails: error.message } };
      } else {
        state.loadingProcess = { state: 'fetch-failed', error: 'cannotParse' };
      }
    });
};

const run = () => {
  const formAddChannel = document.querySelector('.add-channel-form');

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  });

  const state = onChange(
    {
      loadingProcess: {
        state: 'ready',
        error: null,
      },
      form: {
        state: 'empty',
        error: null,
      },
      channels: [],
      posts: [],
    },
    renderView,
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

  setTimeout(updatePosts, intervalPostsUpdate, state);
};

export default run;
