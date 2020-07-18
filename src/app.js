/* eslint no-param-reassign: ["error", { "props": false }] */

import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import { uniqueId, differenceBy } from 'lodash';

import initWatcher from './view.js';
import parseRss from './parse-rss.js';
import resources from './locales';


const intervalPostsUpdate = 5000;

const intervalFetchTimeout = 5000;

const getProxiedUrl = (url) => {
  const urlProxy = 'https://cors-anywhere.herokuapp.com/';
  return `${urlProxy}${url}`;
  // const urlProxy = 'https://api.allorigins.win/raw?url=';
  // return `${urlProxy}${encodeURIComponent(url)}`;
};

const fetchChannel = (urlChannel) => {
  const proxiedUrl = getProxiedUrl(urlChannel);
  return axios.get(proxiedUrl, { timeout: intervalFetchTimeout });
};

const fetchNewPosts = (state) => {
  const updaters = state.channels
    .map(({ id, urlRss }) => fetchChannel(urlRss)
      .then((rawRss) => {
        const oldPosts = state.posts.filter(({ idChannel }) => idChannel === id);
        const { posts } = parseRss(rawRss);
        const newPosts = differenceBy(posts, oldPosts, 'url').map((post) => ({ ...post, idChannel: id }));
        state.posts.unshift(...newPosts);
      }));
  Promise.all(updaters)
    .finally(() => setTimeout(fetchNewPosts, intervalPostsUpdate, state));
};

const validateUrl = (state, url) => {
  const channelsUrls = state.channels.map(({ urlRss }) => urlRss);
  const schema = yup
    .string()
    .required()
    .url('wrongURL')
    .notOneOf(channelsUrls, 'alreadyExist');
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
      const id = uniqueId();
      const { title, url, posts } = parseRss(rawRss);
      state.channels.push({
        id, title, url, urlRss,
      });
      state.posts.unshift(...posts.map((post) => ({ ...post, idChannel: id })));
      state.loadingProcess = { state: 'fetched' };
      state.form = { state: 'empty' };
    })
    .catch((error) => {
      if (error.isAxiosError) {
        state.loadingProcess = { state: 'failed', error: 'cannotFetch', errorData: { errorDetails: error.message } };
        return;
      }
      if (error.isParseRssError) {
        state.loadingProcess = { state: 'failed', error: 'cannotParse' };
        return;
      }
      throw error;
    });
};

const run = () => {
  const formAddChannel = document.querySelector('.add-channel-form');
  const elements = {
    inputUrlAdd: formAddChannel.querySelector('#urlToChannel'),
    feedbackErrorAdd: formAddChannel.querySelector('.feedback-error'),
    feedbackSuccessAdd: document.querySelector('.feedback-success'),
    buttonAdd: formAddChannel.querySelector('button[type="submit"]'),
    channelsList: document.querySelector('.channels-list'),
    postsList: document.querySelector('.posts-list'),
  };

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  });

  const watcher = initWatcher(elements);
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
    watcher,
  );

  formAddChannel.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('urlToChannel').trim();
    if (validateUrl(state, url)) {
      addChannel(state, url);
    }
  });

  fetchNewPosts(state);
};

export default run;
