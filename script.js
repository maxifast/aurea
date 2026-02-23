// Project AUREA - AI Concierge Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('AUREA Concierge loaded.');

    // --- OLD SIDEBAR CHAT (Kept for compatibility if elements exist) ---
    const chatMessages = document.getElementById('chat-messages');
    const backendVisuals = document.getElementById('backend-visuals');

    function addMessage(text, type) {
        if (!chatMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', type);
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showBackendLog(text) {
        if (!backendVisuals) return;
        const logLine = document.createElement('div');
        logLine.classList.add('log-line');
        logLine.innerText = `> ${text}`;
        backendVisuals.appendChild(logLine);
        if (backendVisuals.children.length > 3) {
            backendVisuals.removeChild(backendVisuals.firstChild);
        }
    }

    // --- BOOKING MODULE LOGIC ---
    const bookingPanel = document.getElementById('booking-panel');
    const bookingMessages = document.getElementById('booking-messages');
    const bookingInputArea = document.getElementById('booking-input-area');
    const closePanelBtn = document.querySelector('.close-panel');
    const bookingUserInput = document.getElementById('booking-user-input');
    const bookingSendBtn = document.getElementById('booking-send-btn');

    function openBookingFlow(villaName = "Villa Solstice") {
        if (!bookingPanel) return;
        document.body.classList.add('panel-open');
        startBookingChat(villaName);
    }

    function closeBookingFlow() {
        document.body.classList.remove('panel-open');
    }

    if (closePanelBtn) closePanelBtn.addEventListener('click', closeBookingFlow);

    // Triggers
    document.querySelectorAll('.booking-trigger, #hero-reserve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const villa = e.currentTarget.dataset.villa || "";
            openBookingFlow(villa);
        });
    });

    let bookingStep = 0;
    let bookingData = {
        villa: '',
        fecha: '',
        invitados: '',
        gastronomia: '',
        movilidad: '',
        ambiente: '',
        extras: []
    };

    function addBookingMessage(text, type = 'ai') {
        if (!bookingMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('booking-msg', type);
        msgDiv.innerHTML = `<p>${text}</p>`;
        bookingMessages.appendChild(msgDiv);
        bookingMessages.scrollTop = bookingMessages.scrollHeight;
    }

    function startBookingChat(villaName) {
        if (!bookingMessages || !bookingInputArea) return;
        bookingMessages.innerHTML = '';
        bookingInputArea.innerHTML = '';
        bookingData = { villa: villaName, extras: [] };

        if (!villaName) {
            // General entry, ask for villa first
            bookingStep = 0;
            setTimeout(() => {
                addBookingMessage("Un placer saludarle. ¿Qué refugio tiene en mente para su próxima estancia?");
                renderInputOptions([
                    { text: 'Villa Solstice', img: 'images/1.png' },
                    { text: 'Casa Terra', img: 'images/2.png' },
                    { text: 'The Cliffhouse', img: 'images/3.png' }
                ]);
            }, 800);
        } else {
            // Specific villa entry from card
            bookingStep = 1;
            setTimeout(() => {
                addBookingMessage(`Excelente elección. ${villaName} es una joya. ¿Cuándo planea llegar y es esta una ocasión especial (cumpleaños, relax, trabajo)?`);
                renderInputOptions(['Este fin de semana', 'Próximo mes', 'Es un cumpleaños', 'Trabajo/Retiro']);
            }, 800);
        }
    }

    function renderInputOptions(options) {
        if (!bookingInputArea) return;
        bookingInputArea.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.classList.add('chip-btn');

            if (typeof opt === 'object' && opt.img) {
                btn.innerHTML = `<img src="${opt.img}" alt="${opt.text}" class="chip-img"><span>${opt.text}</span>`;
                btn.classList.add('chip-btn-with-img');
                btn.onclick = () => handleChoice(opt.text);
            } else {
                btn.innerText = opt;
                btn.onclick = () => handleChoice(opt);
            }

            bookingInputArea.appendChild(btn);
        });
    }

    function handleChoice(choice) {
        // Track data based on step
        if (bookingStep === 0) bookingData.villa = choice;
        else if (bookingStep === 1) bookingData.fecha = choice;
        else if (bookingStep === 2) bookingData.invitados = choice;
        else if (bookingStep === 3) bookingData.gastronomia = choice;
        else if (bookingStep === 4) bookingData.movilidad = choice;
        else if (bookingStep === 5) bookingData.ambiente = choice;

        addBookingMessage(choice, 'user');
        bookingStep++;

        setTimeout(() => {
            if (bookingStep === 1) {
                addBookingMessage(`Excelente elección. ${bookingData.villa} es una joya. ¿Cuándo planea llegar y es esta una ocasión especial (cumpleaños, relax, trabajo)?`);
                renderInputOptions(['Este fin de semana', 'Próximo mes', 'Es un cumpleaños', 'Trabajo/Retiro']);
            } else if (bookingStep === 2) {
                addBookingMessage("¿Cuántos invitados le acompañarán? ¿Necesita preparar zonas para niños o personal?");
                renderInputOptions(['Solo yo', 'Pareja', 'Familia (con niños)', 'Grupo + Personal']);
            } else if (bookingStep === 3) {
                addBookingMessage("Para su llegada, ¿prefiere productos locales orgánicos, mariscos, o reservamos un chef privado?");
                renderInputOptions(['Orgánicos locales', 'Mariscos frescos', 'Chef Privado', 'Sorpréndeme']);
            } else if (bookingStep === 4) {
                addBookingMessage("¿Qué vehículo prefiere en su garaje: Range Rover, un descapotable o prefiere un conductor?");
                renderInputOptions(['Range Rover', 'Descapotable', 'Conductor Privado']);
            } else if (bookingStep === 5) {
                addBookingMessage("Un último detalle. ¿Qué ambiente musical desea encontrar al cruzar el umbral?");
                renderInputOptions(['Jazz suave', 'Ambient Chill', 'Electrónica Ibiza', 'Silencio absoluto']);
            } else if (bookingStep === 6) {
                showFinalDashboard();
            }
        }, 1000);
    }

    // Handle Custom User Input
    function submitBookingInput() {
        if (!bookingUserInput) return;
        const val = bookingUserInput.value.trim();
        if (!val) return;

        addBookingMessage(val, 'user');
        bookingUserInput.value = '';
        bookingData.extras.push(val);

        setTimeout(() => {
            addBookingMessage("Entendido. He tomado nota de su petición especial. ¿Continuamos?", "ai");
        }, 800);
    }

    if (bookingSendBtn) {
        bookingSendBtn.addEventListener('click', submitBookingInput);
    }
    if (bookingUserInput) {
        bookingUserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitBookingInput();
        });
    }

    function showFinalDashboard() {
        addBookingMessage("Todo listo. Generando su itinerario dinámico...");
        setTimeout(() => {
            const chatCont = document.getElementById('booking-chat-container');
            const dashCont = document.getElementById('booking-dashboard');
            if (chatCont) chatCont.style.display = 'none';
            if (dashCont) {
                dashCont.style.display = 'block';
                renderItinerary();
                renderSummary();
            }
        }, 2000);
    }

    function renderSummary() {
        const summaryCont = document.getElementById('booking-summary');
        if (!summaryCont) return;

        const items = [
            { label: '📅 ' + bookingData.fecha },
            { label: '👥 ' + bookingData.invitados },
            { label: '🍽️ ' + bookingData.gastronomia },
            { label: '🚗 ' + bookingData.movilidad },
            { label: '🎵 ' + bookingData.ambiente }
        ];

        // Add user-defined extras
        bookingData.extras.forEach(extra => {
            items.push({ label: '✨ ' + extra });
        });

        summaryCont.innerHTML = items.map(item => `
            <div class="summary-pill">${item.label}</div>
        `).join('');
    }

    function renderItinerary() {
        const timeline = document.querySelector('.itinerary-timeline');
        if (!timeline) return;
        timeline.innerHTML = `
            <div class="timeline-item active">
                <span class="time-label">14 Jul, 14:00</span>
                <div class="event-title">Llegada (Vuelo Privado)</div>
                <div class="event-status">Confirmado</div>
            </div>
            <div class="timeline-item active">
                <span class="time-label">14 Jul, 15:30</span>
                <div class="event-title">Check-in: ${bookingData.villa || 'Villa Solstice'}</div>
                <div class="event-status">Código de acceso: 8821</div>
            </div>
            <div class="timeline-item">
                <span class="time-label">14 Jul, 20:00</span>
                <div class="event-title">Cena con Chef Mario</div>
                <div class="event-status">Confirmando detalles...</div>
            </div>
        `;
    }

    // Share / Export Simulation
    window.simulateExport = function (type) {
        let msg = "";
        if (type === 'email') msg = "📧 Enviando confirmación detallada a su correo...";
        else if (type === 'whatsapp') msg = "💬 Abriendo WhatsApp para compartir itinerario...";
        else msg = "🔹 Enviando confirmación vía Messenger...";

        alert(msg); // Simulation
    };

    const btnChangeMagic = document.getElementById('btn-change-magic');
    if (btnChangeMagic) {
        btnChangeMagic.addEventListener('click', () => {
            const chatCont = document.getElementById('booking-chat-container');
            const dashCont = document.getElementById('booking-dashboard');
            if (chatCont) chatCont.style.display = 'block';
            if (dashCont) dashCont.style.display = 'none';
            addBookingMessage("¿Qué detalle de la magia desea ajustar?", "ai");
        });
    }

    // --- LIGHTBOX LOGIC ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');

    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.zoomable').forEach(img => {
        img.addEventListener('click', (e) => {
            const bg = window.getComputedStyle(e.target).backgroundImage;
            const src = bg.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
            openLightbox(src);
        });
    });

    document.querySelectorAll('.thumb').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            openLightbox(e.target.src);
        });
    });

    if (closeLightbox) {
        closeLightbox.addEventListener('click', () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // --- INTERACTIVE HERO PHONE CHAT ---
    const chatContainer = document.getElementById('hero-phone-chat');
    const chatInput = document.getElementById('demo-chat-input');
    const chatSendBtn = document.getElementById('demo-chat-send');

    // 1. RUN HERO CHAT ANIMATION
    const runHeroAnimation = async () => {
        const animElements = [
            { id: 'anim-m1', delay: 1000 },
            { id: 'anim-t1', delay: 200 },
            { id: 'anim-typ1', delay: 600, isTyping: true },
            { id: 'anim-m2', delay: 1200 },
            { id: 'anim-t2', delay: 200 },
            { id: 'anim-m3', delay: 1500 },
            { id: 'anim-t3', delay: 200 },
            { id: 'anim-typ2', delay: 800, isTyping: true },
            { id: 'anim-m4', delay: 1200 },
            { id: 'anim-api', delay: 500 },
            { id: 'anim-m5', delay: 1000 },
            { id: 'anim-t4', delay: 200 },
            { id: 'anim-m6', delay: 2000 },
            { id: 'anim-t5', delay: 200 },
            { id: 'anim-typ3', delay: 800, isTyping: true },
            { id: 'anim-m7', delay: 1200 },
            { id: 'anim-t6', delay: 200 }
        ];

        let activeTypingId = null;
        for (let step of animElements) {
            const el = document.getElementById(step.id);
            if (!el) continue;

            await new Promise(r => setTimeout(r, step.delay));

            if (activeTypingId) {
                const typingEl = document.getElementById(activeTypingId);
                if (typingEl) typingEl.style.display = 'none';
                activeTypingId = null;
            }

            if (step.isTyping) {
                activeTypingId = step.id;
            }

            el.classList.add('visible');
            if (el.classList.contains('msg-time')) {
                el.style.display = 'block';
            } else {
                el.style.display = (step.isTyping) ? 'inline-flex' : 'flex';
            }
            scrollToBottom();
        }
    };

    if (chatContainer) {
        runHeroAnimation();
    }

    // STATE MANAGEMENT: Optimistic UI updates
    function appendUserMessage(text) {
        if (!chatContainer) return;
        const msgHtml = `
            <div class="chat-msg user-msg chat-element visible" style="display:flex;">
                <p>${text}</p>
            </div>
            <div class="msg-time right chat-element visible" style="display:block;">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', msgHtml);
        scrollToBottom();
    }

    function appendTypingIndicator() {
        if (!chatContainer) return null;
        const typingId = 'typing-' + Date.now();
        const msgHtml = `
            <div id="${typingId}" class="chat-wrapper ai-wrapper">
                <div class="chat-msg ai-msg typing-indicator chat-element visible" style="display:inline-flex;">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
            </div>
        `;
        chatContainer.insertAdjacentHTML('beforeend', msgHtml);
        scrollToBottom();
        return typingId;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function appendAIMessage(text, toolCardHtml = null) {
        if (!chatContainer) return;
        let html = `<div class="chat-wrapper ai-wrapper">`;

        if (toolCardHtml) {
            html += toolCardHtml; // Context injection: tools executed successfully
        }

        html += `
            <div class="chat-msg ai-msg chat-element visible" style="display:flex;">
                <p>${text}</p>
            </div>
            <div class="msg-time left chat-element visible" style="display:block;">Aurea AI &bull; Ahora</div>
        </div>`;

        chatContainer.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
    }

    function scrollToBottom() {
        setTimeout(() => {
            if (chatContainer) chatContainer.scrollTo({ top: chatContainer.scrollHeight + 100, behavior: 'smooth' });
        }, 50);
    }

    // 2. CONTEXT INJECTION & 3. SYSTEM INSTRUCTIONS
    const MOCK_DB_CONTEXT = {
        guestName: "Alejandro",
        villaId: "Villa Luna",
        activeBookings: ["Masaje 16:00"],
        villaManual: { wifi_pass: "Luna2026!", door_code: "8821" }
    };

    const SYSTEM_PROMPT = `Tu eres Aurea, un exclusivo conserje de IA para huéspedes de villas de élite.
Tone: Educado, elegante, conciso.
Limitaciones: Nunca prometas descuentos gratis. Nunca inventes códigos.
Contexto inyectado: Huésped ${MOCK_DB_CONTEXT.guestName}, Villa ${MOCK_DB_CONTEXT.villaId}.`;

    // 4. TOOL IMPLEMENTATION (MOCKED API ROUTE /api/chat)
    // In a real environment, this goes to standard Next.js API route fetching OpenAI with tools
    const LLM_TOOLS_SCHEMA = [
        { name: "book_service", parameters: ["type", "time"] },
        { name: "adjust_climate", parameters: ["zone", "temp"] },
        { name: "alert_staff", parameters: ["message"] }
    ];

    async function mockApiChatRoute(userText) {
        console.log("[API Route] /api/chat called.");
        console.log("[System Prompt & Context injected]:", SYSTEM_PROMPT);
        console.log("[User Message]:", userText);

        const lower = userText.toLowerCase();
        let finalReply = "";
        let toolExecuted = null;

        // Mocking LLM understanding and returning tool calls
        return new Promise(resolve => {
            setTimeout(() => {
                if (lower.includes('reserva') || lower.includes('mesa') || lower.includes('cena')) {
                    // LLM calls tool: book_service
                    console.log("[LLM Action] tool_call: book_service({type:'Restaurante', time:'21:00'})");
                    toolExecuted = {
                        name: "book_service",
                        title: "OpenTable API",
                        desc: "Reserva Sincronizada",
                        color: "#2bc985",
                        svg: '<polyline points="20 6 9 17 4 12"></polyline>'
                    };
                    finalReply = `He confirmado la reserva para esta noche, Don ${MOCK_DB_CONTEXT.guestName}. ¿Desea que preparemos un vehículo para el traslado?`;
                }
                else if (lower.includes('temperatura') || lower.includes('frio') || lower.includes('aire')) {
                    // LLM calls tool: adjust_climate
                    console.log("[LLM Action] tool_call: adjust_climate({zone:'Salón', temp: 22})");
                    toolExecuted = {
                        name: "adjust_climate",
                        title: "Smart Home KNX",
                        desc: "Climatización Ajustada",
                        color: "#3b82f6",
                        svg: '<path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.947 12.65a4 4 0 0 0-5.925-4.128M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>'
                    };
                    finalReply = `He ajustado la temperatura del salón a 22°C. Si necesita un ambiente más cálido en la piscina, hágamelo saber.`;
                }
                else if (lower.includes('personal') || lower.includes('limpieza') || lower.includes('staff')) {
                    // LLM calls tool: alert_staff
                    console.log(`[LLM Action] tool_call: alert_staff({message:'${lower}'})`);
                    toolExecuted = {
                        name: "alert_staff",
                        title: "Staff Notification",
                        desc: "Notificación Enviada al Mánager",
                        color: "#f59e0b",
                        svg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>'
                    };
                    finalReply = `He avisado a nuestro equipo para que asistan a su petición de inmediato en ${MOCK_DB_CONTEXT.villaId}.`;
                }
                else if (lower.includes('wifi') || lower.includes('internet')) {
                    // Uses injected context
                    finalReply = `Por supuesto. La red es "${MOCK_DB_CONTEXT.villaId}" y la contraseña es "${MOCK_DB_CONTEXT.villaManual.wifi_pass}".`;
                }
                else {
                    // Standard conversation without tool calls
                    finalReply = `Estoy a su entera disposición, Don ${MOCK_DB_CONTEXT.guestName}. ¿Hay algo más en lo que pueda asistirle?`;
                }

                resolve({ reply: finalReply, tool: toolExecuted });
            }, 1500); // 1.5s simulated LLM latency
        });
    }

    // MAIN HANDLER
    async function handleChatSubmission() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        appendUserMessage(text);

        const typingId = appendTypingIndicator();

        // Wait for Mock /api/chat Provider
        const res = await mockApiChatRoute(text);

        removeTypingIndicator(typingId);

        // 5. UI INTERACTION (Render Confirmation Card inside chat)
        let toolHtml = null;
        if (res.tool) {
            toolHtml = `
                <div class="api-sync-card chat-element visible" style="display:flex; margin-bottom: 0.5rem; animation: bounceIn 0.5s ease;">
                    <div class="api-icon" style="background: ${res.tool.color}15;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="${res.tool.color}" stroke-width="2">
                            ${res.tool.svg}
                        </svg>
                    </div>
                    <div class="api-info">
                        <strong>${res.tool.title}</strong>
                        <span>${res.tool.desc}</span>
                    </div>
                </div>
            `;
        }

        appendAIMessage(res.reply, toolHtml);
    }

    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', handleChatSubmission);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatSubmission();
        });
    }

    // --- MOBILE HAMBURGER MENU ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-item');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
    }
});
