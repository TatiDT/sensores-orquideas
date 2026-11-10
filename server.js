

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());           
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 


const CONFIG = {
  A: { nombre: 'Nave A', tempBase: 24, humBase: 60, ampTemp: 1.5, ampHum: 4, periodo: 600, fase: 0 },
  B: { nombre: 'Nave B', tempBase: 27, humBase: 50, ampTemp: 2.0, ampHum: 5, periodo: 480, fase: 1.3 },
  C: { nombre: 'Nave C', tempBase: 21, humBase: 72, ampTemp: 1.2, ampHum: 3, periodo: 720, fase: 2.6 },
};


const RIEGO_BAJA_TEMP = 6;     
const RIEGO_SUBE_HUM = 30;     
const TAU_RIEGO = 90;          


const ultimoRiego = { A: null, B: null, C: null };


const aleatorio = (rango) => (Math.random() * 2 - 1) * rango;   
const limitar = (v, min, max) => Math.min(max, Math.max(min, v));
const redondear = (v, dec = 1) => Math.round(v * 10 ** dec) / 10 ** dec;


function leerNave(id) {
  const c = CONFIG[id];
  const ahora = Date.now();
  const t = ahora / 1000;

  
  const onda = Math.sin((2 * Math.PI * t) / c.periodo + c.fase);
  let temperatura = c.tempBase + c.ampTemp * onda + aleatorio(0.3);
  let humedad = c.humBase + c.ampHum * onda * -1 + aleatorio(1); 
  if (ultimoRiego[id] !== null) {
    const seg = (ahora - ultimoRiego[id]) / 1000;
    const factor = Math.exp(-seg / TAU_RIEGO);
    temperatura -= RIEGO_BAJA_TEMP * factor;
    humedad += RIEGO_SUBE_HUM * factor;
  }

  humedad = limitar(humedad, 0, 100);

  return {
    id,
    nombre: c.nombre,
    temperatura: redondear(temperatura, 1),
    humedad: redondear(humedad, 0),
    ultimoRiego: ultimoRiego[id] === null ? null : new Date(ultimoRiego[id]).toISOString(),
  };
}


const idValido = (param) => {
  const id = String(param).toUpperCase();
  return CONFIG[id] ? id : null;
};


app.get('/api/naves', (req, res) => {
  res.json({
    hora: new Date().toISOString(),
    naves: Object.keys(CONFIG).map(leerNave),
  });
});


app.get('/api/naves/:id', (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return res.status(404).json({ ok: false, mensaje: `La nave "${req.params.id}" no existe. Usa A, B o C.` });
  res.json({ hora: new Date().toISOString(), nave: leerNave(id) });
});


app.post('/api/naves/:id/regar', (req, res) => {
  const id = idValido(req.params.id);
  if (!id) return res.status(404).json({ ok: false, mensaje: `La nave "${req.params.id}" no existe. Usa A, B o C.` });
  ultimoRiego[id] = Date.now();
  res.json({ ok: true, nave: id });
});


app.post('/api/regar-todas', (req, res) => {
  const ahora = Date.now();
  Object.keys(CONFIG).forEach((id) => { ultimoRiego[id] = ahora; });
  res.json({ ok: true, naves: Object.keys(CONFIG) });
});

app.listen(PORT, () => {
  console.log(`Sensores simulados escuchando en el puerto ${PORT}`);
});
