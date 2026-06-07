const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/almacenDB?replicaSet=rs0";

const client = new MongoClient(MONGO_URI);

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("almacenDB");
    console.log("Conectado a MongoDB");
  }

  return db;
}

app.get("/", async (req, res) => {
  res.json({
    mensaje: "Mini-app Gestión de Almacén con Control de Inventario",
    motor: "MongoDB",
    endpoints: [
      "GET /stock/:sku/:ubicacionId",
      "POST /transferencias",
      "GET /alertas/stock-bajo",
      "GET /movimientos/:sku"
    ]
  });
});

app.get("/stock/:sku/:ubicacionId", async (req, res) => {
  try {
    const { sku, ubicacionId } = req.params;
    const database = await connectDB();

    const stock = await database.collection("inventarios").findOne({
      sku,
      ubicacion_id: ubicacionId
    });

    if (!stock) {
      return res.status(404).json({
        mensaje: "No existe inventario para ese SKU y ubicación"
      });
    }

    res.json(stock);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error consultando stock",
      error: error.message
    });
  }
});

app.get("/alertas/stock-bajo", async (req, res) => {
  try {
    const database = await connectDB();

    const alertas = await database
      .collection("inventarios")
      .find({
        $expr: {
          $lte: ["$cantidad", "$stock_minimo"]
        }
      })
      .sort({ cantidad: 1 })
      .toArray();

    res.json({
      total_alertas: alertas.length,
      alertas
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error generando alertas de stock bajo",
      error: error.message
    });
  }
});

app.get("/movimientos/:sku", async (req, res) => {
  try {
    const { sku } = req.params;
    const database = await connectDB();

    const movimientos = await database
      .collection("movimientos")
      .find({ sku })
      .sort({ fecha: -1 })
      .limit(20)
      .toArray();

    res.json({
      sku,
      total: movimientos.length,
      movimientos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error consultando movimientos",
      error: error.message
    });
  }
});

app.post("/transferencias", async (req, res) => {
  const { sku, origen, destino, cantidad } = req.body;

  if (!sku || !origen || !destino || !cantidad) {
    return res.status(400).json({
      mensaje: "Debe enviar sku, origen, destino y cantidad"
    });
  }

  if (origen === destino) {
    return res.status(400).json({
      mensaje: "La ubicación origen y destino no pueden ser iguales"
    });
  }

  if (cantidad <= 0) {
    return res.status(400).json({
      mensaje: "La cantidad debe ser mayor que cero"
    });
  }

  const session = client.startSession();

  try {
    const database = await connectDB();

    let movimientoRegistrado = null;

    await session.withTransaction(async () => {
      const inventarios = database.collection("inventarios");
      const movimientos = database.collection("movimientos");

      const stockOrigen = await inventarios.findOne(
        {
          sku,
          ubicacion_id: origen
        },
        { session }
      );

      if (!stockOrigen) {
        throw new Error("No existe inventario en la ubicación origen");
      }

      if (stockOrigen.cantidad < cantidad) {
        throw new Error("Stock insuficiente en la ubicación origen");
      }

      const stockDestino = await inventarios.findOne(
        {
          sku,
          ubicacion_id: destino
        },
        { session }
      );

      if (!stockDestino) {
        throw new Error("No existe inventario en la ubicación destino");
      }

      await inventarios.updateOne(
        {
          sku,
          ubicacion_id: origen
        },
        {
          $inc: { cantidad: -cantidad },
          $set: { actualizado_en: new Date() }
        },
        { session }
      );

      await inventarios.updateOne(
        {
          sku,
          ubicacion_id: destino
        },
        {
          $inc: { cantidad: cantidad },
          $set: { actualizado_en: new Date() }
        },
        { session }
      );

      movimientoRegistrado = {
        tipo: "transferencia",
        sku,
        origen,
        destino,
        cantidad,
        fecha: new Date(),
        observacion: `Transferencia de ${cantidad} unidades de ${origen} hacia ${destino}`
      };

      await movimientos.insertOne(movimientoRegistrado, { session });
    });

    res.json({
      mensaje: "Transferencia realizada correctamente",
      transferencia: movimientoRegistrado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "No se pudo realizar la transferencia",
      error: error.message
    });
  } finally {
    await session.endSession();
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al iniciar la aplicación:", error);
  });