// ADMIN LOGIN VALIDATION
var adminLogin = $("#adminLogin");
adminLogin.validate({
  rules: {
    email: {
      required: true,
      email: true,
    },
    pass: {
      required: true,
      minlength: 5,
    },
  },
  messages: {
    email: {
      required: "This field is required",
    },
  },
});


// ADMIN ADD BRAND VALIDATION
var addBrandForm = $("#addBrandForm");
addBrandForm.validate({
  rules: {
    brandName: {
      required: true,
    },
    brandLogo: {
      required: true,
    },
  },
  messages: {
    brandLogo: {
      required: "Brand logo image is required",
    },
  },
});

// ADMIN ADD PRODUCT VALIDATION
var addProductForm = $("#addProductForm");
addProductForm.validate({
  rules: {
    productName: {
      required: true,
    },
    productDescription: {
      required: true,
    },
    productBrand: {
      required: true,
    },
    productCategory: {
      required: true,
    },
    productSubcategory: {
      required: true,
    },
    landingCost: {
      required: true,
      number:true
    },
    productPrice: {
      required: true,
      number:true
    },
    productQuantity: {
      required: true,
      number:true
    },
    productColour: {
      required: true,
    },
    product_Image_1: {
      required: true,
    },
    product_Image_2: {
      required: true,
    },
    product_Image_3: {
      required: true,
    },
    product_Image_4: {
      required: true,
    },
  },
});
// ADMIN EDIT PRODUCT VALIDATION
var editProductForm = $("#editProductForm");
editProductForm.validate({
  rules: {
    productName: {
      required: true,
    },
    productDescription: {
      required: true,
    },
    productBrand: {
      required: true,
    },
    productCategory: {
      required: true,
    },
    productSubcategory: {
      required: true,
    },
    landingCost: {
      required: true,
      number:true
    },
    productPrice: {
      required: true,
      number:true
    },
    productQuantity: {
      required: true,
      number:true
    },
    productColour: {
      required: true,
    },
  },

  submitHandler:
  //ON SUBMIT FORM
      function onsubmitForm(form){
        swal({
        title: "Are you sure?",
        text: "Are you sure to update this product?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((isOkay)=>{
        if(isOkay){
          form.submit()
        }
      })
      }

});





// USER LOGIN VALIDATION
var userLogin = $("#userLogin");
userLogin.validate({
  rules: {
    email: {
      required: true,
      email: true,
    },
    password: {
      required: true,
      minlength: 5,
    },
  },
  messages: {
    email: {
      required: "This field is required",
    },
  },
});

// ADD CATEGORY VALIDATION
var addCategoryForm = $("#addCategoryForm");
addCategoryForm.validate({
  rules: {
    category: {
      required: true,
    },
    subcategory: {
      required: true,
    },
  },
});

// ADD SUBCATEGORY VALIDATION
var addSubcategoryForm = $("#addSubcategoryForm");
addSubcategoryForm.validate({
  rules: {
    category: {
      required: true,
    },
    subcategory: {
      required: true,
    },
  },
});

// USER SIGNUP VALIDATION
var userSignup = $("#userSignupForm");
userSignup.validate({
  rules: {
    firstName: {
      required: true,
      minlength: 4,
    },
    lastName: {
      required: true,
      minlength: 1,
    },
    phone: {
      required: true,
      minlength: 10,
      number: true,
    },
    email: {
      required: true,
      email: true,
    },
    password: {
      required: true,
      minlength: 5,
    },
    confirmPass: {
      minlength: 5,
      equalTo: "#userPassword",
    },
  },
  messages: {
    email: {
      required: "This field is required",
    },
    phone: {
      minlength: "Phone Number Should Be 10 digit",
    },
    confirmPass: {
      equalTo: "Please Retype Same Password",
    },
  },
});

