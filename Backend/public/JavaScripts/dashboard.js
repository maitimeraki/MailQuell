const addButton = document.getElementsByClassName("add-button");
const rightDiv = document.getElementsByClassName("right");
let tags = [];
async function sendTagsToBackend() {
  try {
    const tags = JSON.parse(localStorage.getItem("tags"));
    if (tags.length === 0) return;
    const response = await fetch("/tags/processTags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },                                     
      //  If it were GET, no body would be sent.
      body: JSON.stringify({ tags: tags }),
      credentials:'include'
    });
    const data = await response.json();
    if (data.success) {
      console.log("Tags processed successfully");
    } else {
      console.error("Failed to process tags:", data.message);
    }
  } catch (error) {
    console.error("Error processing tags:", error);
  }
}
addButton[0].addEventListener("click", function () {
  let tagsContainer = document.createElement("div");
  tagsContainer.classList.add("tags-container");
  let textarea = document.createElement("textarea");
  textarea.setAttribute(
    "placeholder",
    "Add tags (press Enter or comma to add)"
  );
  textarea.setAttribute("class", "tag-input");
  textarea.setAttribute("id", "tagInput");
  textarea.classList.add("textAreaDiv");
  // Show existing tags if any
  // if (tags.length > 0) {
  //     showTags(tagsContainer, textarea);
  // }

  tagsContainer.appendChild(textarea);
  textarea.addEventListener("keyup", function (event) {
    let tagValue = this.value.trim();
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (event.key === ",") {               
        tagValue = tagValue.slice(0, -1).trim();
      }
      if (tagValue && !tags.includes(tagValue)) {
        tags.push(tagValue);
        showTags(tagsContainer, textarea);
        localStorage.setItem("tags", JSON.stringify(tags));
        this.value = "";
      }
    }
  });

  textarea.addEventListener("paste", function (event) {
    event.preventDefault();
    let pastedText = (event.clipboardData || window.clipboardData).getData(
      "text"
    );
    const pastedTags = pastedText.split(",");

    pastedTags.forEach((tag) => {
      const trimmedTag = tag.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        tags.push(trimmedTag);
      }
      showTags(tagsContainer, textarea);
    });
  });
  // localStorage.setItem('tags', JSON.stringify(tags));
  rightDiv[0].appendChild(tagsContainer);
});

function showTags(tagContainer, textarea) {
  // Remove existing tags
  const existingTags = tagContainer.querySelectorAll(".tag");
  existingTags.forEach((tag) => tag.remove());
  //display the tags into the container      
  tags.forEach(function (tagText) {
    let tagElement = document.createElement("div");
    tagElement.classList.add("tag");
    tagElement.innerHTML = `${tagText} <span class="tag-close">&times;</span>`;
    let closeTag = tagElement.querySelector(".tag-close");
    closeTag.classList.add("tag-close");
    closeTag.addEventListener("click", function () {
      tagElement.remove();
      tags = tags.filter((tag) => tag !== tagText);
      localStorage.setItem("tags", JSON.stringify(tags));
    });
    // Send tags to backend after adding
    sendTagsToBackend()
    tagContainer.insertBefore(tagElement, textarea);
  });
}

// const addButton = document.getElementsByClassName('add-button');
// const rightDiv = document.getElementsByClassName('right');
// // Load saved tags from localStorage or initialize empty array
// let tags = JSON.parse(localStorage.getItem('tags')) || [];

// addButton[0].addEventListener("click", function () {
//     let tagsContainer = document.createElement('div');
//     tagsContainer.classList.add('tags-container');
//     let textarea = document.createElement('textarea');
//     textarea.setAttribute('placeholder', 'Add tags (press Enter or comma to add)');
//     textarea.setAttribute('class', 'tag-input');
//     textarea.setAttribute('id', 'tagInput');
//     textarea.classList.add('textAreaDiv');

//     // Show existing tags if any
//     if (tags.length > 0) {
//         showTags(tagsContainer, textarea);
//     }

//     tagsContainer.appendChild(textarea);

//     // Handle tag input
//     textarea.addEventListener('keyup', function (event) {
//         let tagValue = this.value.trim();
//         if (event.key === 'Enter' || event.key === ',') {
//             event.preventDefault();
//             if (event.key === ',') {
//                 tagValue = tagValue.slice(0, -1).trim();
//             }
//             addTag(tagValue, tagsContainer, textarea);
//         }
//     });

//     // Handle paste event
//     textarea.addEventListener('paste', function (event) {
//         event.preventDefault();
//         let pastedText = (event.clipboardData || window.clipboardData).getData("text");
//         const pastedTags = pastedText.split(',');

//         pastedTags.forEach(tag => {
//             addTag(tag.trim(), tagsContainer, textarea);
//         });
//     });

//     rightDiv[0].appendChild(tagsContainer);
// });

// function addTag(tagValue, tagsContainer, textarea) {
//     if (tagValue && !tags.includes(tagValue)) {
//         tags.push(tagValue);
//         showTags(tagsContainer, textarea);
//         localStorage.setItem('tags', JSON.stringify(tags));
//         textarea.value = '';
//     }
// }

// function showTags(tagContainer, textarea) {
//     // Remove existing tags
//     const existingTags = tagContainer.querySelectorAll('.tag');
//     existingTags.forEach(tag => tag.remove());

//     // Display tags
//     tags.forEach(function (tagText) {
//         let tagElement = document.createElement('div');
//         tagElement.classList.add('tag');
//         tagElement.innerHTML = `
//             <span class="tag-text">${tagText}</span>
//             <span class="tag-close">&times;</span>
//         `;

//         // Handle tag removal
//         let closeTag = tagElement.querySelector('.tag-close');
//         closeTag.addEventListener('click', function (event) {
//             event.stopPropagation();
//             removeTag(tagText, tagContainer, textarea);
//         });

//         // Handle tag click
//         tagElement.querySelector('.tag-text').addEventListener('click', function () {
//             textarea.value = tagText;
//             textarea.focus();
//         });

//         tagContainer.insertBefore(tagElement, textarea);
//     });
// }

// function removeTag(tagText, tagContainer, textarea) {
//     tags = tags.filter(tag => tag !== tagText);
//     localStorage.setItem('tags', JSON.stringify(tags));
//     showTags(tagContainer, textarea);
// }
