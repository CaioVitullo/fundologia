(function($){
  $(function(){
		encurta = false;
		$(window).scroll(function(){
			if (((window.innerHeight + window.scrollY) >= document.body.offsetHeight) && encurta==false) {
				$('#rightMenu').addClass('encurtaFundo');
				encurta = true;
    	}else if(encurta==true){
				$('#rightMenu').removeClass('encurtaFundo');
				encurta=false;
			}
		})
    $('.button-collapse').sideNav(
			{
				menuWidth: 300, // Default is 300
				edge: 'left', // Choose the horizontal origin
				closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
				draggable: true, // Choose whether you can drag to open on touch screens,
				onOpen: function(el) { /* Do Stuff*/ }, // A function to be called when sideNav is opened
				onClose: function(el) { /* Do Stuff */ }, // A function to be called when sideNav is closed
			  }
		);
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



