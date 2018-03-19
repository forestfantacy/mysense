export default {
  initialize: (scope, element) => {
    const uniqueId = `uiAceKeyboardHint-${scope.$id}-${aceKeyboardModeId++}`;

    const hint = angular.element(
      `<div
          class="uiAceKeyboardHint"
          id="${uniqueId}"
          tabindex="0"
          role="application"
        >
          <p class="kuiText kuiVerticalRhythmSmall">
            Press Enter to start editing.
          </p>
          <p class="kuiText kuiVerticalRhythmSmall">
            When you&rsquo;re done, press Escape to stop editing.
          </p>
        </div>`
    );

    const uiAceTextbox = element.find('textarea');

    function startEditing() {
      // We are not using ng-class in the element, so that we won't need to $compile it
      hint.addClass('uiAceKeyboardHint-isInactive');
      uiAceTextbox.focus();
    }

    function enableOverlay() {
      hint.removeClass('uiAceKeyboardHint-isInactive');
    }

    hint.keydown((ev) => {
      if (ev.keyCode === keyCodes.ENTER) {
        ev.preventDefault();
        startEditing();
      }
    });

    uiAceTextbox.blur(() => {
      enableOverlay();
    });

    let isAutoCompleterOpen;

    // We have to capture this event on the 'capture' phase, otherewise Ace will have already
    // dismissed the autocompleter when the user hits ESC.
    document.addEventListener('keydown', () => {
      const autoCompleter = document.querySelector('.ace_autocomplete');

      if (!autoCompleter) {
        isAutoCompleterOpen = false;
        return;
      }

      // The autoComplete is just hidden when it's closed, not removed from the DOM.
      isAutoCompleterOpen = autoCompleter.style.display !== 'none';
    }, { capture: true });

    uiAceTextbox.keydown((ev) => {
      if (ev.keyCode === keyCodes.ESCAPE) {
        // If the autocompletion context menu is open then we want to let ESC close it but
        // **not** exit out of editing mode.
        if (!isAutoCompleterOpen) {
          ev.preventDefault();
          ev.stopPropagation();
          enableOverlay();
          hint.focus();
        }
      }
    });

    hint.click(startEditing);
    // Prevent tabbing into the ACE textarea, we now handle all focusing for it
    uiAceTextbox.attr('tabindex', '-1');
    element.prepend(hint);
  }
}