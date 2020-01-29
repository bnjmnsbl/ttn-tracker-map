export function overlay() {
  let modal = document.getElementById('overlay');
  let modalText = document.getElementById('overlayText');
  let close = document.getElementById('closebtn');

  modal.style.display = 'block';
  modalText.style.display = 'block';

  window.onclick = function(event){
    if (event.target == close) {
      modal.style.display = 'none';
      modalText.style.display = 'none';
    }
  };
}
