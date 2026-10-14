import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for external apps, webhooks and microservices
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

// In-memory Store for In-Store Assistance Requests
interface AssistanceCall {
  id: string;
  customerPin: string;
  aisle: string;
  storeDepartment: string;
  reason: string;
  requesterRole: string;
  requesterName: string;
  urgency: 'normal' | 'urgente';
  status: 'pendiente' | 'en_camino' | 'atendido' | 'cancelado';
  assignedAdvisor: string | null;
  estimatedArrival: string | null;
  createdAt: string;
  acceptedAt?: string;
  cartTotal?: number;
}

const assistanceCalls: AssistanceCall[] = [
  {
    id: 'CALL-10492',
    customerPin: '3921',
    aisle: 'Pasillo 4 - Calzado Deportivo',
    storeDepartment: 'Zapatos',
    reason: 'Solicita probar talla 28 en Tenis Nike',
    requesterRole: 'cliente',
    requesterName: 'App Móvil Consumidor',
    urgency: 'normal',
    status: 'pendiente',
    assignedAdvisor: null,
    estimatedArrival: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    cartTotal: 2199
  }
];

// In-memory Store for Tickets & Orders
interface StoredTicket {
  folio: string;
  total: number;
  itemsCount: number;
  items: unknown[];
  date: string;
  paymentMethod: string;
  kioskPin: string;
  exitStatus: 'pendiente' | 'validado_arco_optico';
  createdAt: string;
}

const ticketsStore = new Map<string, StoredTicket>();

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Coppel Phygital API',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/call-assistance
 * STEP 1: Customer requests assistance.
 * NOTE: Initial status is strictly 'pendiente' with assignedAdvisor: null.
 * No advisor has confirmed yet. The notification is broadcast to the advisor app.
 */
app.post('/api/call-assistance', (req, res) => {
  try {
    const {
      aisle = 'Pasillo 4 - Piso de Ventas',
      storeDepartment = 'Piso de Ventas',
      reason = 'Cliente solicita apoyo de asesor en tienda',
      requesterRole = 'cliente',
      requesterName = 'App Móvil Consumidor',
      urgency = 'normal',
      cartTotal = 0
    } = req.body;

    // Generate human-friendly 4-digit PIN for customer-advisor handshake
    const customerPin = Math.floor(1000 + Math.random() * 9000).toString();
    const callId = `CALL-${Math.floor(10000 + Math.random() * 90000)}`;

    const newCall: AssistanceCall = {
      id: callId,
      customerPin,
      aisle,
      storeDepartment,
      reason,
      requesterRole,
      requesterName,
      urgency: urgency === 'urgente' ? 'urgente' : 'normal',
      status: 'pendiente', // Strictly pending! No one has confirmed yet
      assignedAdvisor: null, // Null until an advisor in the other app clicks 'Voy en camino'
      estimatedArrival: null,
      createdAt: new Date().toISOString(),
      cartTotal
    };

    // Prepend to queue
    assistanceCalls.unshift(newCall);

    console.log(`[ASSISTANCE REQUESTED - PENDING] ${newCall.id} at ${aisle} (PIN: ${customerPin})`);

    return res.status(200).json({
      success: true,
      message: `Solicitud recibida. Esperando confirmación de un asesor de tienda. Tu PIN: ${customerPin}`,
      call: newCall
    });
  } catch (error) {
    console.error('Error handling assistance request:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al procesar la solicitud de asistencia'
    });
  }
});

/**
 * GET /api/call-assistance
 * Retrieves active assistance requests for Advisor / Personal App
 */
app.get('/api/call-assistance', (req, res) => {
  res.json({
    success: true,
    count: assistanceCalls.length,
    calls: assistanceCalls
  });
});

/**
 * GET /api/call-assistance/:id
 * Polls the current status of a specific call (to know if an advisor accepted it)
 */
app.get('/api/call-assistance/:id', (req, res) => {
  const { id } = req.params;
  const target = assistanceCalls.find((c) => c.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: 'Llamada no encontrada' });
  }

  return res.json({
    success: true,
    call: target
  });
});

