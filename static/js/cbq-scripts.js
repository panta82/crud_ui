init();

// *** END SYNCHRONOUS CODE ***

function init() {
	initFlashMessageDismiss();
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
