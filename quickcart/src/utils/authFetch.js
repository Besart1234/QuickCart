/**
    * A wrapper around fetch that automatically tries to refresh
    * the access token if the request fails with 401 Unauthorized.
*/

const API_URL = "https://localhost:7000/api";

export async function authFetch(url, options = {}) {
    //Always send cookies
    options.credentials = 'include';

    let response = await fetch(url, options);

    if(response.status === 401){
        //Try refresh
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        });

        if(refreshResponse.ok) {
            //Retry the orignial request
            response = await fetch(url, options);
        }
        else {
            //Refresh failed -> user must login again
            throw new Error('Unauthorized and refresh failed');
        }
    }

    return response;
}