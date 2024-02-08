// O principal arquivo
// Necessita rodar ambos o server e o client com npm run server e npm run dev, respectivamente

//Feito com base em : https://www.youtube.com/watch?v=2FeymQoKvrk&t=3299s

import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// Função para ... em quanto o bot carrega
function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += "."; // . .. ... até a IA responder

    if (element.textContent === "....") {
      // Ao chegar em quatro pontos, retorna vazio
      element.textContent = "";
    }
  }, 300); // Intervalo 300 milesegundos
}

// Função para digitar letra por letra
function typeText(element, text) {
  let index = 0;
  tts(text); // Chama text to speech
  let interval = setInterval(() => {
    
    if (index < text.length) {
      // text é a resposta da IA
      // Elemento HTML += texto da ia .charAt(posição index)
      // charAt vai pegar o char na posição index do text
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      // Ao chegar no limite da array, para o intervalo
      clearInterval(interval);  

    }
  }, 20);
}



// Criando ID aleatorios para o elemento HTML
function generateUniqueId() {
  const timestamp = Date.now(); // tempo
  const randomNumb = Math.random(); // numero aleatorio
  const hexaDecimals = randomNumb.toString(16); // 16 é para conversão em hexadecimal
  return `id-${timestamp}-${hexaDecimals}`;
}

function chatStripe(isAi, value, uniqueId) {
  // Checagem e retorno dependente se é IA digitando ou Usuario. Isso para receber styles do CSS dependendo se é usuario ou bot.
  return `
  <div class="wrapper ${isAi && "ai"}">
    <div class="chat">
      <div class="profile">
       <img 
          src="${isAi ? bot : user}"
          alt="${isAi ? "bot" : "user"}"
        />
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
    </div>
  </div>
  `;
}

const handleSubmit = async (e) => {
  // Previne reload
  e.preventDefault();

  // Pegando dados do form
  const data = new FormData(form);

  // chatStripe do user
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();
  

  // chatStripe do bot
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight; // fazer scroll para mostrar nova mensagem
  const messageDiv = document.getElementById(uniqueId); // Mensagem do bot, com ID unico criado

  loader(messageDiv); // Pegando elemento que contem a mensagem e renderizando
  
  // Faça um post no server
  const response = await fetch("http://localhost:5000/", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json", // O Content Type precisa dar match no tipo que vai ser enviado
    },
    body: JSON.stringify({prompt: data.get("prompt")})
  });
  clearInterval(loadInterval); // Remove o timer relacionado com os pontos
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // quebra a resposta
    typeText(messageDiv, parsedData); // envia o elemento que sera substituido pela resposta e a resposta cortada

  } else {
    const err = await response.text();

    messageDiv.innerText = "Algo deu errado"
    alert(err);
  }
};

// Para aceitar click em submit ou apertando enter

// Clicando botão
form.addEventListener("submit", handleSubmit);

// Clicando enter
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

function tts(texto){
  const txt = new SpeechSynthesisUtterance(texto); //Passa pela API de text to speech
  const voices = speechSynthesis.getVoices(); // lista de vozes
  const brasil = voices.filter(x => x.lang === "pt-BR") // filtra vozes brasileiras
  txt.voice = brasil[23]; // Seleciona uma voz
  txt.lang = "pt-br"; // qual a linguagem?
  speechSynthesis.speak(txt); // fala o texto. Google parece quebrar se usar lang.
}