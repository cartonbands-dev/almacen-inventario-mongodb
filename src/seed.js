const { MongoClient } = require("mongodb");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/almacenDB?replicaSet=rs0";

const client = new MongoClient(MONGO_URI);

async function seed() {
  try {
    await client.connect();

    const db = client.db("almacenDB");

    await db.collection("productos").deleteMany({});
    await db.collection("ubicaciones").deleteMany({});
    await db.collection("inventarios").deleteMany({});
    await db.collection("movimientos").deleteMany({});

    const productos = [];

    for (let i = 1; i <= 40; i++) {
      productos.push({
        sku: `SKU-${String(i).padStart(3, "0")}`,
        descripcion: `Producto logístico ${i}`,
        categoria: i % 2 === 0 ? "Tecnología" : "Oficina",
        unidad_medida: "unidad",
        activo: true
      });
    }

    const ubicaciones = [];

    for (let i = 1; i <= 30; i++) {
      ubicaciones.push({
        ubicacion_id: `SUC-${String(i).padStart(3, "0")}`,
        nombre: i === 1 ? "Almacén Central" : `Sucursal ${i}`,
        tipo: i === 1 ? "almacen_central" : "sucursal",
        ciudad: i <= 10 ? "Santo Domingo" : i <= 20 ? "Santiago" : "La Romana",
        activa: true
      });
    }

    const inventarios = [];

    for (const producto of productos) {
      for (const ubicacion of ubicaciones) {
        inventarios.push({
          sku: producto.sku,
          ubicacion_id: ubicacion.ubicacion_id,
          descripcion_producto: producto.descripcion,
          nombre_ubicacion: ubicacion.nombre,
          cantidad: Math.floor(Math.random() * 80) + 20,
          stock_minimo: 25,
          actualizado_en: new Date()
        });
      }
    }

    const movimientos = [];

    for (let i = 1; i <= 50; i++) {
      const producto = productos[i % productos.length];
      const ubicacion = ubicaciones[i % ubicaciones.length];

      movimientos.push({
        tipo: i % 2 === 0 ? "entrada" : "salida",
        sku: producto.sku,
        origen: i % 2 === 0 ? null : ubicacion.ubicacion_id,
        destino: i % 2 === 0 ? ubicacion.ubicacion_id : null,
        cantidad: Math.floor(Math.random() * 20) + 1,
        fecha: new Date(),
        observacion: `Movimiento inicial ${i}`
      });
    }

    await db.collection("productos").insertMany(productos);
    await db.collection("ubicaciones").insertMany(ubicaciones);
    await db.collection("inventarios").insertMany(inventarios);
    await db.collection("movimientos").insertMany(movimientos);

    await db.collection("inventarios").createIndex(
      { sku: 1, ubicacion_id: 1 },
      { unique: true }
    );

    await db.collection("movimientos").createIndex(
      { sku: 1, fecha: -1 }
    );

    console.log("Datos semilla cargados correctamente.");
    console.log(`Productos: ${productos.length}`);
    console.log(`Ubicaciones: ${ubicaciones.length}`);
    console.log(`Inventarios: ${inventarios.length}`);
    console.log(`Movimientos: ${movimientos.length}`);
    console.log("Total de documentos:", productos.length + ubicaciones.length + inventarios.length + movimientos.length);
  } catch (error) {
    console.error("Error cargando datos semilla:", error);
  } finally {
    await client.close();
  }
}

seed();