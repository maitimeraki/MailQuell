export const sendTagsToBackend = async () => {
  try {
    const storedTags = JSON.parse(localStorage.getItem("tags"));
    if (!storedTags || storedTags.length === 0) {
      console.log("No tags to process");
      return;
    }
    console.log("Sending tags to backend:", storedTags); // Debug log
    const response = await fetch(`${process.env.FRONTEND_URL}/tags/processTags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"

      },
      body: JSON.stringify({ tags: storedTags }),
      credentials: 'include',

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