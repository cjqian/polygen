//javascript for the file menu
$(document).ready(function() {
	$('#file-menu-button').click(function() {
		$(this).toggleClass('active');
		$('.body-unpushed').toggleClass('body-pushed');
		$('.file-menu-left').toggleClass('file-menu-open');
	});
});
