(function($){
  $(function(){

    $('.button-collapse').sideNav();
    $('select').material_select();

    // ========== SCROLL TO ========== //
	$(function() {
		$('a[href*="#"]:not([href="#"],[class="collapsed"])').click(function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			if (target.length) {
				$('html, body').animate({
					scrollTop: target.offset().top - 170
				}, 800);
				return false;
				}
			}
		});
	});
  }); // end of document ready
})(jQuery); // end of jQuery name space