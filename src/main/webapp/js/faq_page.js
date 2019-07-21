var faq_button = document.getElementsByClassName("accordion");

for (var i = 0; i < faq_button.length; i++) {
  faq_button[i].onclick = function() {
    this.classList.toggle('is-open');

    var content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      //close (minimise) the button
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      //open it again
    }
  }
}