//   USER OTP FORM VALIDATION
var reqOtpForm = $("#reqOtpForm");
reqOtpForm.validate({
  rules: {
    phone: {
      required: true,
      number: true,
      minlength: 10,
    },
  },
  messages: {
    phone: {
      required: "Enter Mobile Number for Sending OTP",
      minlength: "Phone Number Should be 10 Digits",
    },
  },
});



// USER ADD ADDRESS VALIDATION
var addAddressForm = $("#addAddressForm");
addAddressForm.validate({
  rules: {
    name: {
      required: true,
      minlength:4
    },
    phone: {
      required: true,
      minlength:10
    },
    pincode: {
      required: true,
      number: true
    },
    locality: {
      required: true,
    },
    houseNumber: {
      required: true,
    },
    streetAddress: {
      required: true,
    },
    district: {
      required: true,
    },
    state: {
      required: true,
    },
    email: {
      required: true,
    },
  },
})

// EDIT PROFILE VALIDATION
var editProfileForm = $("#editProfileForm");
editProfileForm.validate({
  rules: {
    firstName: {
      required: true,
      minlength:4
    },
    lastName: {
      required: true,
      minlength: 5
    },
    phone: {
      required: true,
      number: true,
      minlength:10
    },
    email: {
      required: true,
      email:true
    },
  },
})


// ADD OFFER VALIDATION
var addOfferForm = $("#addOfferForm");
addOfferForm.validate({
  rules: {
    offerProduct: {
      required: true,
    },
    discount: {
      required: true,
      number: true
    },
    startDate: {
      required: true,
    },
    expiryDate: {
      required: true,
    },
  },
})

// ADD OFFER VALIDATION
var addOfferForm = $("#addCouponForm");
addOfferForm.validate({
  rules: {
    couponCode: {
      required: true,
    },
    discount: {
      required: true,
      number: true
    },
    startDate: {
      required: true,
    },
    expiryDate: {
      required: true,
    },
  },

})
// ADD OFFER VALIDATION
var salesReportForm = $("#salesReportForm");
salesReportForm.validate({
  rules: {
    fromDate: {
      required: true,
    },
    tillDate: {
      required: true,
    },
  },
})



//   FILTER INPUT FIELDS
function setInputFilter(textbox, inputFilter) {
  [
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mouseup",
    "select",
    "contextmenu",
    "drop",
  ].forEach(function (event) {
    textbox.addEventListener(event, function () {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  });
}

// ONLY NUMBER IN PHONE FIELD
// setInputFilter(document.getElementById("phoneNumber"), function (value) {
//   return /^\d*$/.test(value);
// });

// ONLY CHARACTER IN NAME FIELD
setInputFilter(document.getElementById("signupName1"), function (value) {
  return /^[a-z]*$/i.test(value);
});
// ONLY CHARACTER IN NAME FIELD
setInputFilter(document.getElementById("signupName2"), function (value) {
  return /^[a-z]*$/i.test(value);
});

// ONLY 10 NUMBERS IN PHONE FIELD
setInputFilter(document.getElementById("phoneNumber"), function (value) {
  return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 9999999999);
});

// ONLY INTEGER NUMBERS
setInputFilter(document.getElementById("number1"), function(value) {
  return /^\d*$/.test(value); 
});


// Check whether password and retype password is equal in signup page
$(document).ready(function () {
  $("#ConfirmPassword").on("keyup", function () {
    var password = $("#Password").val();
    var confirmPassword = $("#ConfirmPassword").val();
    if (password != confirmPassword)
    $("#CheckPasswordMatch")
    .html("Password does not match !")
    .css("color", "red");
    else
    $("#CheckPasswordMatch").html("Password match !").css("color", "green");
  });
});



function filevalidation(fileId){

  var fileInput = document.getElementById(fileId);
  var filePath = fileInput.value;
  
  // Allowing file type
  var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
  
  if (!allowedExtensions.exec(filePath)) {
  alert('Invalid file type\nOnly Image Files are Allowed');
  fileInput.value = '';
  return false;
  }

}
