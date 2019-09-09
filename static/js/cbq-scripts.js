init();

// *** END SYNCHRONOUS CODE ***

function init() {
	initFlashMessageDismiss();
}

function logError(message) {
	typeof console === 'object' && console.error && console.error(message);
}

function initFlashMessageDismiss() {
	var el = document.querySelector('.cbq-flash-message');
	if (!el) {
		return;
	}

	// Add auto-hide
	var autoRemoveTimeout = setTimeout(dismissMessage, 5000);

	// Add click to hide
	el.addEventListener('click', dismissMessage);

	function dismissMessage() {
		clearTimeout(autoRemoveTimeout);
		el.classList.remove('show');
		setTimeout(function() {
			el.remove();
		}, 1000);
	}
}

/**
 * A generic function to fill in texts and show a bootstrap modal with a single action.
 * Texts should be a lookup of class names, whose content should be replaced with the given text.
 * @param id
 * @param action
 * @param texts
 */
function showModal(id, action, texts) {
	var el = document.querySelector('#' + id);
	if (!el) {
		typeof console === 'object' && console.error && console.error("Couldn't find modal #" + id);
		return logError("Couldn't find modal #" + id);
	}

	for (var className in texts) {
		var els = el.querySelectorAll('.' + className);
		els.forEach(function(el) {
			el.innerText = texts[className];
		});
	}

	var formEl = el.querySelector('form');
	if (formEl) {
		formEl.setAttribute('action', action);
	}

	$(el).modal('show');
}