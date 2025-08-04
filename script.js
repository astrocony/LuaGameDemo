// === Movimiento de Lua === //
const lua = document.getElementById('luaSprite');
const items = document.querySelectorAll(".item");
let posX = 100;
const step = 5;
let keys = {}; 
let enElAire = false; 
let velocidad = 10;
const suelo = 690;
lua.style.top = `${suelo}px`;
lua.style.left = `${posX}px`; // asegura la posición inicial

const plataformas = document.querySelectorAll(".plataforma");

let modoDefensa = false;
let mirandoDerecha = true;  // para saber a qué lado mira Lua
let ataqueEnProgreso = false;


const sonidoAtaque = new Audio("/img/audios/espada_lua.mp3");




document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault(); // Evita el desplazamiento de la página
  }
});

document.addEventListener('keydown', (e) => {   //e.key es que tecla esta presionada
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
  if (!enElAire) lua.src = '/img/lua_idle.png';
});



document.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 'W') {
    modoDefensa = true;
  }

  if ((e.key === 'a' || e.key === 'A') && !ataqueEnProgreso) {
    sonidoAtaque.cloneNode().play();

    ataqueEnProgreso = true;
    let secuencia = [
      '/img/lua_ataque1.png',
      '/img/lua_ataque2.png',
      '/img/lua_ataque3.png'
    ];
    let i = 0;
    let animarAtaque = setInterval(() => {
      lua.src = secuencia[i];
      lua.style.transform = mirandoDerecha ? 'scaleX(1)' : 'scaleX(-1)';
      i++;
      if (i >= secuencia.length) {
        clearInterval(animarAtaque);
        ataqueEnProgreso = false;
        if (modoDefensa) {
          lua.src = '/img/lua_defensa1.png';
        } else {
          lua.src = '/img/lua_idle.png';
        }
      }
    }, 250);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 'W') {
    modoDefensa = false;
  }
});



/* MOVER A LUA */


function moverLua() {
  let moviendo = false;

  if (keys['ArrowRight'] && posX < 730) {
    if (modoDefensa || ataqueEnProgreso) {
      // retrocede
      posX += step;
      lua.style.left = `${posX}px`;
      lua.src = modoDefensa ? '/img/lua_defensa2.png' : lua.src;
      lua.style.transform = mirandoDerecha ? 'scaleX(1)' : 'scaleX(-1)';
    } else {
      posX += step;
      lua.style.left = `${posX}px`;
      lua.src = '/img/lua_step.png';
      lua.style.transform = 'scaleX(1)';
      mirandoDerecha = true;
    }
    moviendo = true;
  }

  if (keys['ArrowLeft'] && posX > 0) {
    if (modoDefensa || ataqueEnProgreso) {
      posX -= step;
      lua.style.left = `${posX}px`;
      lua.src = modoDefensa ? '/img/lua_defensa2.png' : lua.src;
      lua.style.transform = mirandoDerecha ? 'scaleX(1)' : 'scaleX(-1)';
    } else {
      posX -= step;
      lua.style.left = `${posX}px`;
      lua.src = '/img/lua_step.png';
      lua.style.transform = 'scaleX(-1)';
      mirandoDerecha = false;
    }
    moviendo = true;
  }

  if (!moviendo && !enElAire && !modoDefensa && !ataqueEnProgreso) {
    lua.src = '/img/lua_idle.png';
  }

  if (!moviendo && modoDefensa && !enElAire) {
    lua.src = '/img/lua_defensa1.png';
  }

  if (!enElAire) {
    let nuevaY = detectarColisionPlataforma();
    if (nuevaY === null && parseInt(lua.style.top) < suelo) {
      enElAire = true;
      let bajada = setInterval(() => {
        let posicionActual = parseInt(lua.style.top);
        let nuevaY = detectarColisionPlataforma();

        if (nuevaY !== null) {
          lua.style.top = `${nuevaY}px`;
          clearInterval(bajada);
          enElAire = false;
          lua.src = modoDefensa ? '/img/lua_defensa1.png' : '/img/lua_idle.png';
        } else if (posicionActual < suelo) {
          lua.style.top = `${posicionActual + velocidad}px`;
        } else {
          lua.style.top = `${suelo}px`;
          clearInterval(bajada);
          enElAire = false;
          lua.src = modoDefensa ? '/img/lua_defensa1.png' : '/img/lua_idle.png';
        }
      }, 20);
    }
  }

  // ✅ ESTAS DOS LÍNEAS VAN AQUÍ, AL FINAL

  actualizarCamara();
  requestAnimationFrame(moverLua);
  detectarColisionItems();
}





