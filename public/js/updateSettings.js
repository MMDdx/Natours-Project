import axios from "axios";
import {showAlert} from "./alerts";


// type is either password or data
export const updateSettings = async (data, type) => {
    try {
        let url;
        if (type === "data") url = 'http://127.0.0.1:8000/api/v1/users/updateMe'
        else if (type === 'password') url = 'http://127.0.0.1:8000/api/v1/users/updatePassword'

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success') {
            showAlert("success",`${type.toUpperCase()} updated successfully!`);
        }
    }catch (err){
        showAlert("error",err.response.data.message);
    }

}


export const submitReview = async (review,range,id) => {
    try {

        const res = await axios({
            method: 'POST',
            url: `http://127.0.0.1:8000/api/v1/tours/${id}/reviews`,
            data:{
                review,
                rating:(range*1),

            }
        })
        if (res.data.status === 'success') {
            showAlert("success",`Submitted successfully!`);
        }
    }catch (err){
        showAlert("error",err.response);
        console.log(err)
    }
}



