import ace from 'ace';
import { initializeInput } from './input';
import init from './app';

const ACE_EXT_SEARCH = {
  init: (el, actionsEl, copyAsCurlEl) => {
    let input;
    input = initializeInput(el, actionsEl, copyAsCurlEl);
    init(input);
    return input;
  }
}

window.ACE_EXT_SEARCH = ACE_EXT_SEARCH;