/* ----- Seguir a lua con la camara ----- */

const viewportWidth = 500;   // el tamaño visible de la pantalla
const escenarioWidth = 800;  // el tamaño total del escenario


let camaraX = 0;
let camaraY = 0;

function actualizarCamara() {
  let objetivoX = posX - (viewportWidth / 2); // normal

  // Definir los márgenes de la "zona muerta"
  const margen = 250;
  const limiteIzquierdo = camaraX + margen;
  const limiteDerecho = camaraX + viewportWidth - margen;

  if (posX < limiteIzquierdo) {
    camaraX = Math.max(0, posX - margen);
  } else if (posX > limiteDerecho) {
    camaraX = Math.min(escenarioWidth - viewportWidth, posX - viewportWidth + margen);
  }
  
  // Aplicar transform solo en X
  document.getElementById('escenario').style.transform = `translate(${-camaraX}px, 0px)`;
}









/* ----- saltar ---- */ 

function saltar() {
  if (!enElAire) {  // Solo puede saltar si no está en el aire
    enElAire = true;
    lua.src = '/img/lua_pre_jump.png';

    setTimeout(() => {
      lua.src = '/img/lua_jump.png';
    }, 100);

    let alturaMaxima = parseInt(lua.style.top) - 120;  // Salto relativo a la posición actual
    let subida = setInterval(() => {
      let posicionActual = parseInt(lua.style.top);

      if (posicionActual > alturaMaxima) {
        lua.style.top = `${posicionActual - velocidad}px`;
      } else {
        clearInterval(subida);
        lua.src = '/img/lua_post_jump.png';

        let bajada = setInterval(() => {
          let posicionActual = parseInt(lua.style.top);
          let nuevaY = detectarColisionPlataforma();

          if (nuevaY !== null) {
            lua.style.top = `${nuevaY}px`;
            clearInterval(bajada);
            enElAire = false;
            lua.src = '/img/lua_idle.png';
          } else if (posicionActual < suelo) {
            lua.style.top = `${posicionActual + velocidad}px`;

            if (keys['ArrowRight'] && posX < 730) {
              posX += step;
              lua.style.left = `${posX}px`;
              lua.style.transform = 'scaleX(1)';
            }

            if (keys['ArrowLeft'] && posX > 0) {
              posX -= step;
              lua.style.left = `${posX}px`;
              lua.style.transform = 'scaleX(-1)';
            }
          } else {
            lua.style.top = `${suelo}px`;
            clearInterval(bajada);
            enElAire = false;
            lua.src = '/img/lua_idle.png';
          }
        }, 20);
      }
    }, 20);
  }
}




/* ------- Colisioones ------ */



function detectarColisionPlataforma() {
  const luaTop = parseInt(lua.style.top) || suelo;
  const luaBottom = luaTop + lua.offsetHeight;
  const luaCenterX = posX + lua.offsetWidth / 2;

  for (let plataforma of plataformas) {
    const platTop = plataforma.offsetTop;
    const platLeft = plataforma.offsetLeft;
    const platRight = platLeft + plataforma.offsetWidth;

    const colisionHorizontal = luaCenterX >= platLeft && luaCenterX <= platRight;
    const colisionVertical = luaBottom >= platTop && luaBottom <= platTop + 10;

    if (colisionHorizontal && colisionVertical) {
      return platTop - lua.offsetHeight;
    }
  }
  return null;
}


