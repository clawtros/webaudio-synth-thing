function audioFun() {
  var audioContext = new AudioContext(),
      analyserNode = audioContext.createAnalyser(),
      
      oscillators = [
        createOscillator(),
        createOscillator(),
        createOscillator(),
        createOscillator(),
        createOscillator(),
        createOscillator(),
        createOscillator(),
        createOscillator()
      ],
      debug = document.createElement("div"),
      keysPressed = [],
      
      renderer = document.createElement("canvas"),
      ctx = renderer.getContext('2d');
  debug.setAttribute('class', 'debug')
  analyserNode.fftSize = 512;

  var bufferLength = analyserNode.frequencyBinCount,
      data = new Uint8Array(bufferLength);

  renderer.width = window.innerWidth;
  renderer.height = window.innerHeight;

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'limegreen';

  document.body.appendChild(renderer);     
  analyserNode.connect(audioContext.destination);

  function createOscillator() {
    var oscillator = audioContext.createOscillator(),
        gainNode = audioContext.createGain();

    oscillator.frequency.value = 440;
    oscillator.type = "square";
    gainNode.gain.value = 0;

    oscillator.connect(gainNode);
    gainNode.connect(analyserNode);

    return {
      oscillator: oscillator,
      gainNode: gainNode
    }
  }
  
  function visualize() {
    requestAnimationFrame(visualize);
    var sliceWidth = renderer.width * 1.0 / bufferLength;
    ctx.fillStyle = 'rgb(20, 20, 20)';
    ctx.fillRect(0, 0, renderer.width, renderer.height);  
    analyserNode.getByteTimeDomainData(data);
    
    ctx.beginPath();
    ctx.moveTo(0, renderer.width / 2);
    data.map((element, index) => ctx.lineTo(
      index * sliceWidth,
      element / 128 * (renderer.height / 2)));
    ctx.lineTo(renderer.width, renderer.height / 2);
    ctx.stroke();
  }
  
  function keyCodeToTone(code) {
    let fz = code - 65;
    return 220 + fz * 440 / 12;
  }

  function updateTones() {
    oscillators.slice(keysPressed.length).map(e=>e.gainNode.gain.value = 0);
    keysPressed.slice(0, oscillators.length).map((code, index)=>{
      oscillators[index].oscillator.frequency.value = keyCodeToTone(code);
      oscillators[index].gainNode.gain.value = 1 / keysPressed.length;
    })
    
    debug.innerHTML = keysPressed.map(keyCodeToTone).map(e=>e.toFixed(2)).join(" ");
  }
  document.body.appendChild(debug);
  return {
    start: function() {
      oscillators.map(o => o.oscillator.start(0));

      document.addEventListener("keydown", e => {
        if (keysPressed.indexOf(event.keyCode) < 0) { keysPressed.push(event.keyCode); }
        updateTones();
      })

      document.addEventListener("keyup", event => {
        keysPressed = keysPressed.filter(code => code != event.keyCode);
        updateTones();
      })
      
      visualize();      
    }
  }
}


audioFun().start();
