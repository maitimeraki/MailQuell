// const { profileData } = require("../service/profileData");
const profilePic = document.getElementById("profilePic");
const profileName = document.getElementsByClassName("username")[0];
const mainContainer = document.getElementById("mainContainer");
// const profileDropdownContainer = document.getElementById("profilePic");
(async function () {
    await fetch('http://localhost:3000/details/profile').then((response) => response.json()).then((profile) => {
        if (profile.picture) {
            profilePic.src = profile.picture;
            profilePic.alt = `${profile.name}'s profile picture`;
        } else {
            profilePic.style.display = 'none';
            const initialCircle = document.createElement('div');
            initialCircle.className = 'profile-initial';
            initialCircle.textContent = profile.name?.charAt(0).toUpperCase();
            profilePic.parentNode.insertBefore(initialCircle, profilePic);

        }
        profileName.innerText = profile.name;
        if (mainContainer !== null) {
            profileDropdown(mainContainer, profile);
        }

    }).catch((error) => {
        console.error('Error fetching of profile data:', error.message); // Debug log
        throw error;
    });

})();
function profileDropdown(container, profile) {
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'profile-dropdown-menu hidden';
    dropdownMenu.innerHTML = `
    <div class='profile-header'>
        <div class='profile-info'>
            <div class='profile-name'>${profile.name}</div>
            <div class='profile-email'>${profile.email}</div>
        </div>
    </div>
    <div class='profile-actions'>
        <a href='/profile' class='profile-action'><i class="fa-solid fa-user"></i> Profile</a>
        <div class='profile-action settings-btn'><i class="fa-solid fa-gear"></i> Setting</div>
        <button id="signOutButton" class='profile-action sign-out'><i class="fa-solid fa-right-from-bracket"></i>Sign Out</button>
    </div>
    `;

    container.appendChild(dropdownMenu);

    // Improved click handler
    profilePic.addEventListener('click', (event) => {
        event.stopPropagation();
        // Toggle current dropdown
        dropdownMenu.classList.toggle('hidden');
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
        if (dropdownMenu.classList.contains("hidden")) {
            dropdownMenu.classList.remove('hidden');
        }
        
    });

    // Sign out button handler
    const signOutButton = dropdownMenu.querySelector("#signOutButton");
    signOutButton?.addEventListener("click", async () => {
        try {
            await fetch('/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });
}