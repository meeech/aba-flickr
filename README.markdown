aba-flickr
==========

Simple HTML/CSS/JS.

Mixes YUI and Shadowbox.

Meant for personal Gallery page, while still keeping flickr as backend/main archive.

Usage
-----

See aba.html for basic example.  

Included is a css skeleton, dev.css, a minimal look.  

For another example, see aba.css, which shows how to make a more complex/customized page by just changing the css.

Some simple configs  
**required**
<pre>
myConfig.flickrUserName = 'amisoll';
myConfig.flickrUserId = '35130544@N02';
</pre>
<pre>
myConfig.tags = ['montreal','montreal,night','israel','lighthouse','night'];
</pre>
**optional**
<pre>
//By default, we use Normal picture size. Set pictureSize to \_b for large images in shadowbox.
myConfig.pictureSize = '_b'; 
myConfig.galleryThumbsPerRow = 5;
</pre>


About
-----
Made for my dad.  He wanted a more personalized gallery for his photos.  
I wanted to keep it simple [ie: no backend for me to maintain,no php proxies], and needed to get comfy with YUI3.  
He already knows how to use flickr (via aperture). There may be bugs :) 
Work in progress atm.
