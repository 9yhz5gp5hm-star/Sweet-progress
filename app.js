// ======================================
// SWEET PROGRESS
// ======================================


// --------------------------------------
// ESTADO INICIAL
// --------------------------------------

const defaultData = {
  frostings: 0,
  shields: 0,

  history: [],

  currentWeek: {
    days: [null, null, null, null, null],
    completed: false
  },

  shopPurchases: []
};


// --------------------------------------
// CARGAR DATOS
// --------------------------------------

let gameData =
  JSON.parse(localStorage.getItem("sweetProgressData"))
  || structuredClone(defaultData);


// --------------------------------------
// PREMIOS
// --------------------------------------

// De momento he puesto premios de ejemplo.
// Luego sustituimos estos por LOS TUYOS.

const rewards = [

  {
    id: "small-surprise",
    name: "mimitos",
    price: 10,
    emoji: "🥰"
  },

  {
    id: "mystery-photo",
    name: "Foto misteriosa",
    price: 20,
    emoji: "📸"
  },

  {
    id: "mystery-message",
    name: "Cartita sorpresa",
    price: 50,
    emoji: "💌"
  },

  {
    id: "secret",
    name: "...",
    price: 150,
    emoji: "🔥"
  },

  {
    id: "romantic-cafe",
    name: "Meriendita",
    price: 200,
    emoji: "☕"
  },

  {
    id: "special-date",
    name: "Cita especial",
    price: 400,
    emoji: "💕"
  },

  {
    id: "princess-day",
    name: "Princess Day",
    price: 450,
    emoji: "👑"
  },

  {
    id: "mystery-box",
    name: "Mystery Box",
    price: 500,
    emoji: "📦"
  }

];


// ======================================
// GUARDAR
// ======================================

function saveData() {

  localStorage.setItem(
    "sweetProgressData",
    JSON.stringify(gameData)
  );

}


// ======================================
// ACTUALIZAR PANTALLA
// ======================================

function updateUI() {

  document.getElementById("frostings").textContent =
    gameData.frostings;

  document.getElementById("shields").textContent =
    gameData.shields;


  updateTodayStatus();

  updateWeek();

  updateHistory();

  renderShop();

}


// ======================================
// ESTADO DE HOY
// ======================================

function getTodayString() {

  const today = new Date();

  return today.toISOString().split("T")[0];

}


function updateTodayStatus() {

  const today = getTodayString();

  const entry = gameData.history.find(
    item => item.date === today
  );


  const statusElement =
    document.getElementById("todayStatus");


  if (!entry) {

    statusElement.textContent =
      "Todavía no registrado";

    return;

  }


  if (entry.type === "complete") {

    statusElement.textContent =
      "🧁 Día completo";

  }


  if (entry.type === "partial") {

    statusElement.textContent =
      "🟡 Día incompleto";

  }


  if (entry.type === "absent") {

    statusElement.textContent =
      entry.protected
        ? "🛡️ Día protegido"
        : "🔴 No asistió";

  }

}


// ======================================
// REGISTRAR DÍA
// ======================================

function registerDay(type) {

  const today = getTodayString();


  // Evitar registrar dos veces el mismo día

  const alreadyRegistered =
    gameData.history.some(
      item => item.date === today
    );


  if (alreadyRegistered) {

    showToast(
      "⚠️ Hoy ya está registrado"
    );

    return;

  }


  const dayOfWeek =
    new Date().getDay();


  // Solo permitimos registrar
  // lunes-viernes para el sistema semanal

  if (dayOfWeek === 0 || dayOfWeek === 6) {

    showToast(
      "🧁 Hoy no es un día lectivo"
    );

    return;

  }


  let amount = 0;

  let protectedDay = false;


  // -----------------------
  // DÍA COMPLETO
  // -----------------------

  if (type === "complete") {

    amount = 5;

    gameData.frostings += amount;

  }


  // -----------------------
  // DÍA INCOMPLETO
  // -----------------------

  if (type === "partial") {

    amount = 2;

    gameData.frostings += amount;

  }


  // -----------------------
  // AUSENCIA
  // -----------------------

  if (type === "absent") {

    // Si hay un escudo,
    // preguntamos si quiere usarlo.

    if (gameData.shields > 0) {

      const useIt =
        confirm(
          "🛡️ Tienes un Special Shield.\n\n¿Quieres usarlo para no perder 2 Frostings?"
        );


      if (useIt) {

        gameData.shields -= 1;

        amount = 0;

        protectedDay = true;

      } else {

        amount = -2;

        gameData.frostings =
          Math.max(
            0,
            gameData.frostings - 2
          );

      }

    } else {

      amount = -2;

      gameData.frostings =
        Math.max(
          0,
          gameData.frostings - 2
        );

    }

  }


  // ----------------------------------
  // GUARDAR EN HISTORIAL
  // ----------------------------------

  const newEntry = {

    date: today,

    type: type,

    amount: amount,

    protected: protectedDay

  };


  gameData.history.unshift(
    newEntry
  );


  // ----------------------------------
  // GUARDAR DÍA EN LA SEMANA
  // ----------------------------------

  const mondayIndex =
    dayOfWeek - 1;


  gameData.currentWeek.days[
    mondayIndex
  ] = type;


  // ----------------------------------
  // COMPROBAR SEMANA PERFECTA
  // ----------------------------------

  checkPerfectWeek();


  saveData();

  updateUI();


  // ----------------------------------
  // MENSAJES
  // ----------------------------------

  if (type === "complete") {

    showToast(
      "🧁 +5 Frostings. ¡Buen trabajo!"
    );

  }


  if (type === "partial") {

    showToast(
      "🧁 +2 Frostings. Cada paso cuenta."
    );

  }


  if (type === "absent") {

    if (protectedDay) {

      showToast(
        "🛡️ Escudo usado. Tus Frostings están a salvo."
      );

    } else {

      showToast(
        "🧁 −2 Frostings. Mañana es otro día."
      );

    }

  }

}


