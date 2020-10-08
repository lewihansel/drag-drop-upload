// grabbing upload drop area
let dropArea = document.getElementById("drop-area");

// adding prevent default behaviour
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// adding highlights when user hover the file over upload drop area
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});
function highlight(e) {
  dropArea.classList.add("highlight");
}

// removing highlights when necessary
["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});
function unhighlight(e) {
  dropArea.classList.remove("highlight");
}

// handle file dropping (grabbing files)
dropArea.addEventListener("drop", handleDrop, false);
function handleDrop(e) {
  let data = e.dataTransfer;
  let files = data.files;
  handleFiles(files);
}

// reserve for future multiple file upload
function handleFiles(files) {
  [...files].forEach(uploadFile);
}

// uploading file to server
async function uploadFile(file) {
  let postUrl = "/uploadfile";
  const getUrl = "/uploaded";

  // fetching all uploaded files
  let fileNameList = new Set();
  let response = await fetch(getUrl);
  let data = await response.json();
  data.map((item) => fileNameList.add(item.originalname));

  if (fileNameList.has(file.name)) {
    // checking if the file already in the database
    alert(
      `File name : ${file.name} is already uploaded to our database, please rename your file to another name before re uploading`
    );
    document.querySelector(".popup-trigger").click();
  } else {
    // creating new formData object
    let formData = new FormData();
    formData.append("file", file);

    // uploading file
    fetch(postUrl, {
      method: "POST",
      body: formData,
    })
      .then(() => {
        alert("Upload Success!");
        document.querySelector(".popup-trigger").click();
      })
      .catch((err) => {
        console.error(err);
        alert("Upload failed!");
      });
  }
}

// Modal Handling
const modalTriggers = document.querySelectorAll(".popup-trigger");
const modalCloseTrigger = document.querySelector(".popup-modal__close");
const bodyBlackout = document.querySelector(".body-blackout");

// setting up onClick listener (modal open btn)
modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const { popupTrigger } = trigger.dataset;
    const popupModal = document.querySelector(
      `[data-popup-modal="${popupTrigger}"]`
    );

    // get all uploaded files
    let fileList = [];
    const url = "/uploaded";
    fetch(url)
      .then((res) => res.json())
      .then((data) => data.map((item) => fileList.push(item)))
      .then(() => {
        if (fileList.length === 0) {
          // if no uploaded file in the database
          document.getElementById("uploadList").innerHTML = `
          <div class="file">
            <span class="title">You haven't uploaded any file yet</span>
            <div class="date">please upload your file in the previous screen</div>
          </div>
          `;
        } else {
          // mapping uploaded files into DOM element
          fileList.map((file) => {
            const fileName = file.originalname;
            const createdAt = new Date(file.meta.created);
            document.getElementById("uploadList").innerHTML += `
            <div class="file">
              <a href="/uploaded/${file.$loki}" class="title">${fileName}</a>
              <div class="date">Uploaded at : ${createdAt.toUTCString()}</div>
            </div>
          `;
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });

    // making modal visible
    popupModal.classList.add("is--visible");
    bodyBlackout.classList.add("is-blacked-out");

    // adding event listener to close the modal (modal close btn)
    popupModal
      .querySelector(".popup-modal__close")
      .addEventListener("click", () => {
        closeModal();
      });

    // adding event listener, out-of-bound click to close modal
    bodyBlackout.addEventListener("click", () => {
      closeModal();
    });

    // adding event listener to close modal with esacape key
    document.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        closeModal();
      }
    });

    function closeModal() {
      popupModal.classList.remove("is--visible");
      bodyBlackout.classList.remove("is-blacked-out");
      document.getElementById("uploadList").innerHTML = "";
    }
  });
});
