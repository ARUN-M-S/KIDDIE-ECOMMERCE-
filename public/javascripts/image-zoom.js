"use strict";

/*!
jQuery Plugin developed by Mario Duarte
https://github.com/Mario-Duarte/image-zoom-plugin/
Simple jQuery plugin that converts an image into a click to zoom image
perfect for store products and galleries
*/
(function ($) {
  // Thanks to Mozilla for this polyfill
  // find out more on - https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/replaceWith
  function ReplaceWithPolyfill() {
    'use-strict'; // For safari, and IE > 10

    var parent = this.parentNode,
        i = arguments.length,
        currentNode;
    if (!parent) return;
    if (!i) // if there are no arguments
      parent.removeChild(this);

    while (i--) {
      // i-- decrements i and returns the value of i before the decrement
      currentNode = arguments[i];

      if (typeof currentNode !== 'object') {
        currentNode = this.ownerDocument.createTextNode(currentNode);
      } else if (currentNode.parentNode) {
        currentNode.parentNode.removeChild(currentNode);
      } // the value of "i" below is after the decrement


      if (!i) // if currentNode is the first argument (currentNode === arguments[0])
        parent.replaceChild(currentNode, this);else // if currentNode isn't the first
        parent.insertBefore(currentNode, this.previousSibling);
    }
  }

  if (!Element.prototype.replaceWith) {
    Element.prototype.replaceWith = ReplaceWithPolyfill;
  }

  if (!CharacterData.prototype.replaceWith) {
    CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
  }

  if (!DocumentType.prototype.replaceWith) {
    DocumentType.prototype.replaceWith = ReplaceWithPolyfill;
  }

  const imageObj = {};

  $.fn.imageZoom = function (options) {
    // Default settings for the zoom level
    let settings = $.extend({
      zoom: 150
    }, options); // Main html template for the zoom in plugin

    imageObj.template = `
			<figure class="containerZoom" style="background-image:url('${this.attr('src')}'); background-size: ${settings.zoom}%;">
				<img id="imageZoom" src="${this.attr('src')}" alt="${this.attr('alt')}" />
			</figure>
		`; // Where all the magic happens, This will detect the position of your mouse
    // in relation to the image and pan the zoomed in background image in the
    // same direction

    function zoomIn(e) {
      let zoomer = e.currentTarget;
      let x, y, offsetX, offsetY;
      e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX;
      e.offsetY ? offsetY = e.offsetY : offsetY = e.touches[0].pageX;
      x = offsetX / zoomer.offsetWidth * 100;
      y = offsetY / zoomer.offsetHeight * 100;
      $(zoomer).css({
        "background-position": `${x}% ${y}%`
      });
    } // Main function to attach all events after replacing the image tag with
    // the main template code


    function attachEvents(container) {
      container = $(container);
      container.on('click', function (e) {
        if ("zoom" in imageObj == false) {
          // zoom is not defined, let define it and set it to false
          imageObj.zoom = false;
        }

        if (imageObj.zoom) {
          imageObj.zoom = false;
          $(this).removeClass('active');
        } else {
          imageObj.zoom = true;
          $(this).addClass('active');
          zoomIn(e);
        }
      });
      container.on('mousemove', function (e) {
        imageObj.zoom ? zoomIn(e) : null;
      });
      container.on('mouseleave', function () {
        imageObj.zoom = false;
        $(this).removeClass('active');
      });
    }

    let newElm = $(this).replaceWith(imageObj.template);
    attachEvents($('.containerZoom')[$('.containerZoom').length - 1]); // return updated element to allow for jQuery chained events

    return newElm;
  };
})(jQuery);