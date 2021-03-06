// @require yui3.1.0pr1
// Init so it has global scope - keeps things simpler.
var jsonFlickrFeed;

// domready wrapped in use
YUI().use(
    'anim', 'widget-anim',
    'node-event-simulate', 
    'cssreset','cssfonts', 'cssbase',
    'substitute', 'dump', 'overlay', function(Y) { Y.on("domready", function() { // BEGIN Y closure
//Our data dump. 
var abaConfig = YUI.namespace('flickr-site.config');
var bb = Y.namespace(abaConfig.flickrUserName.concat('.data'));

jsonFlickrFeed = function (data) {
    if( Y.Lang.isUndefined(data.items)) { return false; }  
    Y.one('#shell').prepend(initgallery(data));

    //Uncomment and change #id when debugging, so yo dont have to click all the time.
    // Y.one("div#lighthouse.tag>h2").simulate('click');
    return true;
};

/** 
 * This builds initial gallery - the index basically
 * also caches returned data into the bb.tagName
 *
 * @param data full returned data from flickr
 * @return Node (the container div)
 */
var initgallery = function(data) {
    var randomIndex = Math.floor(Math.random()*data.items.length); //Can this be a bug? ever be == length?    
    //We can filter based on usename plain english...
    var tagName = data.title.replace('Uploads from ' + abaConfig.flickrUserName + ', tagged ', ''),
        tagIndex = tagName.replace(/ /g, '-');

    //init the bb area for the gallery.
    bb[tagIndex] = {};

    var container = Y.Node.create('<div class="tag" id="' + tagIndex + '"></div>');

    container.append(Y.Node.create('<h2>' + tagName +'</h2>'));
    // container.append(Y.Node.create('<h3>' + data.items.length + '</h3>'));

    //Store data under tag name Make index image
    bb[tagIndex]['indexImage'] = data.items.slice(randomIndex,randomIndex+1)[0];
    bb[tagIndex]['indexImageNode'] = buildGalleryNode(bb[tagIndex]['indexImage'], {'title': tagName}).addClass('index');
    bb[tagIndex]['images'] = data.items;
    bb[tagIndex]['container'] = container;
    container.append(bb[tagIndex]['indexImageNode']);

    return container;
};

//Build all the gallery images. 
var buildGallery = function(tagName) {
    var tagIndex = tagName.replace(/ /g, '-');
    var imagesDiv = Y.Node.create('<div class="gallery-'+tagIndex+' gallery"></div>');
    Y.each( bb[tagIndex].images , function(item, index) {
         var node = buildGalleryNode(item, {'class' : 'thumb'} );
         imagesDiv.append(node);
    });

    return imagesDiv;
};

/**
 * 
 * @param item obj image data
 * @options usual - class, id, whatnot. will add as necessary
 * @return Node
 */
var buildGalleryNode = function(item, options) {
    options = options || {};
    var htmlT = "<div class='{class}'><a rel='shadowbox' title='{title}' href='{image_src}'><img src='{thumb_src}'></a><div class='title'>{title}</div></div>";
    item['thumb_src'] = item.media.m; //fix the src

    var suffix = abaConfig['pictureSize'] || '';
    item['image_src'] = item.media.m.replace('_m.jpg', suffix+'.jpg'); //fix the src
    item['class'] = options['class'] || '';
    item['title'] = options['title'] || item['title'];

    return Y.Node.create(Y.substitute(htmlT , item));
};

var buildGalleryOverlay = function(tagName) {
    var gallery = buildGallery(tagName),
        overlay;
        
    overlay = new Y.Overlay({
        headerContent: Y.Node.create("<h1>"+tagName+"</h1><div class='overlay-close'><span>Close</span></div>"),
        bodyContent: gallery,
        footerContent:"<div class='overlay-close'><span>Close</span></a>",
        id: "overlay-" + tagName.replace(/ /g, '-'),
        width: abaConfig.galleryWidth || "80%",
        zIndex: 10,
        centered: true
    });
    overlay.plug(Y.Plugin.WidgetAnim);
    return overlay;
};

Y.one('div#shell').delegate('click', function(e) {
    e.halt();
    //Handle Close Buttons in the hd and ft of the widget. They could really be anywhere in the widget, fyi.
    e.container.all('div.tag.active').removeClass('active');
    Y.Widget.getByNode(Y.one(this)).hide();
    bb['currentlyVisible'] = false;
}, 'div.overlay-close');

//show/hide the overlay when index image is clicked. 
//If overlay doesn't exist, builds it first.
Y.one('div#shell').delegate('click', function(e) {
    e.halt();

    //do the math...
    var tagName = this.get('title') || this.get('innerHTML'),
        tagIndex = tagName.replace(/ /g, '-'),
        overlay = bb[tagIndex]['overlay'] || false,
        currentlyVisible = bb['currentlyVisible'] || false;

    if(false === overlay) {
        overlay = buildGalleryOverlay(tagName);
        //Specify element specifically otherwise overlay appears UNDER index thumbs
        var thumbWidth = overlay.render("#shell")
            .get('boundingBox')
            //add a generic class
            .addClass('gallery-overlay')
            //Get the thumbwidth
            .one('div.thumb').getComputedStyle('width').replace('px','');

        //Due to bug, we are setting it in constructor, based on passed in config
        //When done this way, only first is being centered properly, 
        //but we can auto calculate it since we can get styles post render
        // var oWidth = thumbWidth * (abaConfig.galleryThumbsPerRow || 5);
        // overlay.set('width',oWidth);
        
        //We're using Shadowbox to display images. 
        overlay.on('click', function(e) { e.halt();});
        bb[tagIndex]['overlay'] = overlay;
    }

    if(currentlyVisible) {
        currentlyVisible.hide();
        e.container.all('div.tag.active').removeClass('active');
        bb['currentlyVisible'] = false;
    }
    //Don't show one we just hid
    if(overlay != currentlyVisible) {
        overlay.show();
        e.container.one('div#'+tagIndex+'.tag').addClass('active');
        bb["currentlyVisible"] = overlay;        
    }

    Shadowbox.setup("div#shell div.gallery-" + tagIndex + " div.thumb a", {
        "gallery": tagName
    });
},'div.tag>h2, div.index a');

var defaultArgs = ['id='+abaConfig.flickrUserId,'lang=en-us','format=json'];
var baseFlickrUrl = 'http://api.flickr.com/services/feeds/photos_public.gne?' + defaultArgs.join('&');

var urls = ['/shadowbox-3.0.2/shadowbox.js'];
Y.each(abaConfig.tags, function(el) {
    urls.push(baseFlickrUrl + "&tags="+el);
});

var objTransaction = Y.Get.script(urls, {
    onEnd: function() {
    },
    onSuccess: function() {
       Shadowbox.init({
           skipSetup: true
       });
    }
});

//end closure
});});

