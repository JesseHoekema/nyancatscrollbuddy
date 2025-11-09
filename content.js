const nyanCat = document.createElement('img');
nyanCat.id = 'nyan-cat-extension';
nyanCat.src = chrome.runtime.getURL('nyan-cat.gif');
nyanCat.alt = 'Nyan Cat';
nyanCat.style.display = 'none'; 

document.body.appendChild(nyanCat);

const tailElements = [];
let tailWidth = 0;

function createTails() {
  tailElements.forEach(tail => tail.element.remove());
  tailElements.length = 0;
  
  const pageWidth = window.innerWidth;
  const nyanCatWidth = 200; 
  
  const tempTail = document.createElement('img');
  tempTail.src = chrome.runtime.getURL('tail.gif');
  tempTail.style.position = 'absolute';
  tempTail.style.visibility = 'hidden';
  tempTail.style.height = 'auto';
  document.body.appendChild(tempTail);
  
  tempTail.onload = function() {
    const aspectRatio = tempTail.naturalWidth / tempTail.naturalHeight;
    const nyanCatAspectRatio = nyanCat.naturalWidth / nyanCat.naturalHeight;
    const nyanCatHeight = nyanCatWidth / nyanCatAspectRatio;
    tailWidth = nyanCatHeight * aspectRatio;
    
    tempTail.remove();
    
    const availableWidth = pageWidth - nyanCatWidth;
    const numTails = Math.ceil(availableWidth / tailWidth);
    
    for (let i = 0; i < numTails; i++) {
      const tail = document.createElement('img');
      tail.className = 'nyan-tail-extension';
      tail.src = chrome.runtime.getURL('tail.gif');
      tail.alt = 'Nyan Tail';
      tail.style.width = tailWidth + 'px';
      tail.style.right = (nyanCatWidth + (i * tailWidth)) + 'px';
      tail.style.display = 'none';
      document.body.appendChild(tail);
      
      tailElements.push({
        element: tail,
        gifUrl: chrome.runtime.getURL('tail.gif'),
        pausedFrame: null
      });
    }
    
    tailElements.forEach(tail => tail.element.style.display = 'block');
  };
}

window.addEventListener('resize', () => {
  createTails();
});

let isScrolling = false;
let scrollTimeout;
let gifUrl = chrome.runtime.getURL('nyan-cat.gif');
let pausedFrame = null;

function pauseGif() {
  if (!pausedFrame && nyanCat.complete) {
    const canvas = document.createElement('canvas');
    canvas.width = nyanCat.naturalWidth;
    canvas.height = nyanCat.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(nyanCat, 0, 0);
    pausedFrame = canvas.toDataURL('image/png');
    nyanCat.src = pausedFrame;
  }
  
  tailElements.forEach(tail => {
    if (!tail.pausedFrame && tail.element.complete) {
      const canvas = document.createElement('canvas');
      canvas.width = tail.element.naturalWidth;
      canvas.height = tail.element.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(tail.element, 0, 0);
      tail.pausedFrame = canvas.toDataURL('image/png');
      tail.element.src = tail.pausedFrame;
    }
  });
}


function playGif() {
  const timestamp = Date.now();
  
  pausedFrame = null;
  nyanCat.src = gifUrl + '?' + timestamp;
  
  tailElements.forEach(tail => {
    tail.pausedFrame = null;
    tail.element.src = tail.gifUrl + '?' + timestamp;
  });
}

nyanCat.onload = function() {
  nyanCat.style.display = 'block';
  
  createTails();
  
  setTimeout(() => {
    if (!isScrolling) {
      pauseGif();
    }
  }, 500);
};

window.addEventListener('scroll', () => {
  if (!isScrolling) {
    playGif();
  }
  
  isScrolling = true;
  clearTimeout(scrollTimeout);
  
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
    pauseGif();
  }, 200);
});