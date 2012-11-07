//jquery.lwLightbox.js
//Author: Nick Dawe, UCL Communications
//Under MIT and GPL licenses
/*global google*/
/*global $*/
/*global document*/

;
(function($) {
	
		var pluginName = 'lwLightbox';

		var methods = {
        init : function(options) {
            //"this" is a jquery object on which this plugin has been invoked.
            return this.each(function(index){
                var $this = $(this);
                var data = $this.data(pluginName);
                // If the plugin hasn't been initialized yet
                if (!data){
                   var defaults = {
						contentSource: "href",
						content: null,
						enableKeyboardNav: true,
						group: false,
						label: "Gallery",
						loadingMessage: "<p>Loading</p>",
						showLabel: true,
						selectorSuffix: null,
						cms: false,
						cmsContentSuffix: null,
						onOpen: function() {},
						onClose: function() {}
					};
                    if(options) { $.extend(true, defaults, options); }

                    $this.data(pluginName, {
                        target : $this,
                        settings: defaults
                    });
                    
                    
                    
                    
                    //options is undefined.
                    //is the if(options) statement above correct? What happens if there are no options?
                    
                    //debugger;
                    
                    //Is this how other plugins call private methods?
                    //methods.loadup(options);
                    methods.loadup.call(this, defaults);
                }
            });
        },
        loadup: function(options) {
        	alert (options.group);
        	
        
        },
        publicMethod : function(){
			return this.each(function(index){
				alert ('2test');
			});
        }
    };

		
		
    $.fn[pluginName] = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || !method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' + method + ' does not exist in jQuery.' + pluginName );
        }
    };

		
		
		
		
		/*
		
		
		
		
		
		
		var initialize = function() {
			// support MetaData plugin
			if ($.meta) {
				options = $.extend({}, options, this.data());
			}
			lightbox.init();
			return lightbox;
		};
		this.init = function() {
			var that = this;
			
			
		//Preload loading HTML
			if ($("#loading").length === 0) {
				$("body").append("<div id='loading' aria-hidden='true' class='lwHidden'>" + options.loadingMessage + "</div>");
			}
			
			this.click(function() {
				lightboxHref = $(this).attr("href");
				
				var suffix = options.selectorSuffix;
				//if editor has set a broad selector (e.g. 'a'), and is using suffixes to specify which links to use lightbox (as in CMS use)
				if ((suffix && (lightboxHref.lastIndexOf(suffix) !== -1)) || !suffix)  {
					_open();
					return false;
				}
				
			});
		};
		var _cmsSettings = function() {
			//Check if href includes 'nonCms'
			if (options.cms) {
								
				if (lightboxHref.lastIndexOf("-nonCms") === -1) {
					lightboxHref += options.cmsContentSuffix;
				} else {
					lightboxHref = lightboxHref.replace("-nonCms", '');
				}
				
			}
		};
		var _open = function() {
			var suffix = options.selectorSuffix;
			var group = options.group,
				onOpen = options.onOpen;
			
		
			var currentIndex = 0;
			var groupLength = 0;
			//If link suffix is being used, and this link contains a suffix, OR if there is no link suffix being used, then open
			
				
				$("#loading").removeClass("lwHidden");
								
				//Build and display lightbox overlay and container
				var showLabelHtml = (options.showLabel) ? "" : " class='lwHidden'";
				var overlay = "<div id='overlay'></div>"; //Don't like the way this is created/deleted each time - should be hidden instead.
				var contentHtm = "<div id='lwLightbox' role='dialog' aria-labelled-by='lbLabel' tabIndex='-1'><div id='lbInfo' class='shadow'><div id='lbLabel'" + showLabelHtml + "><h3>" + options.label + "</h3></div><div id='closeInfo'><p><a href='' role='button'>Close<span class='lwHidden'>(Escape)</span></a></p></div></div><div id='lbContent' aria-live='assertive' aria-busy='true' aria-relevant='additions removals text'></div></div>";
				
				$("body").append(overlay + contentHtm);
				
				$("#overlay").fadeIn('500', function () {
					
					
					
				});
				$("#lwLightbox").fadeIn('400');
				
				
				//if this is a grouped lightbox
				if (group) {
					$("#lwLightbox").append("<div id='arrows'><div id='arrowL'><a role='button' href=''>Display previous item</a></div><div id='arrowR'><a role='button' href=''>Display next item</a></div></div>");
					//thisElement is obj (ie <a>)
					var siblings = lightbox.parent().find("a");
					//Do I need thisElement? Why not this.element!?
					//this.currentIndex = $("a").index(thisElement);
					currentIndex = siblings.index(lightbox);
					groupLength = lightbox.parent().find(">a").length;
					var setLBGroupContent = function() {
						//Show/hide arrows, depending on currentIndex
						//Can this be made more efficient?
						if (currentIndex === 0) {
							$("#arrowL").hide();
						} else {
							$("#arrowL").show();
						}
						if (currentIndex === groupLength - 1) {
							$("#arrowR").hide();
						} else {
							$("#arrowR").show();
						}
						
						_convertContent(currentIndex);
					};
					setLBGroupContent();
					//Add event handlers here, as .open method is only loaded once when lightbox opens (rather than every time plugin is instantiated)
					$("#arrowL > a").bind('click', function() {
						if (currentIndex !== 0) {
							currentIndex--;
							setLBGroupContent();
							transition = true;
						}
						return false;
					});
					$("#arrowR > a").bind('click', function() {
						if (currentIndex !== groupLength) {
							currentIndex++;
							setLBGroupContent();
							transition = true;
						}
						return false;
					});
				} else {
					//If this is for a single lightbox
					//For single lightboxes, set currentIndex to 0 because there aren't any more to come
					currentIndex = 0;
					//Insert HTML content into lightbox
					
					_convertContent(currentIndex);
				}
			
				
				//Close event triggers
				$("#closeInfo a, #overlay").bind('click', function(event) {
					_closeLightbox();
					return false;
				});
				if (options.enableKeyboardNav) {
					$("#lwLightbox").focus().bind('keyup', function(e) {
						//Escape key closes lightbox, and left/right cursor keys move to prev/next items in a group
						if (e.keyCode === 27) {
							$("#closeInfo a").click();
						} else if (options.group) {
							if (e.keyCode === 37) {
								$("#arrowL > a").click();
							} else if (e.keyCode === 39) {
								$("#arrowR > a").click();
							}
						}
					});
				}
				//User callback function		
				if ($.isFunction(onOpen)) {
					onOpen();
				} else {
					throw ("onOpen property is not a function");
				}
			
		};
		var _removeLinkSuffix = function() {
			lightboxHref = lightboxHref.replace(options.selectorSuffix, '');
		};
		//Convert content into LB suitable HTML, then insert into lightbox
		var _insertLBHtml = function(i, newContent) {
				//Replace lightbox content with new index's content
			var lbMarginLeft, lbMarginTop, lbWidth, lbHeight;
			var lbContentWidthMargin = 170, 
				lbContentHeightMargin = 78; //Includes content margin and lightbox label
			var _positionLB = function() {
				
				var _showContent = function () {
					$("#lbContent").animate({
						"opacity":1
					}, 350, function () {
						$(this).attr('aria-busy', false);
					});
					$("#loading").addClass("lwHidden");
				};
				
				var _calcHeight = function () {
					lbHeight = $("#lbContent").height() + lbContentHeightMargin;
					lbMarginTop = (-(lbHeight) / 2) + "px";
				}
					
				if (!transition) {
					$("#lwLightbox").css({
						"marginLeft": lbMarginLeft,
						"marginTop": lbMarginTop,
						"left": "50%",
						"top": "50%",
						"width": lbWidth
					});
					
					//Calculate and set height after the width has been set (as, if we're including fluid elements like text, the width will change the elements' height)
					_calcHeight();
										
					$("#lwLightbox").css({
						"height": lbHeight,
						"marginTop": lbMarginTop
					});
					_showContent();
					
				} else {
					$("#lwLightbox").animate({
						"marginLeft": lbMarginLeft,
						"marginTop": lbMarginTop,
						"left": "50%",
						"top": "50%",
						"width": lbWidth
					}, 350, function () {
						//Calculate and set height after lightbox width has been set
						_calcHeight();
						$("#lwLightbox").animate({
							"height": lbHeight,
							"marginTop": lbMarginTop
						}, 350, function () {
							_showContent();
						});		
					});
				}
			};
			
			//Using opacity:0 to hide this - it needs to retain its dimensions, and visibility:hidden won't let me fade in
			$("#lbContent").css("opacity", 0).html(newContent);
			
			//If there's an image or iFrame, check the width (only set for 1 image, so may need to expand this to get the largest image in array)
			if ($("#lbContent").find("img, iframe").length > 0) {
				$("#lbContent").find("img, iframe").load(function() {
				
					//should this logic be in _positionLB?
					lbWidth = $(this).width() + lbContentWidthMargin;
					
					//Width needs to be set before calculating height
					
					
					
					lbMarginLeft = (-(lbWidth) / 2) + "px";
					_positionLB();
				});
			} else {
				//If just HTML (this doesn't necessarily work getting widths for images, which will need to be preloaded, as above)
				lbWidth = 400; //Default lightbox width?
				lbWidth = (-lbWidth / 2) + "px";
				
				_positionLB();
			}
			
		};
		var _convertContent = function(i) {
			var contentHtm = "",
				that = this;
			var content = options.content,
				group = options.group;
			switch (options.contentSource) {
			case "selector":
				//Simply copying HTML of selector, and duplicating it in lightbox. 
				//Am assuming this is faster to process than .clone, but haven't tested
				contentHtm = (i) ? $(content).eq(i).html() : $(content).html();
				_insertLBHtml(i, contentHtm);
				break;
			case "href":
				//If this is a grouped lightbox, ensure object is on current index
				
				
				
				
				
				
				
				//There will be issues with this if links are not siblings
				//Maybe select links by suffix?
				
				
				
				
				
				
				if (group) {
					lightboxHref = lightbox.parent().find("a:eq(" + i + ")").attr("href");
				}
				
				
				
				
				
				
				
				 
				_removeLinkSuffix();
				_cmsSettings();
				
				//If image
				var imgPattern = new RegExp(/\.(jpg|gif|png)$/);
				if (imgPattern.test(lightboxHref)) {
					//If image file
					contentHtm = "<img src='" + lightboxHref + "' alt='' />";
					_insertLBHtml(i, contentHtm);
				} else {
					//If any other type of file
					$.ajax({
						url: lightboxHref,
						success: function(contentHtm) {
							_insertLBHtml(i, contentHtm);
						},
						error: function(data) {
							throw ('lwLightbox AJAX error: ' + data);
						}
					});
				}
				break;
			case "html":
				//Do I need this?
				if (group) {
					contentHtm = content[i];
				} else {
					contentHtm = content;
				}
				_insertLBHtml(i, contentHtm);
				console.log('content should be ' + contentHtm);
				break;
			}
			return contentHtm;
		};
		_closeLightbox = function() {
			var onClose = options.onClose;
			var that = this;
			transition = false;
			
			//Unbind event handlers which were bound when lightbox loaded, otherwise there'll be a memory leak
			$("#arrowL > a, #arrowR > a, #closeInfo a, #overlay").unbind('click');
			if (options.enableKeyboardNav) {
				$("#lwLightbox").unbind('keyup');
			}
			$("#overlay").fadeOut('500', function() {
				$(this).remove();
			});
			$("#lwLightbox").fadeOut('500', function() {
				$(this).remove();
				//Callback function
				if ($.isFunction(onClose)) {
					onClose();
				} else {
					throw ("onClose property is not a function");
				}
			});
		};
		
		return initialize();
	}*/
})(jQuery);