
//Existing features
	//ARIA functionality
	//Keyboard navigation
	//User callback functions
	//Different ways to load content - AJAX, in-page, iFrame(?)
	//Can show multiple items as lightbox gallery (or not)


/*global google*/
/*global $*/
/*global document*/

//Simply lightbox plugin that contains ARIA bits 
//Note, this isn't automatically 'accessible' - content that gets inserted into lightbox still should be made accessible!






	/*Plugin pattern based on
https://raw.github.com/zenorocha/jquery-plugin-patterns/master/jquery.basic.plugin-boilerplate.js
*/
;(function ($, window, document, undefined) {
	"use strict";
	
	var lwLightbox = 'lwLightbox', defaults = {
		//Firstly all targets must be <a> tags within a div, or container element. Don't include any other sibling links in that div, which you don't want to be lightboxed
		//contentSource: 'selector' - 'content' is jQuery selector; 'html', 
		//if group
			//selector will mean that be the same index instance as the index of the link
			//html wil be the same on all links
		
		
		contentSource: "href",  //can be html, selector, or href
								//If href, this will load the target of the href (the <a> tag MUST have an href attribute, otherwise weird things happen
									//If an image, it'll show that
								//If this is set to 'html', and group is true, 'content' must be array of strings
								//If this is set to 'selector', and group is true, lightbox will load element matched by selector that has same index as target link's index (that is, within its matching siblings)
																	
		content: null, //Content opened in lightbox. If .contentSource is 'element' then this can be a jQuery selector like '#moreText'
						//can be null, HTML (e.g. '<p>Hello</p>'), selector (for jQuery selector string (e.g. '.moreText'))
		enableKeyboardNav: true, //If true, this enables escape to close, and left/right arrows to cycle through lightbox
				
		group:false,				
		
		label: "Gallery", //used for screenreaders
		showLabel: true,
		selectorSuffix: null, //Should be a string, e.g. '-lightbox'
		//This plugin was developed specifically for Silva CMS users. If a Silva editor wants to add links that launch lightboxes in the page, they'll need a way to specify that these links should launch a lightbox (and not just work as typical links). Because Silva only allows editors to add an href attribute (and nothing like an 'id', or data objects), a specified suffix (as set by this property) can be added to a link, which will launch the lightbox. For instance, a Silva editor could use 'myDoc.htm-lightbox' as a link, if myDoc.htm is the page to open, and '-lightbox' is the suffix.
		cms: false,
		cmsContentSuffix: null,
		onOpen: function () {
			
		},
		onClose: function () {
		
		}
	};

	function LwPlugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults; // vars that are not meant to be used publicly ... why do I need them assigned like this?
        this._name = lwLightbox;
        this.init();
    }
     
    LwPlugin.prototype.init = function () {
		var that = this; 
		this.currentIndex = 0;
		this.groupLength = 0;	
		this.loadingMessage = "<p aria-hidden='true'>Loading</p>";
		var suffix = this.options.selectorSuffix, $obj = $(this.element);
		//Amend href
		//Only trigger this if its href includes suffix
		
		$obj.click(function () {
			
			if (suffix) {
				var href = $obj.attr("href");
				//If there is a suffix, and  this link contains it, open in lightbox. Otherwise, link will open as normal
				if (href.lastIndexOf(suffix) !== -1) {
					//Amend href attribute to not include custom suffix
					//that.removeLinkSuffix($obj);
					that.open($(this));	
					return false;	
				}
			} else {
				
				that.open($(this));
				return false;
			}
		});
	};
	
	LwPlugin.prototype.removeLinkSuffix = function ($linkElement) {
		var href = $linkElement.attr("href");
		//$linkElement.attr("href", href.replace(this.options.selectorSuffix, ''));	
		
		//this.elementLink is the current object's link
		 return href.replace(this.options.selectorSuffix, '');
	};
    
    LwPlugin.prototype.cmsSettings = function () {
		//Check if href includes 'nonCms'
		var obj = $(this.element);
		var href;
		//If CMS editor doesn't add '-nonCMS' to link, plugin will pull in Silva document content (rather than full webpage)
		if (obj.attr("href").lastIndexOf("-nonCms") === -1) {
			//If not add /@@content to href
			href = obj.attr("href");
			href += this.options.cmsContentSuffix;
			obj.attr("href", href);
		}
    };
     
     //Turns target content into Lightbox suitable HTML, based on whether it's set to load an image or HTML
	LwPlugin.prototype.convertContent = function (i) {
    	
		var contentHtm = "", that = this;
		var content = this.options.content, group = this.options.group;
		var obj = $(this.element);
	
		switch (this.options.contentSource) {
		
		case "selector":
			//Simply copying HTML of selector, and duplicating it in lightbox. 
			//Am assuming this is faster to process than .clone, but haven't tested
			contentHtm = (i) ? $(content).eq(i).html() : $(content).html();	
			_insertLBHtml(i, contentHtm);
			break;
			
		case "href":			
			//If this is a grouped lightbox, ensure object is on current index
			if (group) {
				obj = obj.parent().find("a:eq(" + i + ")");
			}
			
			var currentHref = this.removeLinkSuffix(obj);
			
			//If image  (?:jpg|gif|png)
			var imgPattern =new RegExp(/\.(jpg|gif|png)$/);
			if (imgPattern.test(currentHref)) {
				//If image file
				contentHtm = "<img src=\"" + currentHref + "\" alt=\"\" />";
				_insertLBHtml(i, contentHtm);
			} else {
				//If any other type of file
				$.ajax({
					url: currentHref,
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
    
    //Convert content into LB suitable HTML, then insert into lightbox
	var _insertLBHtml = function (i, newContent) {
		//Replace lightbox content with new index's content
		var lbWidth;
		var positionLB = function () {
			lbWidth += "px";
			$("#lwLightbox").css({
				"marginLeft": lbWidth,
				"left": "50%"
			});
		};
		//Load lightbox HTML offscreen, so we can calculate its width
		$("#lwLightbox").css("left", "-9999px"); //could we use addClass("lwHidden") ? 
		$("#lbContent")
			.html(newContent)
			.hide();
			//.attr('aria-busy', false);
			//Focus on lightbox first title (which is effectively the ARIA dialog label)
			
		
		//If there's an image, check the width (only set for 1 image, so may need to expand this to get the largest image in array)
		if ($("#lbContent").find("img").length > 0) {
			$("#lbContent").find("img").load(function () {
				lbWidth = -(($(this).width() + 170) / 2);
				positionLB();
			});
		} else {
		//If just HTML (this doesn't necessarily work getting widths for images, which will need to be preloaded, as above)
			lbWidth = 400;//Default lightbox width?
			lbWidth = -lbWidth / 2;
			positionLB();
		}
    };    
    
    LwPlugin.prototype.open = function (thisElement) {
		var that = this, obj = $(this.element);
		var group = this.options.group, onOpen = this.options.onOpen;
		
		if (this.options.cms) {
			that.cmsSettings();
		}
		
		//Set lightbox to show loading text until content loads
		$("#lbContent").html(this.loadingMessage);
		//Build and display lightbox overlay and container
		var showLabelHtml = (this.options.showLabel) ? "" : " class='lwHidden'";
		var overlay = "<div id='overlay'></div>";//Don't like the way this is created/deleted each time - should be hidden instead.
		var contentHtm = "<div id='lwLightbox' role='dialog' aria-labelled-by='lbLabel' tabIndex='-1'><div id='lbInfo' class='shadow'><div id='lbLabel'" + showLabelHtml + "><h3>" + this.options.label + "</h3></div><div id='closeInfo'><p><a href='' role='button'>Close<span class='lwHidden'>(Escape)</span></a></p></div></div><div id='lbContent' aria-live='assertive' aria-busy='true' aria-relevant='additions removals text'></div></div>";
		$("body").append(overlay + contentHtm);

		//if this is a grouped lightbox
		if (group) {
			$("#lwLightbox").append("<div id='arrows'><div id='arrowL'><a role='button' href=''>Display previous item</a></div><div id='arrowR'><a role='button' href=''>Display next item</a></div></div>");
			
			//thisElement is obj (ie <a>)
			var siblings = obj.parent().find("a");  
			
			//Do I need thisElement? Why not this.element!?
			//this.currentIndex = $("a").index(thisElement);
			this.currentIndex = siblings.index(thisElement);
			
			this.groupLength = obj.parent().find(">a").length;
			
			var setLBGroupContent = function () {
				//Show/hide arrows, depending on currentIndex
				//Can this be made more efficient?
				
				if (that.currentIndex === 0) {
					$("#arrowL").hide();	
				} else {
					$("#arrowL").show();	
				}
				
				if (that.currentIndex === that.groupLength-1) { 
					$("#arrowR").hide();	
				} else {
					$("#arrowR").show();
				}
				//Insert HTML content into lightbox	
				$("#lbContent").html(that.loadingMessage);
				that.convertContent(that.currentIndex);
			};
				
			setLBGroupContent();
				
			//Add event handlers here, as .open method is only loaded once when lightbox opens (rather than every time plugin is instantiated)
			$("#arrowL > a").bind('click', function () {
				if (that.currentIndex !== 0) {
					that.currentIndex--;
					setLBGroupContent();	
				}
				return false;
			});
			$("#arrowR > a").bind('click', function () {
				if (that.currentIndex !== that.groupLength) {
					that.currentIndex++;
					setLBGroupContent();
				}
				return false;
			});	
		} else { 
			//If this is for a single lightbox
			//For single lightboxes, set currentIndex to 0 because there aren't any more to come
			this.currentIndex = 0;
			//Insert HTML content into lightbox
			this.convertContent(this.currentIndex);
		}
		//this.displayLightbox();
		$("#overlay").fadeIn('500');
		$("#lwLightbox").fadeIn('400');

		//Close event triggers
		$("#closeInfo a, #overlay").bind('click', function (event) {
			that.closeLightbox();
			return false;
		});
		if (this.options.enableKeyboardNav) {
			$("#lwLightbox").focus().bind('keyup', function (e) {
				//Escape key closes lightbox, and left/right cursor keys move to prev/next items in a group
				if (e.keyCode === 27) {
					$("#closeInfo a").click();
				} else if (that.options.group) {
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
		
	LwPlugin.prototype.closeLightbox = function () {
		var onClose = this.options.onClose;
		var that = this;
		//Unbind event handlers which were bound when lightbox loaded, otherwise there'll be a memory leak
		$("#arrowL > a, #arrowR > a, #closeInfo a, #overlay").unbind('click');
		if (this.options.enableKeyboardNav) { $("#lwLightbox").unbind('keyup');}
		
		$("#overlay").fadeOut('500', function () {
			$(this).remove();
		});
		$("#lwLightbox").fadeOut('500', function () {
			$(this).remove();
			//Callback function
			if ($.isFunction(onClose)) {
				that.options.onClose();
			} else {
				throw ("onClose property is not a function");	
			}
		});
	};
   
    $.fn[lwLightbox] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + lwLightbox)) {
                $.data(this, 'plugin_' + lwLightbox, new LwPlugin(this, options));
            }
        });
    };
})(jQuery, window);