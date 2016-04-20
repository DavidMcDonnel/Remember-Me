/*******

	***	jQuery "flash like" menu plugin by Cedric Dugas   ***
	*** Http://www.position-absolute.com ***
	
	Licenced under the MIT LICENCE
	
*****/

$(document).ready(function() {
	$("a.menuFlash").menuZoomer({
		speed:400,
		fontColor:"#d7df23",
		fontSize : "300%",
		lineHeight:"39px",
		easing : "easeOutExpo"
	})
});

jQuery.fn.menuZoomer = function(settings) {
	 settings = jQuery.extend({
		speed:400,
		fontColor:"#d7df23",
		fontSize : "300%",
		lineHeight:"39px",
		easing : "easeOutExpo"
	}, settings);

	return this.each(function(){
		/* INIT CSS */
		var initlineHeight = $(this).css("lineHeight")
		var initcolor = $(this).css("color")
		
		/* CORRECT A BUG IN IE WHERE THE FIRST ROLLOVER WOULD FAIL*/ 
		$(this).animate({
			fontSize: "100%",
			color:initcolor,
			lineHeight:initlineHeight
			},{duration: settings.speed, easing: "easeOutExpo"})

		/* ON CLICK STAY STATE */
		$(this).click(function(){	
			$(".openItem").animate({
				fontSize: "100%",
				color:initcolor,
				lineHeight:initlineHeight
				},{duration:settings.speed, easing: "easeOutExpo"})
			$(".openItem").removeClass("openItem")
			$(this).addClass("openItem")
		})
		
		/* OVER AND ROLLOUT */
		$(this).hover(function () { 
		
			$(this).not(":animated").animate({
				fontSize: settings.fontSize,
				color:settings.fontColor,
				lineHeight:settings.lineHeight
				},{duration: settings.speed, easing: settings.easing})
				return false;
		},
		function () {
			$(this).not(".openItem").animate({
				fontSize: "100%",
				color:initcolor,
				lineHeight:initlineHeight
				},{duration: settings.speed, easing: "easeOutExpo"})
			});	
		})
}	
