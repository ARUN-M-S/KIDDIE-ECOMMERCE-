/*  ---------------------------------------------------
    Template Name: Male Fashion
    Description: Male Fashion - ecommerce teplate
    Author: Colorib
    Author URI: https://www.colorib.com/
    Version: 1.0
    Created: Colorib
---------------------------------------------------------  */

"use strict";

(function ($) {
  /*------------------
        Preloader
    --------------------*/
  $(window).on("load", function () {

    /*------------------
            Gallery filter
        --------------------*/
    $(".filter__controls li").on("click", function () {
      $(".filter__controls li").removeClass("active");
      $(this).addClass("active");
    });
    if ($(".product__filter").length > 0) {
      var containerEl = document.querySelector(".product__filter");
      var mixer = mixitup(containerEl);
    }
  });

  /*------------------
        Background Set
    --------------------*/
  $(".set-bg").each(function () {
    var bg = $(this).data("setbg");
    $(this).css("background-image", "url(" + bg + ")");
  });

  //Search Switch
  $(".search-switch").on("click", function () {
    $(".search-model").fadeIn(400);
  });

  $(".search-close-switch").on("click", function () {
    $(".search-model").fadeOut(400, function () {
      $("#search-input").val("");
    });
  });

  /*------------------
		Navigation
	--------------------*/
  $(".mobile-menu").slicknav({
    prependTo: "#mobile-menu-wrap",
    allowParentLinks: true,
  });

  /*------------------
        Accordin Active
    --------------------*/
  $(".collapse").on("shown.bs.collapse", function () {
    $(this).prev().addClass("active");
  });

  $(".collapse").on("hidden.bs.collapse", function () {
    $(this).prev().removeClass("active");
  });

  //Canvas Menu
  $(".canvas__open").on("click", function () {
    $(".offcanvas-menu-wrapper").addClass("active");
    $(".offcanvas-menu-overlay").addClass("active");
  });

  $(".offcanvas-menu-overlay").on("click", function () {
    $(".offcanvas-menu-wrapper").removeClass("active");
    $(".offcanvas-menu-overlay").removeClass("active");
  });

  /*-----------------------
        Hero Slider
    ------------------------*/
  $(".hero__slider").owlCarousel({
    loop: true,
    margin: 0,
    items: 1,
    dots: false,
    nav: true,
    navText: [
      "<span class='arrow_left'><span/>",
      "<span class='arrow_right'><span/>",
    ],
    animateOut: "fadeOut",
    animateIn: "fadeIn",
    smartSpeed: 1200,
    autoHeight: false,
    autoplay: false,
  });

  /*--------------------------
        Select
    ----------------------------*/
  $("select").niceSelect();

  /*-------------------
		Radio Btn
	--------------------- */
  $(
    ".product__color__select label, .shop__sidebar__size label, .product__details__option__size label"
  ).on("click", function () {
    $(
      ".product__color__select label, .shop__sidebar__size label, .product__details__option__size label"
    ).removeClass("active");
    $(this).addClass("active");
  });

  /*-------------------
		Scroll
	--------------------- */
  $(".nice-scroll").niceScroll({
    cursorcolor: "#0d0d0d",
    cursorwidth: "5px",
    background: "#e5e5e5",
    cursorborder: "",
    autohidemode: true,
    horizrailenabled: false,
  });


  /*-------------------
		Quantity change
	--------------------- */
  var proQty = $(".pro-qty");
  proQty.prepend('<span class="fa fa-angle-up dec qtybtn"></span>');
  proQty.append('<span class="fa fa-angle-down inc qtybtn"></span>');
  proQty.on("click", ".qtybtn", function () {
    var $button = $(this);
    var oldValue = $button.parent().find("input").val();
    if ($button.hasClass("dec")) {
      var newVal = parseFloat(oldValue) + 1;
    } else {
      // Don't allow decrementing below zero
      if (oldValue > 0) {
        var newVal = parseFloat(oldValue) - 1;
      } else {
        newVal = 0;
      }
    }
    $button.parent().find("input").val(newVal);
  });

  var proQty = $(".pro-qty-2");
  proQty.prepend('<span class="fa fa-angle-left dec qtybtn"></span>');
  proQty.append('<span class="fa fa-angle-right inc qtybtn"></span>');
  proQty.on("click", ".qtybtn", function () {
    var $button = $(this);
    var oldValue = $button.parent().find("input").val();
    if ($button.hasClass("inc")) {
      var newVal = parseFloat(oldValue) + 1;
    } else {
      // Don't allow decrementing below zero
      if (oldValue > 0) {
        var newVal = parseFloat(oldValue) - 1;
      } else {
        newVal = 0;
      }
    }
    $button.parent().find("input").val(newVal);
  });

  /*------------------
        Achieve Counter
    --------------------*/
  $(".cn_num").each(function () {
    $(this)
      .prop("Counter", 0)
      .animate(
        {
          Counter: $(this).text(),
        },
        {
          duration: 4000,
          easing: "swing",
          step: function (now) {
            $(this).text(Math.ceil(now));
          },
        }
      );
  });
})(jQuery);



// 
// ADD TO CART
// 

function addToCart(proId,subTotal){
  $.ajax({
    url: '/add-to-cart/'+proId,
    data:{
      productTotal:subTotal
    },
    method: 'post',
    success:(response)=>{
      if(response.status){

        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
          }
        })
        Toast.fire({
          icon: 'success',
          title: 'Product Added To Cart'
        })
        let count = $('.cart-count').html()
        count = parseInt(count) + 1
        $('.cart-count').html(count)
      }
      else if(response.productExist){

        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
          }
        })
        Toast.fire({
          icon: 'warning',
          title: 'Product Already Exists On Cart'
        })
      }
      else{
        location.replace('/login')
      }
    }
  })
}

function addToWishlist(proId,userId){
  $.ajax({
    url: "/add-to-wishlist",
    method: "post",
    data: {proId,userId},
    success:(res)=>{
      if(res.status){ 
        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
          }
        })
        Toast.fire({
          icon: 'success',
          title: 'Wishlisted successfully'
        })
        // location.reload()
      }
      else if(res.productExist){
        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
          }
        })
        Toast.fire({
          icon: 'warning',
          title: 'Already in wishlist'
        })
      }
      else{
        location.replace('/login')
      }
    }
  })
}


function deleteCartProduct(cartId,proId,variantId){

  swal({
    title: "Are you sure?",
    text: "Would you like to remove this product from cart ?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {

      $.ajax({
        url: '/delete-cart-product',
        data:{
          cartId:cartId,
          proId:proId,
          varId:variantId
        },
        method: 'post',
        success:(response)=>{
          if(response){
            swal("Product deleted from cart", {
              icon: "success",
            });
          }
          location.reload()
        }
      })
    } 
  });

}


function deleteAddress(addressId){
  swal({
    title: "Are you sure?",
    text: "Would you like to remove this address ?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete)=>{
    if(willDelete){
      $.ajax({
        url: '/delete-address',
        method: 'post',
        data:{addressId},
        success:(resp)=>{
          if(resp.status){
            location.replace('/myaddress')
          }
        }
      })
    }
  })
}


function getSubProducts(subName){
  $.ajax({
    url: '/getSubProducts',
    method: 'post',
    data: {subName},
    success:(status)=>{
      location.href = '/product-list'
    }
  })
}
