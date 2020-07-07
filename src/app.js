/* eslint no-param-reassign: ["error", { "props": false }] */

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';

import initView from './view.js';
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
    .finally(() => setTimeout(updatePosts, intervalPostsUpdate, state));
};

// Controller

const validateUrl = (state, url, schema) => {
  try {
    schema.validateSync(url);
  } catch (err) {
    if (err.name === 'ValidationError') {
      state.formState = { name: 'invalid', error: err.message };
      return false;
    }
    throw err;
  }
  state.formState = { name: 'valid' };
  return true;
};

const addChannel = (state, urlRss) => {
  state.process = { name: 'fetching' };
  fetchChannel(urlRss)
    .then((rawRss) => {
      const rssData = parsePosts(rawRss);
      state.channels.push({ title: rssData.title, url: rssData.url, urlRss });
      state.posts.unshift(...rssData.posts);
      state.process = { name: 'fetched' };
      state.formState = { name: 'empty' };
    })
    .catch((error) => {
      if (!error.isAxiosError && !error.isParseRssError) throw error;
      if (error.isAxiosError) {
        state.process = { name: 'fetch-failed', error: 'cannotFetch', errorData: { statusText: error.message } };
      } else {
        state.process = { name: 'fetch-failed', error: 'cannotParse' };
      }
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
      process: {
        name: 'ready',
        error: null,
      },
      formState: {
        name: 'empty',
        error: null,
      },
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

  setTimeout(updatePosts, intervalPostsUpdate, state);
};

export default app;
