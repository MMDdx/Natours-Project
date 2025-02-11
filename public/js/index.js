import '@babel/polyfill'
import {login, logout, signUp} from "./login";
import {updateSettings, submitReview} from "./updateSettings.js";
import {bookTour} from "./stripe";
import {showMap} from "./mapBox";
import axios from "axios";
// dom elems
let locations = document.querySelector("#map")
const form = document.querySelector(".form--login")
const signupForm = document.querySelector(".signUp")
const formChangeData = document.querySelector("#form-user-data")
const logOutButt = document.querySelector(".nav__el.nav__el--logout")
const userPasswordForm = document.querySelector("#form-user-password")
const myMap = document.querySelector("#map")
const bookBtn = document.querySelector("#book-tour")
const reviewForm = document.querySelector("#form-user-review")
const likeH = document.querySelector(".like")
// delegation
if (locations) {locations = JSON.parse(locations.dataset.locations)}


if (form){
    form.onsubmit = e =>{
        e.preventDefault();
        let email = document.querySelector("#email").value;
        let password = document.querySelector("#password").value;
        login(email, password)
    }
}

if (signupForm){
    signupForm.onsubmit = e =>{
        e.preventDefault();
        let email = document.querySelector("#email").value;
        let name = document.querySelector("#name").value;
        let password = document.querySelector("#password").value;
        let passwordCon = document.querySelector("#confirm-password").value;
        signUp(name,email, password, passwordCon)
    }
}


if (logOutButt) logOutButt.onclick = logout


if (formChangeData){
    formChangeData.onsubmit = e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name',  document.querySelector("#name").value)
        form.append('email',  document.querySelector("#email").value)
        form.append('photo',  document.querySelector("#photo").files[0])

        updateSettings(form, "data")
    }
}


if (myMap){
    showMap(myMap, locations)
}


if (userPasswordForm){
    userPasswordForm.onsubmit = async  e => {
        e.preventDefault();
        document.querySelector(".btn-save-password").textContent = "Updating..."
        const password = document.querySelector("#password-current")
        const newPassword = document.querySelector("#password")
        const newPasswordConfirm = document.querySelector("#password-confirm")

        await updateSettings({password, newPassword, newPasswordConfirm}, "password")

        document.querySelector(".btn-save-password").textContent = "Save password"
        password.value= '';
        newPassword.value= '';
        newPasswordConfirm.value= '';
    }

}


if (bookBtn){
    bookBtn.onclick = e => {
        e.target.textContent = "processing..."
        const {tourId} = e.target.dataset
        bookTour(tourId)
    }
}

if (reviewForm){
    reviewForm.onsubmit = async e => {
        e.preventDefault()
        const review = document.querySelector("#review")
        const range = document.querySelector("#range")
        const subBtn = document.querySelector("#review-btn");
        subBtn.value = "Processing..."
        await submitReview(review.value,range.value, reviewForm.dataset.id)
        subBtn.value = "Save Review"
        review.value = ""
        range.value = ""
    }
}

if (likeH){
    likeH.parentElement.onclick = async e => {
        const url = '/api/v1/likes/'
        const tourId = document.querySelector("#book-tour").dataset.tourId
        const countLike = document.querySelector(".countLike")
        let countedlikes = parseInt(countLike.textContent)
        try {

            if (likeH.classList.contains("liked")){
                // delete
                 let res = await axios({
                    method: "DELETE",
                    url: url + `/${tourId}`,
                })

                likeH.classList.remove("liked")
                likeH.setAttribute("fill", "");
                 likeH.setAttribute("stroke", "");
                 countLike.textContent -= 1;
            }
            else {
                let res = await axios({
                    method: "POST",
                    url,
                    data:{
                        tour:tourId,
                    }
                })
                if (res.data.status === 'success'){
                    likeH.classList.add("liked")
                    likeH.setAttribute("fill", "red");
                    likeH.setAttribute("stroke", "red");
                    countedlikes+=1;
                    countLike.textContent = countedlikes
                }
            }


        }
        catch (err){
            console.log(err)
        }

    }
}
