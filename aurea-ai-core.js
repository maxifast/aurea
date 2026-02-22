// ============================================================================
// AUREA AI CONCIERGE - ARCHITECTURE (4 LAYERS)
// ============================================================================

// ----------------------------------------------------------------------------
// СЛОЙ 1: System Prompt (Личность и Ограничения)
// ----------------------------------------------------------------------------
const SYSTEM_PROMPT = `Tu eres Aurea, un exclusivo conserje de IA para huéspedes de villas de élite en Marbella e Ibiza.
Tu tono: impecablemente educado, elegante, conciso y proactivo (estilo de los mejores hoteles suizos).
Te comunicas con los huéspedes en español (o en su idioma).

Tus limitaciones:
- Nunca prometas descuentos o servicios gratuitos.
- Nunca inventes contraseñas de Wi-Fi o códigos de puertas. Usa solo los datos proporcionados en el contexto.
- Si un huésped pide algo ilegal o peligroso, declina educadamente.
- Siempre confirma la acción antes de cobrar dinero.`;


// ----------------------------------------------------------------------------
// СЛОЙ 2: Динамический Контекст (Context Injection)
// ----------------------------------------------------------------------------
// Функция симулирует получение актуальных данных гостя из базы данных (MongoDB/PostgreSQL)
async function fetchGuestContext(guestId) {
    // В реальности: await db.collection('guests').findOne({ id: guestId })
    return {
        guest_name: "Alejandro",
        villa_name: "Villa Luna (Ibiza)",
        wifi_password: "Luna2026!",
        pool_temp_current: "24°C",
        upcoming_events: ["16:00 - Masaje"],
        language_preference: "es"
    };
}