/* -------- detectar colicion ITEM ------ 


const items = document.querySelectorAll(".item");

function detectarColisionItem() {
  const luaRect = lua.getBoundingClientRect();

  items.forEach((item) => {
    const itemRect = item.getBoundingClientRect();
    const overlap = !(luaRect.right < itemRect.left || 
                      luaRect.left > itemRect.right || 
                      luaRect.bottom < itemRect.top || 
                      luaRect.top > itemRect.bottom);
    if (overlap && item.style.display !== 'none') {
      item.style.display = 'none'; // Desaparece el ítem
      sumarItem(item.dataset.tipo); // Suma al contador
    }
  });
} */



/* --------- contador y detector de objetos ------- */

let cuentaPajaros = 0;
let cuentaCorazones = 0;

let sonidoCorazon = new Audio("/img/audios/tum_tum_heart.mp3");
let sonidoPajaro = new Audio("/img/audios/sonido_item_general.mp3");

function detectarColisionItems() {
  const luaRect = lua.getBoundingClientRect();

  items.forEach((item) => {
    if (item.style.display === 'none') return;  // ✅ Ya desaparecido, no revisa

    const itemRect = item.getBoundingClientRect();

    const colision = !(luaRect.right < itemRect.left ||
                       luaRect.left > itemRect.right ||
                       luaRect.bottom < itemRect.top ||
                       luaRect.top > itemRect.bottom);

    if (colision) {
      item.style.display = 'none'; // ✅ Desaparece al colisionar

      if (item.dataset.tipo === 'pajaro') {
        cuentaPajaros++;
        document.getElementById('contadorPajaros').textContent = ` x ${cuentaPajaros}`;
        sonidoPajaro.cloneNode().play();  // 🔊 Reproducir sonido del pájaro
      } else if (item.dataset.tipo === 'corazon') {
        cuentaCorazones++;
        document.getElementById('contadorCorazones').textContent = ` x ${cuentaCorazones}`;
        sonidoCorazon.cloneNode().play();  // 🔊 Reproducir sonido del corazón
      }
    }
  });
}











/* -------touch botones (creo)------ */



document.getElementById('btnIzquierda').addEventListener('touchstart', () => keys['ArrowLeft'] = true);
document.getElementById('btnDerecha').addEventListener('touchstart', () => keys['ArrowRight'] = true);
document.getElementById('btnSalto').addEventListener('touchstart', () => saltar());

document.getElementById('btnIzquierda').addEventListener('touchend', () => keys['ArrowLeft'] = false);
document.getElementById('btnDerecha').addEventListener('touchend', () => keys['ArrowRight'] = false);

document.addEventListener('keydown', (e) => {
  if (e.key === "ArrowUp") saltar();
});

moverLua();
/*aplicarGravedad(); */


/* ------------ SONIDO ----------- */


/* --- background -----*/

let musicaIniciada = false;

window.addEventListener('keydown', (e) => {
  if (!musicaIniciada && ['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
    const music = document.getElementById('bg-music');
    music.play().then(() => {
      console.log("🎵 Música iniciada con una tecla");
    }).catch((err) => {
      console.warn("🚫 Bloqueo de sonido:", err);
    });
    musicaIniciada = true;
  }
});

/* ---- salto y caminata ---- */

// === SONIDOS DE LUA === //
const sonidoPaso = new Audio("/img/audios/paso_lua2.mp3");
const sonidoSalto = new Audio("/img/audios/salto_lua.mp3");

function reproducirPaso() {
  // Clonamos el audio para que pueda sonar aunque el anterior no haya terminado
  const paso = sonidoPaso.cloneNode();
  paso.play();
}

function reproducirSalto() {
  const salto = sonidoSalto.cloneNode();
  salto.play();
}

// Escuchar teclas
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    reproducirPaso();
  }
  if (e.key === "ArrowUp") {
    reproducirSalto();
  }
});








