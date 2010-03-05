// Init so it has global scope - keeps things simpler.
var jsonFlickrFeed;
// domready wrapped in use
YUI().use('node-event-simulate', 'cssreset','cssfonts', 'cssbase', 'node', 'substitute', 'dump', 'event-delegate', 'overlay', function(Y) { Y.on("domready", function() { // BEGIN Y closure
//Our data dump. 
var bb = Y.namespace(abaConfig.flickrUserName.concat('.data'));

jsonFlickrFeed = function (data) {
    if( Y.Lang.isUndefined(data.items)) { return false; }  
    Y.one('#shell').prepend(initgallery(data));
    
    // Y.one("div#night.tag>h2").simulate('click');
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
    var tagName = data.title.replace('Uploads from ' + abaConfig.flickrUserName + ', tagged ', '');

    //init the bb area for the gallery.
    bb[tagName] = {};

    var container = Y.Node.create('<div class="tag" id="' + tagName + '"></div>');

    container.append(Y.Node.create('<h2>' + tagName +'</h2>'));
    container.append(Y.Node.create('<h3>' + data.items.length + '</h3>'));

    //Store data under tag name Make index image
    bb[tagName]['indexImage'] = data.items.slice(randomIndex,randomIndex+1)[0];
    bb[tagName]['indexImageNode'] = buildGalleryNode(bb[tagName]['indexImage'], {'title': tagName}).addClass('index');
    bb[tagName]['images'] = data.items;
    bb[tagName]['container'] = container;
    container.append(bb[tagName]['indexImageNode']);

    return container;
};

//Build all the gallery images. 
var buildGallery = function(tag) {
    var imagesDiv = Y.Node.create('<div class="gallery"></div>');
    Y.each( bb[tag].images , function(item, index) {
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
    item['image_src'] = item.media.m.replace('_m.jpg', '_b.jpg'); //fix the src
    item['class'] = options['class'] || '';
    item['title'] = options['title'] || item['title'];

    return Y.Node.create(Y.substitute(htmlT , item));
};

//Show hide the gallery thumbs...
//show the stack when cover image is clicked. 
//remove hide class from the stack,
//hide index
Y.delegate('click', function(e) {
    e.halt();

    var tagName = this.get('title') || this.get('innerHTML'),
        overlay = bb[tagName]['overlay'] || false,
        currentlyVisible = bb['currentlyVisible'] || false;

    //Maybe have it position itself below the thumbs, and just dont bother with CLOSE button - clicking on index thumbs will close one gal, open the other. 
    if(false === overlay) {
        overlay = new Y.Overlay({
            headerContent: Y.Node.create("<h1>"+tagName+"</h1><div class='overlay-close'><span>Close</span></div>"),
            bodyContent: buildGallery(tagName),
            footerContent:"<div class='overlay-close'><span>Close</span></a>",
            // height: Y.DOM.winHeight()+'px',
            // height: '400px',
            zIndex: 10
            // centered: Y.one("#shell")
        });
        //Specify element specifically, otherwise overlay appears UNDER index thumbs
        overlay.render("#shell").get('boundingBox').addClass('gallery-overlay');
        bb[tagName]['overlay'] = overlay;
    }

    if(currentlyVisible) {
        currentlyVisible.hide();
    }
    overlay.show();
    bb["currentlyVisible"] = overlay;

    Shadowbox.setup("div#shell div.thumb a", {
        "gallery": tagName
    });
}, 'div#shell',  'div.tag>h2,div.tag>h3, div.index a');

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

