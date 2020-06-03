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
  const form = document.querySelector('.add-channel-form');
  const elements = {
    form,
    urlInput: form.querySelector('#urlToChannel'),
    urlFeedback: form.querySelector('.feedback'),
    submit: form.querySelector('button[type="submit"]'),
  };

  const state = {
    process: 'filling',
    urlChannel: '',
    validChannel: true,
    feedbackChannel: '',
  };

  // View
  watch(state, 'validChannel', () => {
    if (state.validChannel) {
      elements.urlInput.classList.remove('is-invalid');
      return;
    }
    elements.urlFeedback.textContent = state.feedbackChannel;
    elements.urlInput.classList.add('is-invalid');
  });
  watch(state, 'process', () => {
    console.log(state.process);
    if (state.process === 'sending') {
      elements.urlInput.value = '';
      elements.submit.disabled = true;
      return;
    }
    elements.submit.disabled = false;
  });

  // Controller
  const validateChannel = () => schema
    .validate({ urlChannel: elements.urlInput.value })
    .then(() => {
      state.urlChannel = elements.urlInput.value;
      state.validChannel = true;
      return true;
    })
    .catch(() => {
      state.validChannel = false;
      state.feedbackChannel = 'Wrong channel URL!';
      return false;
    });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    validateChannel()
      .then((result) => {
        if (result === false) return;
        state.process = 'sending';
        setTimeout(() => {
          state.process = 'filling';
        }, 3000);
      });
  });
  // addButtonElement.addEventListener('click');
};

main();
