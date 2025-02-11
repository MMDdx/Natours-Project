import axios from "axios";
import {showAlert} from "./alerts";

export const login = async (email, password) => {
    try{

        let res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if (res.data.status === 'success') {
            showAlert("success","logged in successfully!");
            window.setTimeout(() => {
                location.assign("/")
            },1500)
        }


    }catch (err){
        showAlert("error",err.message);
    }
    // try {
    //     let res = await fetch('http://127.0.0.1:8000/api/v1/users/login', {
    //         method: 'POST',
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({
    //             email,
    //             password
    //         })
    //     });
    //
    //     let data = await res.json();  // Convert response to JSON
    //     console.log(data);
    //
    // } catch (err) {
    //     console.log("Error:", err);
    // }



}


export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout'
        });
        if ((res.data.status = 'success')) location.reload(true);
    } catch (err) {
        console.log(err.response);
        showAlert('error', 'Error logging out! Try again.');
    }
};


export const signUp = async (name,email,password,passwordCon) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm:passwordCon
            }
        });
        if (res.data.status === 'success') {
            showAlert("success","Signed Up successfully!");
            window.setTimeout(() => {
                location.assign("/")
            },1500)
        }

    }
    catch (err){
        showAlert("error",err.response.data.message);
        console.log(err.response)
    }
}