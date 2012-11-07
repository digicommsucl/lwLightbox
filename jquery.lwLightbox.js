/*Full code, documentation, etc. at ucl.ac.uk/comms/lightbox/ */
;
(function($) {
	"use strict";
	var pluginName = 'lwLightbox';
	var lightboxHref;
	var transition;
	var selector;
	var groupLength;

	var methods = {
		init: function(options) {

			//Set global vars up with plugin selector, and no. of instances
			selector = this.selector;
			groupLength = $(selector).length;

			return this.each(function() {
				var $this = $(this);
				var data = $this.data(pluginName);
				if (!data) {
					var settings = {
						autoSize: true,
						defaultWidth: 400,
						enableKeyboardNav: true,
						externalPageMethod: "ajax",
						group: false,
						label: "Gallery",
						loadingMessage: "<p>Loading</p>",
						showLabel: true,
						selectorSuffix: null,
						cms: false,
						cmsContentSuffix: null,
						onOpen: function () {},
						onClose: function () {},
						onTransition: function () {}
					};

					$.extend(true, settings, options);

					if ($.metadata) {
						$.extend(true, settings, $this.metadata());
					}

					$this.data(pluginName, {
						target: $this,
						settings: settings
					}).addClass('lwLightboxTrigger');
					//Preload loading HTML
					if ($("#loading").length === 0) {
						$("body").append("<div id='loading' aria-hidden='true' class='lwHidden'>" + settings.loadingMessage + "</div>");
					}
					$(this).bind("destroyed", function() {
						methods._teardown.call(this, settings);
					});
					methods._bind.call(this, settings);
				}
			});
		},

		_bind: function(options) {
			$(this).bind("click", function() {
				lightboxHref = $(this).attr("href");
				var suffix = options.selectorSuffix;

				//if editor has set a broad selector (e.g. 'a'), and is using suffixes to specify which links to use lightbox (as in CMS use)
				if ((suffix && (lightboxHref.lastIndexOf(suffix) !== -1)) || !suffix) {
					methods._open.call(this, options);
					return false;
				}
			});
		},

		_open: function(options) {
			var OVERLAYFADETIME = 500,
				LIGHTBOXFADETIME = 400;

			var label = options.label,
				showLabel = options.showLabel,
				group = options.group,
				onOpen = options.onOpen,
				enableKeyboardNav = options.enableKeyboardNav,
				currentIndex = 0;

			var that = this;

			transition = false;

			//Show loading box
			$("#loading").removeClass("lwHidden");

			//Build and display lightbox overlay and container
			var showLabelHtml = (showLabel) ? "" : " class='lwHidden'";
			var overlay = "<div id='overlay'></div>"; //Don't like the way this is created/deleted each time - should be hidden instead.
			var contentHtm = "<div id='lwLightbox' role='dialog' aria-labelled-by='lbLabel' tabIndex='-1'><div id='lbInfo' class='shadow'><div id='lbLabel'" + showLabelHtml + "><h3>" + label + "</h3></div><div id='closeInfo'><p><a href='' role='button'>Close<span class='lwHidden'>(Escape)</span></a></p></div></div><div id='lbContentContainer'><div id='lbContent' aria-live='assertive' aria-busy='true' aria-relevant='additions removals text'></div></div></div>";
			$("body").append(overlay + contentHtm);
			$("#overlay").fadeIn(OVERLAYFADETIME);
			$("#lwLightbox").fadeIn(LIGHTBOXFADETIME, function () {
				//Now that light box is open  and box is resized, user callback function can be called
				if ($.isFunction(onOpen)) {
					onOpen();
				} else {
					throw ("onOpen property is not a valid function");
				}
			});

			//If this is a grouped lightbox
			if (group) {
				$("#lwLightbox").append("<div id='arrows'><div id='arrowL'><a role='button' href=''>Display previous item</a></div><div id='arrowR'><a role='button' href=''>Display next item</a></div></div>");

				//Find current index of this instance out of selector
				//currentIndex = $(selector).index(that);

				//For jQuery < 1.4
				$(selector).each(function (i) {
					if (that === this) {
						currentIndex = i;
					}
				});


				var setLBGroupContent = function() {
					//Re-show loading HTML until new content is set
					$("#loading").removeClass("lwHidden");

					//Show/hide arrows, depending on currentIndex
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
					//Insert HTML content into lightbox
					methods._convertContent.call(that, options, currentIndex);
				};
				setLBGroupContent();

				//Add event handlers for lightbox arrows
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
				methods._convertContent.call(this, options, currentIndex);
			}

			//Close 'link' event triggers
			$("#closeInfo a, #overlay").bind('click', function() {
				methods.close.call(this, options);
				return false;
			});

			if (enableKeyboardNav) {
				//Focus on lightbox (this seems to work, even though it's focusing on a div... may need to come back to this later)
				$("#lwLightbox").focus().bind('keyup', function(e) {
					//Escape key closes lightbox, and left/right cursor keys move to prev/next items in a group
					if (e.keyCode === 27) {
						$("#closeInfo a").click();
					} else if (group) {
						if (e.keyCode === 37) {
							$("#arrowL > a").click();
						} else if (e.keyCode === 39) {
							$("#arrowR > a").click();
						}
					}
				});
			}
		},

		//Convert target content into suitable HTML
		_convertContent: function(options, i) {
			var contentHtm = "";
			var group = options.group,
				externalPageMethod = options.externalPageMethod;

			var $lbContent = $("#lbContent");

			if (group) {
				//Set specific class for #lbContent, which can then be used in CSS to style specific lightbox segments
				var lbClass = $lbContent.attr('class');
				$lbContent.removeClass(lbClass).addClass("lbSegment" + i);

				//Get href from relevant selector element instance
				lightboxHref = $(selector).eq(i).attr("href");
			}

			methods._removeLinkSuffix.call(this, options);
			methods._cmsSettings.call(this, options);
			//If image
			var imgPattern = new RegExp(/\.(jpg|gif|png)$/);
			if (imgPattern.test(lightboxHref)) {
				//If image file
				contentHtm = "<img src='" + lightboxHref + "' alt='' />";
				methods._setLBSize.call(this, options, i, contentHtm);
			} else {
				//If non-image
				if (externalPageMethod === "ajax") {
					$.ajax({
						url: lightboxHref,
						success: function(contentHtm) {
							methods._setLBSize.call(this, options, i, contentHtm);
						},
						error: function(e, xhr) {
							throw('AJAX error requesting lwLightbox content. XHR: ' + xhr + '. Status: ' + e.status);
						}
					});
				} else if (externalPageMethod === "iframe") {
					contentHtm = "<iframe marginheight='0' marginwidth='0' frameborder='0' style='border-width:0' src='" + lightboxHref + "' title='Lightbox loaded content' />";
					methods._setLBSize.call(this, options, i, contentHtm);
				}
			}
		},

		_removeLinkSuffix: function(options) {
			//Remove the last instance of the suffix
			var selectorSuffix = options.selectorSuffix;
			if (selectorSuffix) {
				lightboxHref = lightboxHref.replace(new RegExp(selectorSuffix + '$'), '');
			}
		},

		_cmsSettings: function(options) {
			//Check if href includes 'nonCms'
			if (options.cms) {
				if (lightboxHref.lastIndexOf("-nonCms") === -1) {
					lightboxHref += options.cmsContentSuffix;
				} else {
					lightboxHref = lightboxHref.replace("-nonCms", '');
				}
			}
		},

		_showNewLBContent: function() {
			var LBCONTENTFADETIME;
			$("#lbContent").animate({
				"opacity": 1
			}, LBCONTENTFADETIME, function() {
				$(this).attr('aria-busy', false);
			});
			$("#loading").addClass("lwHidden");
		},

		_callTransitionCallback: function (options) {
			var onTransition = options.onTransition;
			if ($.isFunction(onTransition)) {
				options.onTransition();
			} else {
				throw ("onTransition property is not a valid function");
			}
		},

		_setLBSize: function(options, i, newContent) {
			var $lwLightbox = $("#lwLightbox"),
				$lbContent = $("#lbContent");
			var defaultWidth = options.defaultWidth;

			var lbMarginLeft, lbWidth, lbHeight;

			//Detect lightbox content margins
			var lbContentWidthMargin = ($("#lbContentContainer").css("marginLeft").replace("px", "")) * 2;
			var lbContentHeightMargin = ($("#lbContent").css("marginTop").replace("px", "")) * 2;
			//Calculate content vertical margins by also adding lightbox info label height
			lbContentHeightMargin += $("#lbInfo").height();

			var _positionLB = function() {
				var top, bottom, left, right;
				var $lwLightboxClone;

				var _setWidth = function () {
					var winWidth = $(window).width();

					if (lbWidth >= winWidth) {
						left = "20px";
						right = "20px";
						$("#lbContentContainer").css("overflowX", "scroll");
					} else {
						left = (winWidth / 2) - (lbWidth / 2);
						left += "px";
						right = left;
						$("#lbContentContainer").css("overflowX", "hidden");
					}
				};

				var _setHeight = function() {
					//Create clone of lightbox, which we can then calculate correct dimensions of.
					//Set the clone with the new width, and then detect its height
					//Once we have all the dimensions, apply them to the real lightbox (which means height and width can be animated together, rather than width then height)
					$lwLightbox.clone().appendTo("body").attr("id", "lwLightboxClone");
					$lwLightboxClone = $("#lwLightboxClone");
					$lwLightboxClone.css({
						left:left,
						right:right
					});
					lbHeight = $lwLightboxClone.find("#lbContent").height() + lbContentHeightMargin;
					$lwLightboxClone.remove();

					//Calculate height of viewport
					//If lightbox content is too tall for viewport, make lightbox as tall as possible, and add scrollbars
					var winHeight = $(window).height();
					if (lbHeight >= winHeight) {
						top = "20px";
						bottom = "20px";
						$("#lbContentContainer").css("overflowY", "scroll");
					} else {
						top = (winHeight / 2) - (lbHeight / 2);
						top += "px";
						bottom = top;

						$("#lbContentContainer").css("overflowY", "hidden");
					}
				};

				_setWidth();
				_setHeight();

				if (!options.autoSize) {
					$lwLightbox.css({
						"top": "20px",
						"bottom": "20px",
						"left": "20px",
						"right": "20px"
					});

					if (transition) {
						methods._callTransitionCallback.call(this, options);
					}

					methods._showNewLBContent.call(this, options);
				} else if (!transition) {
					$lwLightbox.css({
						"left": left,
						"right": right,
						"bottom": bottom,
						"top": top
					});
					methods._showNewLBContent.call(this, options);
				} else {
					var LBRESIZETIME = 350;
					$lwLightbox.animate({
						"left": left,
						"right": right,
						"top": top,
						"bottom": bottom
					}, LBRESIZETIME, function() {
						methods._showNewLBContent.call(this, options);
						methods._callTransitionCallback.call(this, options);
					});
				}
			};
			//Using opacity:0 to hide this - it needs to retain its dimensions, and visibility:hidden won't let me fade in
			$lbContent.css("opacity", 0).html(newContent);
			//If there's an image or iFrame, check the width (only set for 1 image, so may need to expand this later to get the largest image in array)
			if ($lbContent.find("img, iframe").length > 0) {
				$lbContent.find("img, iframe").load(function() {
					//Width needs to be set before calculating height
					lbWidth = $(this).width() + lbContentWidthMargin;

					//For IE only, set container div with this width (seem to be problems with scrollbars working without this)
					if ($.browser.msie) {
						$("#lbContent").css("width", $(this).width());
					}

					lbMarginLeft = (-(lbWidth) / 2) + "px";
					_positionLB();
				});
			} else {
				//If just HTML (this doesn't necessarily work getting widths for images, which will need to be preloaded, as above)
				lbWidth = defaultWidth + lbContentWidthMargin;

				//Set IE width to default (as it may be stuck on content width from a previous image)
				if ($.browser.msie) {
					$("#lbContent").css("width", defaultWidth);
				}

				lbMarginLeft = (-lbWidth / 2) + "px";
				_positionLB();
			}
		},

		close: function(options) {
			var FADEOUTTIME = 500;
			//If called externally, without any options as the argument, then get them from the DOM object's data object
			if (typeof options === 'undefined') {
				options = $(this).data("lwLightbox");
				options = options.settings;
			}
			var onClose = options.onClose;
			var $lwLightbox = $("#lwLightbox");

			//Check that lightbox is open (in case this has been called after it's been closed)
			if ($lwLightbox.length === 0) {
				throw ("Error closing lightbox: Lightbox is not open");
			}

			//Unbind event handlers
			$("#arrowL > a, #arrowR > a, #closeInfo a, #overlay").unbind('click');
			if (options.enableKeyboardNav) {
				$lwLightbox.unbind('keyup');
			}

			//Fade out and remove overlay and lightbox
			$("#overlay").fadeOut(FADEOUTTIME, function() {
				$(this).remove();
			});

			$lwLightbox.fadeOut(FADEOUTTIME, function() {
				$(this).remove();
				//User callback function
				if ($.isFunction(onClose)) {
					onClose();
				} else {
					throw ("lwLightbox error: onClose property is not a function");
				}
			});
		},

		_unbind: function() {
			$(this).unbind("click");
		},

		//Public destroy function
		destroy: function() {
			var $this = $(this);
			$this.unbind("destroyed", methods._teardown);
			$("#loading").remove();
			methods._teardown.call(this);
		},

		_teardown: function() {
			return $(this).each(function() {
				$.removeData(this, pluginName);
				$(this).removeClass('lwLightboxTrigger');
				methods._unbind.call(this);
			});
		}
	};
	$.fn[pluginName] = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist in jQuery.' + pluginName);
		}
	};
})(jQuery);