// function otpform(){

//     var first = document.getElementById("num1").value;
//     var second = document.getElementById("num2").value;
//     var third = document.getElementById("num3").value;
//     var fourth = document.getElementById("num4").value;

//     var otpnumber = first+second+third+fourth
//     var phoneNumber = document.getElementById("phonnumber").value;


// $.ajax({
//     url:'/otp-verify?phonenumber='+phoneNumber+'&otpnumber='+otpnumber,
//     method:'get',
//     success:(response)=>{
//         if(response){
//             window.location.replace("/");
//         }else{
//             document.getElementById("error").classList.remove("otperror");
//         }
//     }
// })


// }