// ----------------------------------------------------------------------------
// СЛОЙ 3: "Руки" ИИ (Function Calling / Tools)
// ----------------------------------------------------------------------------
// Описание функций бэкенда для OpenAI/Claude в формате JSON Schema
const AUREA_TOOLS = [
    {
        type: "function",
        function: {
            name: "book_restaurant",
            description: "Reserva una mesa en un restaurante local para el huésped.",
            parameters: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Nombre del restaurante (ej. Nobu, Zuma)" },
                    time: { type: "string", description: "Hora de la reserva en formato HH:MM" },
                    guests: { type: "number", description: "Número total de invitados" }
                },
                required: ["name", "time", "guests"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "set_ac_temperature",
            description: "Ajusta la temperatura del aire acondicionado en una zona específica de la villa.",
            parameters: {
                type: "object",
                properties: {
                    room: { type: "string", description: "Zona de la villa (ej. Salón, Suite Principal, Piscina)" },
                    temp: { type: "number", description: "Temperatura deseada en grados Celsius" }
                },
                required: ["room", "temp"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "contact_human_manager",
            description: "Envía una alerta o SMS al mánager humano (Julio) para peticiones fuera del alcance de la IA.",
            parameters: {
                type: "object",
                properties: {
                    reason: { type: "string", description: "Razón para contactar al mánager" }
                },
                required: ["reason"]
            }
        }
    }
];

// Обработчик "Рук" - когда ИИ решает вызвать функцию
async function executeTool(toolCall) {
    const args = JSON.parse(toolCall.function.arguments);
    const action = toolCall.function.name;

    console.log(`[BACKEND ACTION] ИИ вызвал функцию: ${action}`, args);

    if (action === "book_restaurant") {
        // В реальности: запрос к OpenTable API
        return { status: "success", confirmation_code: "NT-8821", message: `Mesa confirmada en ${args.name} a las ${args.time} para ${args.guests}.` };
    }
    if (action === "set_ac_temperature") {
        // В реальности: запрос к Smart Home API (ej. KNX / Crestron)
        return { status: "success", message: `Temperatura en ${args.room} ajustada a ${args.temp}°C.` };
    }

    return { status: "error", message: "Acción no reconocida." };
}


// ----------------------------------------------------------------------------
// СЛОЙ 4: Выбор Модели (Роутинг OpenAI vs Anthropic)
// ----------------------------------------------------------------------------
// Основной контроллер для обработки сообщения гостя
async function processGuestMessage(guestId, guestMessage) {
    // 1. Получаем динамический контекст (СЛОЙ 2)
    const context = await fetchGuestContext(guestId);

    // 2. Склеиваем системный промпт (СЛОЙ 1) и контекст (СЛОЙ 2) 'за кулисами'
    const messages = [
        {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\n[DATOS DEL SISTEMA OCULTOS AL USUARIO]\nHuésped: ${context.guest_name}\nVilla: ${context.villa_name}\nContraseña Wi-Fi: ${context.wifi_password}\nTemp. Piscina: ${context.pool_temp_current}\nEventos de hoy: ${context.upcoming_events.join(', ')}`
        },
        {
            role: "user",
            content: guestMessage
        }
    ];

    // 3. Анализируем запрос для выбора модели (СЛОЙ 4)
    // Если в тексте есть слова-триггеры действий (бронь, температура, купить, включи) -> GPT-4o
    // Если это просто вопрос или беседа (где полотенца, как дела, посоветуй) -> Claude 3.5
    const actionKeywords = ['reserva', 'mesa', 'temperatura', 'aire', 'concierta', 'compra', 'cambia'];
    const requiresAction = actionKeywords.some(word => guestMessage.toLowerCase().includes(word));

    let responseText = "";

    if (requiresAction) {
        // СЛОЙ 4: Используем OpenAI GPT-4o для точного вызова функций (Function Calling)
        console.log(`[ROUTING] Выбран OpenAI (GPT-4o) для обработки логики и функций.`);

        // Симуляция ответа от OpenAI с вызовом функции:
        // const gptResponse = await openai.chat.completions.create({...})
        const simulatedGptToolCall = {
            function: {
                name: "book_restaurant",
                arguments: JSON.stringify({ name: "Nobu", time: "21:00", guests: 4 })
            }
        };

        // Бэкенд ловит JSON-команду и исполняет ее (СЛОЙ 3)
        const toolResult = await executeTool(simulatedGptToolCall);

        // Затем ИИ генерирует финальный красивый ответ на основе отбивки от API
        responseText = `He confirmado su mesa en Nobu para 4 personas a las 21:00, Don Alejandro. ¿Desea que nuestro conductor tenga el Range Rover listo en la puerta a las 20:45?`;

    } else {
        // СЛОЙ 4: Используем Anthropic (Claude 3.5 Sonnet) для эмпатичного и красивого ответа
        console.log(`[ROUTING] Выбран Anthropic (Claude 3.5) для премиального общения.`);

        // Симуляция красивого ответа от Claude, который использовал динамический контекст (СЛОЙ 2)
        // const claudeResponse = await anthropic.messages.create({...})
        if (guestMessage.toLowerCase().includes("toallas") || guestMessage.toLowerCase().includes("полотенца")) {
            responseText = `Por supuesto, Don Alejandro. Sus toallas de algodón egipcio se encuentran en la cesta de teca junto a la piscina infinita (que por cierto está a ${context.pool_temp_current}, perfecta para un baño). Si necesita más, enviaré a nuestro personal de inmediato.`;
        } else {
            responseText = `Estoy a su entera disposición, Don Alejandro. Recuerde que tiene su masaje programado hoy a las 16:00. ¿Hay algo en lo que pueda asistirle mientras tanto?`;
        }
    }

    console.log(`[AUREA AI RESPONSE] =>`, responseText);
    return responseText;
}

// Экспорт для использования в основном сервере (например, Express.js или Next.js)
// module.exports = { processGuestMessage };

// --- ТЕСТОВЫЙ ЗАПУСК ---
// Раскомментируйте код ниже для проверки в терминале (node aurea-ai-core.js)
/*
async function runDemo() {
    console.log("--- TEST 1: Запрос на действие (Исполняется через GPT-4o) ---");
    await processGuestMessage("user_771", "Забронируй столик на 4-х в Nobu на 21:00");
    
    console.log("\n--- TEST 2: Вопрос о комфорте (Исполняется через Claude 3.5) ---");
    await processGuestMessage("user_771", "А где тут полотенца?");
}
runDemo();
*/
