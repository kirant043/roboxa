(function($) {
	$.fn.picEyes = function(options) {

		/*-- Plugin defaults --*/

		var defaults = {
			effectTime: 200,
			showImageTitle: true,
			showGalleryTitle: true,
			language: navigator.language.substr(0,2),
			roundRobin: true,
			showYoutubeThumbnails: false
		}

		/*-- Variables --*/
		var settings = $.extend({}, defaults, options);
		var docTitle = document.title;
		var galleryTitle = "";
		var itemSelector = "."+options.classSelect;
		var index = 0;
		var items = $(this).find(itemSelector);
		var totalItems = items.length;
		var videoidplugin='';

		/*-- Languages --*/
		var language = {
			de: {prev: "Vorheriges Bild", next: "Nächstes Bild", close: "Schließen"},
			en: {prev: "Previous image", next: "Next image", close: "Close"},
			fr: {prev: "Image précédente", next: "Image suivante", close: "Fermer"},
			es: {prev: "Imagen anterior", next: "Siguiente imagen", close: "Cerca"},
			it: {prev: "Immagine precedente", next: "Immagine successiva", close: "Vicino"},
			zh: {prev: "上一张图片", next: "下一图片", close: "关"},
			ru: {prev: "Предыдущее изображение", next: "Следующее изображение", close: "Закрыть"},
			da: {prev: "Forrige billede", next: "Næste billede", close: "Tæt"},
			nl: {prev: "Vorig beeld", next: "Volgend beeld", close: "Dichtbij"}
		}

		for(var i = 0; i < totalItems; i++) {
			/*-- Hide all hidden elements --*/
			if($(items[i]).data('hidden') === true) {
				$(items[i]).css({
					display: 'none'
				});
			}

			var tag = $(items[i])[0].localName;

			/*-- Is the tag an a-tag? --*/
			if(tag == 'a' && settings.showYoutubeThumbnails) {
				var videoID = $(items[i]).attr('href');

				$(items[i]).html(`<img src=""/>`)
				$('#alb_content').html('<video poster="images/loading.gif" style="width: 75%;height: 75%;" onclick="playPause()" id="pluginvideoid" autoplay> <source src="'+videoID+'" type="video/mp4"></video>');
			}
if(tag == 'p'){
var pdfidd = $(items[i]).attr('href');
					var psdfstringobj='<object style="width: 80%;height: 80%;"  data="'+pdfidd+'" type="application/pdf">'+
					'<embed src="'+pdfidd+'" />'+
					'</object>';

					$('#alb_content').html(pdfidd)

}
				
		}

		/*-- Append the actual lightbox to the HTML-body --*/
		$('body').append(`<div id="alb_overlay"><nav><span id="alb_icon_prev" title="${language[settings.language]["prev"]}"></span><span id="alb_icon_close" title="${language[settings.language]["close"]}"></span><span id="alb_icon_next" title="${language[settings.language]["next"]}"></span></nav><div id="alb_content"></div><div id="alb_footer"></div></div>`);

		function Open(obj) {
			galleryTitle = obj.parent().data('title');
			index = $(obj).parent().children(itemSelector).index(obj);

			Update();
			$('#alb_overlay').fadeIn(settings.effectTime);
		}

		function Update() {
			LoadContent($(items[index]));

			if($(items[index]).data('title') && settings.showImageTitle)
				document.title = docTitle + " - " + $(items[index]).data('title');

			if($(items[index]).parent().data('title') && settings.showGalleryTitle)
				$('#alb_footer').html(galleryTitle + ": " + (index + 1) + " / " + totalItems);
			else
				$('#alb_footer').html((index + 1) + " / " + totalItems);
		}
 

		function Close() {
			
			
			$('#alb_overlay').fadeOut(settings.effectTime);
			if(pluginvideoid){
				pluginvideoid.pause()
			}

			if(document.title != docTitle)
				document.title = docTitle;
		}

		function Next() {
			if(index < totalItems - 1) {
				index++;
				Update();
			}
			else if(settings.roundRobin) {
				index = 0;
				Update();
			}
		}

		function Previous() {
			if(index > 0) {
				index--;
				Update();
			}
			else if(settings.roundRobin) {
				index = totalItems - 1;
				Update();
			}
		}

		function LoadContent(item) {
			var tag = $(item)[0].localName;

			if(tag == 'a') {

				var videoID = $(item).attr('href')

				$('#alb_content').html('<video   poster="images/loading.gif" style="width: 75%;height: 75%;" id="pluginvideoid" onclick="playPause()" autoplay> <source src="'+videoID+'" type="video/mp4"></video>');
			}
			else if(tag == 'img') {
				$('#alb_content').html(`<img src="${$(item).attr('src')}"/>`);
			}else if(tag == 'p'){
					var pdfidd = $(item).attr('href')
					var psdfstringobj='<object style="width: 80%;height: 80%;" data="'+pdfidd+'" type="application/pdf">'+
					'<embed src="'+pdfidd+'" />'+
					'</object>'
				$('#alb_content').html(psdfstringobj);


			}
		}




		$(this).find(itemSelector).stop().click(function(e) {
			e.preventDefault();
			Open($(this));
		});

		$('#alb_icon_close').stop().click(function() { Close(); });
		$('#alb_icon_next').stop().click(function() { Next(); });
		$('#alb_icon_prev').stop().click(function() { Previous(); });

		$(document).keydown(function(e) {
			if(e.keyCode == 39) Next();
			if(e.keyCode == 37) Previous();
			if(e.keyCode == 27) Close();
		});
	};
}(jQuery));
