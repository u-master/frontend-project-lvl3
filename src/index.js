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
  console.log('Main function executed');

  const elements = {
    form: document.querySelector('.add-channel-form'),
    urlInput: this.form.querySelector('#urlToChannel'),
    urlFeedback: this.form.querySelector('.feedback'),
    submit: this.form.querySelector('button[type="submit"]'),
  };

  console.log(elements);

  const state = {
    urlChannel: '',
    validChannel: true,
    feedbackChannel: '',
    validForm: false,
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

  watch(state, 'validForm', () => {
    elements.submit.disabled = state.validForm;
  });

  // Controller
  const validate = () => {
    schema.isValid({ urlChannel: elements.urlInput.value })
      .then(() => {
        state.urlChannel = elements.urlInput.value;
        state.validChannel = true;
        state.validForm = true;
      })
      .catch(() => {
        state.validChannel = (elements.urlInput.value === '');
        state.feedbackChannel = 'Wrong channel URL!';
        state.validForm = false;
      });
  };
  elements.urlInput.addEventListener('input', validate);
  // addButtonElement.addEventListener('click');
};

main();
