// const { profileData } = require("../service/profileData");
const profilePic = document.getElementById("profilePic");
const profileName = document.getElementsByClassName("username")[0];
const profileContainer = document.getElementById("profileContainer");
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
        if (profileContainer !== null) {
            profileDropdown(profileContainer, profile);
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
        <a herf='/profile' class='profile-action'><i class="fa-regular fa-user"></i> Profile</a>
        <div class='profile-action'><i class="fa-solid fa-gear"></i> Setting</div>
        <button class='profile-action sign-out'><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>

    </div>
    `
    container.appendChild(dropdownMenu);
    container.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    })
    document.addEventListener('click', () => {
        if (!dropdownMenu.classList.contains('hidden')) {
            dropdownMenu.classList.add('hidden');
        }
    })
    const signOutButton = dropdownMenu.querySelector("#signOutButton");
    if (signOutButton) {
        signOutButton.addEventListener("click", () => {
            // Call your signout function here
            // Example: signOut().then(() => window.location.href = "/login");
            console.log("Sign out clicked");
        });
    }
}