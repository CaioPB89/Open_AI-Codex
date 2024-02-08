// os modulos são para: pedidos cross origen (cos), variaveis de ambientes seguras (dotenv) , express para framework backend, nodemon para continuar rodando a aplicação 
// e openai

import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config(); // Carrega os dados de env para process


// Usando a chave de env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

const app = express(); // Iniciando um app express
app.use(cors());
app.use(express.json());


app.get("/", async(req, res) => {
    // Uma mensagem para ver no servidor
    res.status(200).send({
        message: "Hello from Codex",
    })
})

app.post("/", async(req,res) => {
    // Como tratar o pedido recebido, que é um pacote parsed JSON
    try{
        const prompt = req.body.prompt;
        const response = await openai.chat.completions.create({
            model:"gpt-3.5-turbo",
            messages: [ 
                //{ role: "system", content: "You are a helpful assistant." },  //Caso queira colocar um contexto para a IA
                {"role":"user","content":`${prompt}`}],
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        })
        res.status(200).send({
            bot: response.choices[0].message.content
            // Retorno da resposta da IA
        })
    } catch (error){
        console.log(error);
        res.status(500).send({ error });
    }
}
)

app.listen(5000, () => console.log("Server is running on port http://localhost:5000")) //   Onde o server está escutando pedidos, em qual porta