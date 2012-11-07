#Lightweight Lightbox jQuery Plugin

##About

A simply jQuery plugin which aims to provide basic lightbox functionality. It doesn't have all the many features that some popular lightbox plugins have, but it does have ARIA functionality, and aims to be  light/efficient.

The lightbox should also work with screenreader applications by implementing standard ARIA elements and attributes. Additional accessibility is also present, such as refocusing keyboard to the lightbox on launching, and keyboard control of the lightbox.

Standard lightbox features are present also: lightbox groups, AJAX/iFrame content, animated resizing, etc.

This version of the plugin has been developed for XHTML, but an HTML5 version is also planned.

Works with IE8+, and all other modern browsers

##Usage

Load lwLightbox.css and jquery.lwLightbox.js (in that order) into your webpage, then add the following jQuery script at the end of your document (or wherever seems best for you):

	<script type="text/javascript">
	$("a.lightbox").lwLightbox();
	</script>

The selector here should obviously be for any links that you would like to use to launch the lightbox. Now the 'href' value of any matched links will launch the lightbox. See bottom of readme for customising plugin for use in a CMS.


##Options

- autoSize (default: true). Set true to automatically resize lightbox to be size of content. If the lightbox content is too big to fit in the viewport, the lightbox will fill most of the screen, and add scrollbars where necessary so that content is still accessible. If false, lightbox will always cover most of the screen
- defaultWidth (default: 400). The default width of the lightbox content if content is not iframe or image. Note, dimensions can also be set for each lightbox segment via CSS (see notes below)
- enableKeyboardNav (default: true). Set to true to allow keys to control lightbox. Left and right cursor keys transition lightbox to previous or next segment, and the Escape key closes it.
- externalPageMethod (default: 'ajax'). Sets how external URLs (apart from images) are loaded into lightbox. Can be 'ajax' or 'iframe'
- group (default: false). If multiple links are used in the page to launch the lightbox, set this to true to transition between them within the lightbox (see demo).
- label (default: 'Gallery'). Header / ARIA label for lightbox
- showLabel (default: true). Show or hide lightbox header. If false, ARIA label will still be present - the heading will just not display.
- loadingMessage (default: "<p>Loading</p>"). Set the HTML for the loading message which appears while the lightbox content is loading.
- selectorSuffix (default: null). See 'Usage in a CMS' below.
- cms: (default: false). See 'Usage in a CMS' below.
- cmsContentSuffix (default: null). See 'Usage in a CMS' below.

##Public methods

-onOpen: Runs after lightbox has opened
-onClose: Runs after lightbox has closed
-onTransition: Runs after lightbox has moved to next/previous segment


##Further notes

In the group setting is true, a class is added to the lightbox content container div (#lbContent) - .lbSegment0. The number at the end of this class name changes to the number of the group segment (e.g. for the first it is 0, for the second it is 1, etc.). You can then use CSS to the style individual lightbox segments.


##Usage in a CMS
###WYSIWYG editors
To set a WYSIWYG editor to work with the lightbox, load the CSS and JS files as above, and then add the following to the bottom of the page

	<script type="text/javascript">
	var suffix = "-lightbox";
	$("a[href$=" + suffix + "]").lwLightbox({
		selectorSuffix: suffix
	});
	</script>

Now, WYSIWYG editors can add '-lightbox' to any link in the page, which will then launch the lightbox. E.g. the link 'mypage.htm-lightbox' will now launch 'mypage.htm' in the lightbox. Obviously this isn't a perfect solution: this will mean that non-JS users or searchbots will not be able to follow such links... so be warned.

####Silva CMS content
The Silva CMS API will allow 'raw' documents to be shown on a browser, if the following 'suffix' is added to the URL:

	/@@ucl_default_content_area

This is useful if you want to show a Silva page in a lightbox, as you're probably only going to want the page's content, and not its associated navigation, menus, headers, footers, etc.

You can set this suffix to be added on automatically, by loading the lightbox with the following options:


	$("a").lwLightbox({
		cms: true,
		cmsContentSuffix: "/@@ucl_default_content_area:
	});
	</script>

After setting this up, there may be the odd exception where you don't want to load a URL with such a suffix. In such cases, you can also add '-nonCms' to the link href attribute, e.g. 'myLink.htm-nonCms'. Again, be warned that this will obviously cause issues for non-JS users and searchbots, so be careful...


