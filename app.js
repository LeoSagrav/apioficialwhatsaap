const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Token de verificación del webhook
const VERIFY_TOKEN = 'mi_token_secreto';
// Tu token de acceso de la API
const ACCESS_TOKEN = 'EAANrodAkfE4BQ0qRTDWQQL7ah8iiGoohUJASzQH0gM0ZBYZAlHDTXlXtLmQRn8TVuPOiFay1o9hxy0ljnp7axyEnbz2eAMKWL1KlHZAre1xp8eKshxZC7YJ1mjHLDZBjOU6BJkyZBdDtVZCDmjyeNCOWWomzD84IaCIzflmWOwk4cCQE8QgHd3uiAk7D7A695Hd3KjYDhlR0q0X6DZAUfFI0k8F0GjPmbGNX8oGaAcfqZC8stYaRZCD7T6Go5MDXdoOLEspRWVIbhlRZCPk1V1vHYVMcLMDiF0ZBaaDnIkIaqwZDZD'; // El que ves en tu imagen
// ID del número de teléfono
const PHONE_NUMBER_ID = '1039011352624556'; // El que ves en tu imagen

// 1. Verificación del webhook (GET)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verificado');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// 2. Recepción de mensajes (POST)
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
            for (const change of entry.changes) {
                if (change.value.messages) {
                    const message = change.value.messages[0];
                    const from = message.from; // Número del cliente
                    const text = message.text?.body; // Mensaje recibido

                    console.log(`Mensaje de ${from}: ${text}`);

                    // Detectar si el mensaje contiene "miranda"
                    if (text && text.toLowerCase().includes('miranda')) {
                        await enviarMensaje(from, '¡Hola! Has mencionado Miranda. ¿En qué puedo ayudarte?');
                    }
                }
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// 3. Función para enviar mensajes
async function enviarMensaje(numero, mensaje) {
    try {
        const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;
        
        await axios.post(url, {
            messaging_product: 'whatsapp',
            to: numero,
            type: 'text',
            text: { body: mensaje }
        }, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Mensaje enviado correctamente');
    } catch (error) {
        console.error('Error al enviar mensaje:', error.response?.data || error.message);
    }
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});