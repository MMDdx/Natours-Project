import {showAlert} from "./alerts";
import axios from "axios";

export const bookTour = async tourId =>{
    try {
        // 1 get checkout session from server
        const stripe = Stripe("pk_test_51QpbOk6lMTPDR3BwVQSf9MoilZJoAlsWGQkPqCd3x5UO65ijFAcUnXklw72W39mihA35ByMiOVz3oRMiiiUJMJXV00jVwRNs0u")
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`)

        // 2 create checkout form + chanre credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        })

    }catch(error){
        showAlert('error',error)
    }

}