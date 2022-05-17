"use strict";
/*!
jQuery Plugin developed by Mario Duarte
https://github.com/Mario-Duarte/image-zoom-plugin/
Simple jQuery plugin that converts an image into a click to zoom image
perfect for store products and galleries
*/
/*!
jQuery Plugin developed by Mario Duarte
https://github.com/Mario-Duarte/image-zoom-plugin/
Simple jQuery plugin that converts an image into a click to zoom image
perfect for store products and galleries
*/
!function(t){function e(){var t,e=this.parentNode,o=arguments.length;if(e)for(o||e.removeChild(this);o--;)"object"!=typeof(t=arguments[o])?t=this.ownerDocument.createTextNode(t):t.parentNode&&t.parentNode.removeChild(t),o?e.insertBefore(t,this.previousSibling):e.replaceChild(t,this)}Element.prototype.replaceWith||(Element.prototype.replaceWith=e),CharacterData.prototype.replaceWith||(CharacterData.prototype.replaceWith=e),DocumentType.prototype.replaceWith||(DocumentType.prototype.replaceWith=e);const o={};t.fn.imageZoom=function(e){let i=t.extend({zoom:150},e);function r(e){let o,i,r,a,n=e.currentTarget;r=e.offsetX?e.offsetX:e.touches[0].pageX,a=e.offsetY?e.offsetY:e.touches[0].pageX,o=r/n.offsetWidth*100,i=a/n.offsetHeight*100,t(n).css({"background-position":`${o}% ${i}%`})}o.template=`\n\t\t\t<figure class="containerZoom" style="background-image:url('${this.attr("src")}'); background-size: ${i.zoom}%;">\n\t\t\t\t<img id="imageZoom" src="${this.attr("src")}" alt="${this.attr("alt")}" />\n\t\t\t</figure>\n\t\t`;let a=t(this).replaceWith(o.template);var n;return n=t(".containerZoom")[t(".containerZoom").length-1],(n=t(n)).on("click",function(e){"zoom"in o==0&&(o.zoom=!1),o.zoom?(o.zoom=!1,t(this).removeClass("active")):(o.zoom=!0,t(this).addClass("active"),r(e))}),n.on("mousemove",function(t){o.zoom&&r(t)}),n.on("mouseleave",function(){o.zoom=!1,t(this).removeClass("active")}),a}}(jQuery);