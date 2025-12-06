// Update time
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('time').textContent = `SYSTEM TIME: ${timeStr}`;
}

// Request OTP
function requestOTP() {
    const email = document.getElementById('email').value;
    const teamName = document.getElementById('teamName').value;

    if (!email || !teamName) {
        alert('⚠ HOLD UP CHAMPION! • ALL FIELDS REQUIRED TO ENTER THE ARENA');
        return;
    }

    if (!email.includes('@')) {
        alert('⚠ INVALID CREDENTIALS • CHECK YOUR SQUAD LEADER EMAIL');
        return;
    }

    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'block';
    document.getElementById('successMsg').style.display = 'block';
}

// Verify OTP
function verifyOTP() {
    const otp = document.getElementById('otp').value;

    if (!otp || otp.length !== 6) {
        alert('⚠ BATTLE CODE INCOMPLETE • 6 DIGITS REQUIRED');
        return;
    }

    alert('🔥 WELCOME TO THE VORTEX, CHAMPION! • YOUR JOURNEY TO LEGENDARY STATUS BEGINS NOW • LET\'S MAKE HISTORY! 🔥');
    // Here you would typically redirect or proceed to the next page
}

// Go back
function goBack() {
    document.getElementById('otpSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('otp').value = '';
}

// Initialize
updateTime();
setInterval(updateTime, 1000);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const loginVisible = document.getElementById('loginSection').style.display !== 'none';
        if (loginVisible) {
            requestOTP();
        } else {
            verifyOTP();
        }
    }
});