// Init so it has global scope - keeps things simpler.
var jsonFlickrFeed;
// Used for filtering to get the tag name

// domready wrapped in use
YUI().use('node', 'substitute', 'dump', 'event-delegate', function(Y) { Y.on("domready", function() { // BEGIN Y closure
//Our data dump. 
var bb = Y.namespace(abaConfig.flickrUserName.concat('.data'));

jsonFlickrFeed = function (data) {
    if( Y.Lang.isUndefined(data.items)) { return false; }  
    Y.one('#shell').prepend(initgallery(data));
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
    // var randomIndex = Math.floor(Math.random()*data.items.length); //Can this be a bug? ever be == length?    
    var randomIndex = 1;
    
    //We can filter based on usename plain english...
    var tagName = data.title.replace('Uploads from ' + abaConfig.flickrUserName + ', tagged ', '');
    bb[tagName] = {};
    bb[tagName]['gallery'] = false;

    var container = Y.Node.create('<div id="' + tagName + '"></div>');

    container.append(Y.Node.create('<h2>' + tagName +'</h2>'));
    container.append(Y.Node.create('<h3>' + data.items.length + '</h3>'));

    //The area where we show thumbnails
    //Trick here is we only want to create the item once..
    Y.one('div#thumbs') || Y.one('#shell').append(Y.Node.create('<div id="thumbs"></div>'));

    //Store data under tag name Make index image
    bb[tagName]['indexImage'] = data.items.slice(randomIndex,randomIndex+1)[0];
    bb[tagName]['indexImageNode'] = buildGalleryNode(bb[tagName]['indexImage'], {'title': tagName}).addClass('index');
    bb[tagName]['images'] = data.items;
    bb[tagName]['container'] = container;
    container.append(buildGalleryNode(bb[tagName]['indexImage'], {'title': tagName}).addClass('index'));
    return container;
};

//Build all the gallery images. 
var buildGallery = function(tag) {
    var imagesDiv = Y.Node.create('<div class="hide gallery"></div>');
    Y.each( bb[tag].images , function(item, index) {
         var node = buildGalleryNode(item, {'class' : 'shadowbox'} );
         imagesDiv.append(node);
    });
    
    bb[tag]['gallery'] = imagesDiv;    
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
    var htmlT = "<div class='{class}'><a title='{title}' href='{image_src}'><img src='{thumb_src}'></a><span>{title}</span></div>";
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
    var tagName = this.get('title') || this.get('innerHTML');
    var gallery = bb[tagName]['gallery'] || buildGallery(tagName);

    if(false == gallery.inDoc()) {
        // e.container.append(gallery);
        Y.one('#thumbs').append(gallery);
        // bb[tagName]['container'].append(gallery);        
    }

    //Trying to hide any open galleries before showing new one. caling it a night
    if(gallery.hasClass('hide')){
        if(Y.one('#thumbs').one('div.showing')){
            Y.one('#thumbs').one('div.showing').replaceClass('showing', 'hide');
        }
        gallery.replaceClass('hide', 'showing');
       // gallery.toggleClass('hide');
    } else {
        gallery.toggleClass('hide');
    }

    // gallery.replaceClass('showing', 'hide');
    
}, 'div#shell',  'h2,div.index a');

/* Shadowbox image*/
Y.delegate('click', function(e) {
    e.halt();    
    Shadowbox.open({
       content:    this.get('href'),
       player:     "img",
       title:      this.title || ''
    });

}, 'div#shell', 'div.shadowbox a');

var defaultArgs = ['id='+abaConfig.flickrUserId,'lang=en-us','format=json'];
var baseFlickrUrl = 'http://api.flickr.com/services/feeds/photos_public.gne?' + defaultArgs.join('&');

var urls = ['/shadowbox-3.0.2/shadowbox.js'];
Y.each(abaConfig.tags, function(el) {
    urls.push(baseFlickrUrl + "&tags="+el);
});

var objTransaction = Y.Get.script(urls, {
    onEnd: function() {
        Shadowbox.init({
            skipSetup: true
        });
    }
});

//end closure
});});

