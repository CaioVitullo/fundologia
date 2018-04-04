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
    //$('select').material_select();

    // ========== SCROLL TO ========== //
	// $(function() {
	// 	$('a[href*="#"]:not([href="#"],[class="collapsed"])').click(function() {
	// 	if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
	// 		var target = $(this.hash);
	// 		target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	// 		if (target.length) {
	// 			$('html, body').animate({
	// 				scrollTop: target.offset().top - 170
	// 			}, 800);
	// 			return false;
	// 			}
	// 		}
	// 	});
	// });
  }); // end of document ready
})(jQuery); // end of jQuery name space


!function(){"use strict";function e(e,n){function r(n,r,t,a){var o,i;a.$render=function(){o=e("number")(i/100,2),t.moneyMaskPrepend&&(o=t.moneyMaskPrepend+" "+o),t.moneyMaskAppend&&(o=o+" "+t.moneyMaskAppend),r.val(o)},n.$watch("model",function(e){e=parseFloat(e)||0,e!==i&&(i=Math.round(100*e)),a.$viewValue=e,a.$render()}),r.on("keydown",function(e){8===(e.which||e.keyCode)&&(i=parseInt(i.toString().slice(0,-1))||0,a.$setViewValue(i/100),a.$render(),n.$apply(),e.preventDefault())}),r.on("keypress",function(e){var r=e.which||e.keyCode;if(9===r||13===r)return!0;var t=String.fromCharCode(r);if(e.preventDefault(),0!==t.search(/[0-9\-]/))return!1;i=parseInt(i+t);var o=e.target||e.srcElement;o.selectionEnd!=o.selectionStart?a.$setViewValue(parseInt(t)/100):a.$setViewValue(i/100),a.$render(),n.$apply()})}var t={require:"ngModel",link:r,restrict:"A",scope:{model:"=ngModel"}};return t}angular.module("rw.moneymask",[]).directive("moneyMask",e),e.$inject=["$filter","$window"]}();
