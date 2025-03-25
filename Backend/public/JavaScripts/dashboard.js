const addButton = document.getElementsByClassName("add-button");
const rightDiv = document.getElementsByClassName("right");
let tags = [];
const sendTagsToBackend = async () => {
  try {
      const storedTags = JSON.parse(localStorage.getItem("tags"));
      if (!storedTags || storedTags.length === 0) {
          console.log("No tags to process");
          return;
      }
      console.log("Sending tags to backend:", storedTags); // Debug log
      const response = await fetch("http://localhost:3000/tags/processTags", {
          method: "POST",
          headers:{
            "Content-Type": "application/json"
            
        },
          body: JSON.stringify({ tags: storedTags }),
          credentials: 'include'
      });

      if (!response.ok) {                   
          throw new Error(`HTTP error! status: ${response.status}`);                               
      }

      const data = await response.json();
      console.log("Response from server:", data); // Debug log

      if (data.success) {
          console.log("Tags processed successfully");
          return true;
      } else {
          console.error("Server returned error:", data.message);
          return false;
      }
  } catch (error) {
      console.error("Error in sendTagsToBackend:", error);
      return false;
  }
};

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
  textarea.addEventListener("keyup", async function (event) {
    try {
      let tagValue = this.value.trim();
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        if (event.key === ",") {               
          tagValue = tagValue.slice(0, -1).trim();
        }
        if (tagValue && !tags.includes(tagValue)) {
          tags.push(tagValue);
          localStorage.setItem("tags", JSON.stringify(tags));
          await showTags(tagsContainer, textarea);
          this.value = "";
        }
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  });

  textarea.addEventListener("paste", function (event) {
    event.preventDefault();
    let pastedText = (event.clipboardData || window.clipboardData).getData(
      "text"
    );
    const pastedTags = pastedText.split(",");

    pastedTags.forEach(async (tag) => {
      const trimmedTag = tag.trim();
      if (trimmedTag && !tags.includes(trimmedTag)) {
        tags.push(trimmedTag);
      }
    await showTags(tagsContainer, textarea);
    });
  });
  // localStorage.setItem('tags', JSON.stringify(tags));
  rightDiv[0].appendChild(tagsContainer);
});

async function showTags(tagContainer, textarea) {
  try {
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
      closeTag.addEventListener("click", async function () {
        try {
          tagElement.remove();
          tags = tags.filter((tag) => tag !== tagText);
          localStorage.setItem("tags", JSON.stringify(tags));
          await sendTagsToBackend(); // Wait for backend sync
        } catch (error) {
          console.error("Error removing tag:", error);
        }
      });

      // Add tag to the container
      tagContainer.insertBefore(tagElement, textarea);
    });
    // Send tags to backend after adding
    await sendTagsToBackend();
  } catch (error) {
    console.error("Error showing tags:", error);
  }
}