// ======================================
// SEMANA PERFECTA
// ======================================

function checkPerfectWeek() {

  const days =
    gameData.currentWeek.days;


  const fullWeek =
    days.every(
      day => day === "complete"
    );


  if (
    fullWeek &&
    !gameData.currentWeek.completed
  ) {

    gameData.shields += 1;

    gameData.currentWeek.completed = true;


    showToast(
      "🛡️ ¡SEMANA PERFECTA! Has ganado un Special Shield."
    );

  }

}


// ======================================
// MOSTRAR SEMANA
// ======================================

function updateWeek() {

  const days =
    gameData.currentWeek.days;


  let completedCount = 0;


  days.forEach(
    (day, index) => {

      const element =
        document.getElementById(
          `day${index}`
        );


      element.className =
        "day-dot";


      if (day === "complete") {

        element.classList.add(
          "day-complete"
        );

        completedCount++;

      }


      if (day === "partial") {

        element.classList.add(
          "day-partial"
        );

      }


      if (day === "absent") {

        element.classList.add(
          "day-absent"
        );

      }

    }
  );


  document.getElementById(
    "weeklyProgress"
  ).textContent =
    `${completedCount} / 5`;

}


// ======================================
// USAR ESCUDO
// ======================================

function useShield() {

  if (gameData.shields <= 0) {

    showToast(
      "🛡️ No tienes ningún escudo"
    );

    return;

  }


  showToast(
    "🛡️ Los escudos se usan al registrar una ausencia."
  );

}


// ======================================
// TIENDA
// ======================================

function renderShop() {

  const shop =
    document.getElementById("shop");


  shop.innerHTML = "";


  rewards.forEach(
    reward => {

      const canBuy =
        gameData.frostings >= reward.price;


      const item =
        document.createElement("div");


      item.className =
        "shop-item";


      item.innerHTML = `

        <div class="emoji">
          ${reward.emoji}
        </div>

        <h3>
          ${reward.name}
        </h3>

        <p>
          🧁 ${reward.price} Frostings
        </p>

        <button
          ${canBuy ? "" : "disabled"}
          onclick="buyReward('${reward.id}')">

          Canjear

        </button>

      `;


      shop.appendChild(
        item
      );

    }
  );

}


// ======================================
// COMPRAR PREMIO
// ======================================

function buyReward(id) {

  const reward =
    rewards.find(
      item => item.id === id
    );


  if (!reward) return;


  if (
    gameData.frostings <
    reward.price
  ) {

    showToast(
      "🧁 No tienes suficientes Frostings"
    );

    return;

  }


  const confirmed =
    confirm(
      `¿Quieres canjear "${reward.name}" por ${reward.price} Frostings?`
    );


  if (!confirmed) return;


  gameData.frostings -=
    reward.price;


  gameData.shopPurchases.push({

    id: reward.id,

    name: reward.name,

    price: reward.price,

    date: new Date().toISOString()

  });


  saveData();

  updateUI();


  showToast(
    `🎉 ¡Has desbloqueado ${reward.name}!`
  );

}


// ======================================
// HISTORIAL
// ======================================

function updateHistory() {

  const historyElement =
    document.getElementById("history");


  if (
    gameData.history.length === 0
  ) {

    historyElement.innerHTML = `
      <p class="empty-history">
        Todavía no hay días registrados 🧁
      </p>
    `;

    return;

  }


  historyElement.innerHTML = "";


  gameData.history.forEach(
    item => {

      const date =
        new Date(
          item.date + "T12:00:00"
        );


      const formattedDate =
        date.toLocaleDateString(
          "es-ES",
          {
            day: "numeric",
            month: "short"
          }
        );


      let emoji = "🟢";
      let text = "Día completo";


      if (
        item.type === "partial"
      ) {

        emoji = "🟡";
        text = "Día incompleto";

      }


      if (
        item.type === "absent"
      ) {

        emoji =
          item.protected
            ? "🛡️"
            : "🔴";


        text =
          item.protected
            ? "Ausencia protegida"
            : "No asistió";

      }


      const amountText =
        item.amount >= 0
          ? `+${item.amount}`
          : item.amount;


      const div =
        document.createElement("div");


      div.className =
        "history-item";


      div.innerHTML = `

        <span>
          ${emoji}
          ${formattedDate}
          · ${text}
        </span>

        <strong>
          ${amountText} 🧁
        </strong>

      `;


      historyElement.appendChild(
        div
      );

    }
  );

}


// ======================================
// LIMPIAR HISTORIAL
// ======================================

function clearHistory() {

  const confirmed =
    confirm(
      "¿Seguro que quieres borrar todo el historial?"
    );


  if (!confirmed) return;


  gameData.history = [];

  gameData.currentWeek = {
    days: [null, null, null, null, null],
    completed: false
  };


  saveData();

  updateUI();

}


// ======================================
// REINICIAR TODO
// ======================================

function resetGame() {

  const confirmed =
    confirm(
      "⚠️ Esto borrará TODOS los Frostings, escudos, historial y compras.\n\n¿Seguro?"
    );


  if (!confirmed) return;


  gameData =
    structuredClone(defaultData);


  saveData();

  updateUI();


  showToast(
    "🧁 Sweet Progress ha sido reiniciado"
  );

}


// ======================================
// TOAST
// ======================================

let toastTimeout;


function showToast(message) {

  const toast =
    document.getElementById("toast");


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimeout
  );


  toastTimeout =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3500
    );

}


// ======================================
// INICIAR APP
// ======================================

updateUI();
