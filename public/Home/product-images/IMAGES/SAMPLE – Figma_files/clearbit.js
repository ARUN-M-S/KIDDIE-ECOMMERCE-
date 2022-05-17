;(function (w) {
  if (w.__clearbit_tagsjs) {
    w.console &&
      w.console.error &&
      w.console.error("Clearbit tags.js snippet included twice.");
    return;
  }

  

  w.__clearbit_tagsjs = true;

  

  var destjs = document.createElement("script");
  destjs.src = 'https://x.clearbitjs.com/v2/pk_f3fcd5d6edce1bee1e03e72bec32724c/destinations.min.js'

  var first = document.getElementsByTagName("script")[0];
  destjs.async = true;
  first.parentNode.insertBefore(destjs, first);

  
    
      var tracking = (w.clearbit = w.clearbit || []);

      if (!tracking.initialize) {
        var clearbitjs = document.createElement("script");
        clearbitjs.src = 'https://x.clearbitjs.com/v2/pk_f3fcd5d6edce1bee1e03e72bec32724c/tracking.min.js';

        var first = document.getElementsByTagName("script")[0];
        clearbitjs.async = true;
        first.parentNode.insertBefore(clearbitjs, first);
      }
    

    
  

  
})(window);
