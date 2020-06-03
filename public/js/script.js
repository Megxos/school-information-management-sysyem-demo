$(document).ready(function(){
    console.log("connected")
    $("table tbody td, th").addClass("p-2")
    $(".nav-item p").addClass("text-center")

     if ($("#age").val() <= 0) {
         console.log("error")
         $("#age-summary small").text("Age cannot be less than or equal to zero")
         $("#age-summary small").css("color", "red")
         $("#save").addClass("disabled")
         $("#save").fadeOut()
     } else {
         $("#age-summary small").text("")
         $("#save").fadeIn()
         $("#save").removeClass("disabled")
     } 

    $("#age").on("change paste keyup", function(){
        if($(this).val() <= 0 ){
            console.log("error")
            $("#age-summary small").text("Age cannot be less than or equal to zero")
            $("#age-summary small").css("color", "red")
            $("#save").addClass("disabled")
            $("#save").fadeOut()
        }else{
        $("#age-summary small").text("")
         $("#save").fadeIn()
        $("#save").removeClass("disabled")
        }
    })
    $("#confirm").on("change paste keyup", function(){
        if($(this).val() != $("#password").val()){
            $("#confirm_summary").text("Passwords do not match")
            $("#confirm_summary").css("color", "red")
            $("#register").fadeOut()
        }else {
            $("#confirm_summary, #password_summary").text("")
            $("#confirm_summary, #password_summary").css("color", "green")
            $("#confirm_summary, #password_summary").append("<i class='fas fa-check-circle'></i>")
            $("#register").fadeIn()
        }
    })  
    $("#password").on("change paste keyup", function(){
        if($(this).val() != $("#confirm").val()){
            $("#password_summary").text("Passwords do not match")
            $("#password_summary").css("color", "red")
            $("#register").fadeOut()
        }else {
            $("#password_summary").text("")
            $("#password_summary").css("color", "green")
            $("#password_summary").append("<i class='fas fa-check-circle'></i>")
            $("#register").fadeIn()
        }
    })
})