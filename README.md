# Sensores simulados – Cultivo de orquídeas

API en Node.js + Express que **simula** sensores de temperatura y humedad de 3 naves (A, B, C).
Incluye un panel HTML en `/` para verlos y regar.

## Ejecutar en local

```bash
npm install
npm start
```

Abre http://localhost:3000 (o usa el puerto de la variable `PORT`).

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/naves` | Lecturas de las 3 naves |
| GET | `/api/naves/:id` | Lectura de una nave (A, B o C); 404 si no existe |
| POST | `/api/naves/:id/regar` | Riega una nave → `{ "ok": true, "nave": "A" }` |
| POST | `/api/regar-todas` | Riega las 3 naves |

Desde React: `fetch('https://TU-SERVICIO.onrender.com/api/naves')` (CORS habilitado).

## Valores de referencia

Bases elegidas según rangos habituales en invernaderos de orquídeas (referenciales, no medidos):

- **Nave A** (24 °C / 60 %): tipo *Phalaenopsis*, rango típico 22–28 °C, 50–70 %.
- **Nave B** (27 °C / 50 %): tipo *Cattleya/Dendrobium*, cálida y seca, 25–30 °C, 40–60 %.
- **Nave C** (21 °C / 72 %): tipo *Cymbidium/Masdevallia*, fresca y húmeda, 18–24 °C, 65–80 %.

Al regar, la temperatura baja 6 °C y la humedad sube 30 puntos; luego vuelven a la normalidad con
decaimiento exponencial (constante ~90 s). El estado de riego se guarda en memoria y se pierde al reiniciar.

## Desplegar en Render

1. Sube esta carpeta a un repositorio de GitHub.
2. En Render: **New → Web Service** y conecta el repositorio.
3. Configura: *Runtime* Node, *Build Command* `npm install`, *Start Command* `npm start`.
4. Despliega. Render define `PORT` automáticamente.

Nota: en el plan gratuito el servicio se "duerme" tras inactividad y la primera petición tarda unos segundos.
