
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';

import initView from './view.js';
import parsePosts from './parse-rss.js';
import resources from './locales';

const state = initView(
  {
    process: 'filling',
    state: 'initial',
    feedback: '',
    data: {
      channels: [],
      posts: [],
    },
  },
);

i18next.init({
  lng: 'en',
  debug: false,
  resources,
});

const schemaUrl = yup.string().url();

const isWrongUrl = (urlChannel) => !schemaUrl.isValidSync(urlChannel);
const isExistUrl = (urlChannel) => state.data.channels.includes(urlChannel);

const fetchChannel = (urlChannel) => {
  const urlProxy = 'https://cors-anywhere.herokuapp.com/';
  return axios.get(`${urlProxy}${urlChannel}`);
};

const updatePosts = (intervalPostsUpdate) => {
  const oldTitles = state.data.posts.map(({ title }) => title);
  const updaters = state.data.channels
    .map((channel) => fetchChannel(channel)
      .then(parsePosts)
      .then((posts) => {
        const newPosts = posts.filter(({ title }) => (!oldTitles.includes(title)));
        state.data.posts.unshift(...newPosts);
      }));
  Promise.all(updaters)
    .finally(() => setTimeout(updatePosts, intervalPostsUpdate, intervalPostsUpdate));
};

// Controller

const setState = (stateName) => {
  state.feedback = i18next.t(`feedbacks.${stateName}`);
  state.state = stateName;
  state.process = (stateName === 'valid') ? 'fetched' : 'filling';
};

const addChannel = (urlChannel) => {
  state.process = 'fetching';
  if (isWrongUrl(urlChannel)) {
    setState('invalid-wrong');
    return;
  }
  if (isExistUrl(urlChannel)) {
    setState('invalid-exist');
    return;
  }
  fetchChannel(urlChannel)
    .then((rawRss) => {
      let posts = {};
      try {
        posts = parsePosts(rawRss);
      } catch (error) {
        setState('invalid-parse');
        return;
      }
      state.data.channels.push(urlChannel);
      state.data.posts.unshift(...posts);
      setState('valid');
    })
    .catch(({ message }) => {
      setState('invalid-fetch');
      console.error(message);
    });
};

const app = (intervalPostsUpdate) => {
  const formAddChannel = document.querySelector('.add-channel-form');

  formAddChannel.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('urlToChannel').trim();
    addChannel(url);
  });

  setTimeout(updatePosts, intervalPostsUpdate, intervalPostsUpdate);
};

export default app;
