export async function fetchMe() {
    const token = localStorage.getItem('token');  // Or use getCookie if you're using cookies

    const response = await fetch('/auth/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data;
}
