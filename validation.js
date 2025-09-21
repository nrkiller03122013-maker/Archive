const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

const API_BASE = 'http://localhost:4000/api/auth';

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous error styles
    [firstname_input, email_input, password_input, repeat_password_input].forEach(input => {
        if (input) {
            input.parentElement.classList.remove('incorrect');
        }
    });

    let errors = [];

    const isSignup = firstname_input && firstname_input.offsetParent !== null;
    if (isSignup) {
        errors = getSignupFormErrors(
            firstname_input.value,
            email_input.value,
            password_input.value,
            repeat_password_input.value
        );
    } else {
        errors = getLoginFormErrors(email_input.value, password_input.value);
    }

    if (errors.length > 0) {
        error_message.innerText = errors.join('. ') + '.';
        return;
    }

    const endpoint = isSignup ? '/signup' : '/login';
    const payload = isSignup
        ? {
            firstname: firstname_input.value.trim(),
            email: email_input.value.trim(),
            password: password_input.value,
          }
        : {
            email: email_input.value.trim(),
            password: password_input.value,
          };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            error_message.innerText = (data && data.message) ? data.message : 'Request failed.';
            return;
        }
        if (data && data.token) {
            localStorage.setItem('auth_token', data.token);
        }
        if (data && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Check if user is admin and redirect accordingly
        let redirectUrl = 'index.html'; // default redirect
        
        // Check if there's a specific redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const paramRedirect = urlParams.get('redirect');
        
        if (paramRedirect) {
            redirectUrl = paramRedirect;
        } else if (data && data.user) {
            // Check if user is admin (assuming role field exists in user object)
            if (data.user.role === 'admin' || data.user.isAdmin === true || data.user.type === 'admin') {
                redirectUrl = 'admin.html';
            }
        }
        
        window.location.href = redirectUrl;
    } catch (err) {
        error_message.innerText = 'Network error. Please try again.';
    }
});

function getSignupFormErrors(firstname, email, password, repeatpassword) {
    let errors = [];

   if (!firstname || firstname.trim() === "") {
        errors.push('Firstname is required');
        firstname_input.parentElement.classList.add('incorrect');
    }

    if (email==""||email==null) {
        errors.push('Email is required');
        email_input.parentElement.classList.add('incorrect');
    }

    if (password==""||password==null) {
        errors.push('Password is required');
        password_input.parentElement.classList.add('incorrect');
    }
    if(password.length < 8){
        errors.push('Password must have atleast 8 character')
        password_input.parentElement.classList.add('incorrect')
    }
    if (repeatpassword==""||repeatpassword==null) {
        errors.push('Repeat password is required');
        repeat_password_input.parentElement.classList.add('incorrect');
    } else if (password !== repeatpassword) {
        errors.push('Passwords do not match');
        repeat_password_input.parentElement.classList.add('incorrect');
    }

    return errors;
}

// Example stub for login validation
function getLoginFormErrors(email, password) {
    const errors = [];
    if (email==""||email==null) {
        errors.push('Email is required');
        email_input.parentElement.classList.add('incorrect');
    }
    if (password==""||password==null) {
        errors.push('Password is required');
        password_input.parentElement.classList.add('incorrect');
    }
    return errors;
}

function playVideo(videoPath) {
    const videoPlayer = document.getElementById('video-player');
    const videoSource = document.getElementById('video-source');
    const video = document.getElementById('video');

    videoSource.src = videoPath;
    video.load();
    videoPlayer.style.display = 'block';
    video.scrollIntoView({ behavior: 'smooth' });
}