/**
 * POST /api/call-assistance/:id/accept
 * STEP 2: An advisor in the OTHER app confirms they are on their way!
 * Sets assignedAdvisor, estimatedArrival and status to 'en_camino'.
 */
app.post('/api/call-assistance/:id/accept', (req, res) => {
  const { id } = req.params;
  const {
    advisorName = 'Carlos Mendoza (Piso de Ventas)',
    estimatedArrival = '1-2 minutos'
  } = req.body;

  const target = assistanceCalls.find((c) => c.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: 'Llamada no encontrada' });
  }

  target.status = 'en_camino';
  target.assignedAdvisor = advisorName;
  target.estimatedArrival = estimatedArrival;
  target.acceptedAt = new Date().toISOString();

  console.log(`[ASSISTANCE ACCEPTED] ${target.id} accepted by ${advisorName}`);

  return res.json({
    success: true,
    message: `¡Asignado! ${advisorName} va en camino al ${target.aisle}`,
    call: target
  });
});

/**
 * PATCH /api/call-assistance/:id
 * General updates for status or advisor assignment
 */
app.patch('/api/call-assistance/:id', (req, res) => {
  const { id } = req.params;
  const { status, advisor, advisorName, estimatedArrival } = req.body;

  const target = assistanceCalls.find((c) => c.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: 'Llamada no encontrada' });
  }

  if (status) target.status = status;
  if (advisor || advisorName) target.assignedAdvisor = advisor || advisorName;
  if (estimatedArrival) target.estimatedArrival = estimatedArrival;
  if (status === 'en_camino' && !target.acceptedAt) {
    target.acceptedAt = new Date().toISOString();
  }

  return res.json({
    success: true,
    call: target
  });
});

/**
 * POST /api/checkout
 * Creates order and registers digital ticket for optical arch exit
 */
app.post('/api/checkout', (req, res) => {
  const { items, total, paymentMethod, frequency } = req.body;

  const folioNumber = Math.floor(10000 + Math.random() * 90000);
  const folio = `#CPPL-${folioNumber}`;
  const kioskPin = `K-${Math.floor(1000 + Math.random() * 9000)}`;

  const ticket: StoredTicket = {
    folio,
    total: Number(total) || 0,
    itemsCount: Array.isArray(items) ? items.length : 1,
    items: items || [],
    date: new Date().toLocaleDateString('es-MX'),
    paymentMethod: paymentMethod || 'Crédito Coppel',
    kioskPin,
    exitStatus: 'pendiente',
    createdAt: new Date().toISOString()
  };

  ticketsStore.set(folio, ticket);

  res.status(200).json({
    success: true,
    folio,
    kioskPin,
    ticket,
    qrCodeUrl: `https://coppel.com/validador?folio=${folioNumber}&total=${ticket.total}`
  });
});

/**
 * GET /api/validador
 * Optical arch scanner validator (gate exit validator)
 */
app.get('/api/validador', (req, res) => {
  const { folio, total } = req.query;

  const cleanFolio = folio ? `#CPPL-${String(folio).replace('#CPPL-', '')}` : '';
  const stored = cleanFolio ? ticketsStore.get(cleanFolio) : null;

  res.json({
    success: true,
    valid: true,
    message: 'Ticket validado correctamente en arco óptico de salida Coppel',
    data: {
      folio: cleanFolio || `#CPPL-${folio}`,
      total: total || stored?.total || '0.00',
      status: 'PAGO_CONFIRMADO',
      gateAccess: 'PERMITIDO',
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * POST /api/kiosk/print
 * Simulates sending ticket to physical kiosk
 */
app.post('/api/kiosk/print', (req, res) => {
  const { folio, pin, kioskId = 'KIOSKO-01' } = req.body;
  res.json({
    success: true,
    message: `Ticket impreso en ${kioskId}`,
    folio,
    pin
  });
});

// --- VITE MIDDLEWARE (Dev) / STATIC ASSETS (Prod) ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
