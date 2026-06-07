# Gestión de Almacén con Control de Inventario

Mini-aplicación NoSQL desarrollada para el Proyecto Final de Bases de Datos NoSQL.

## Descripción del problema

Un almacén central distribuye productos a 30 sucursales. La solución permite controlar stock por SKU y ubicación, registrar movimientos, generar alertas de stock bajo y realizar transferencias entre ubicaciones de forma atómica.

## Stack utilizado

- Node.js
- Express
- MongoDB
- Docker Compose

## Comandos para ejecutar

```bash
docker compose up --build
GET http://localhost:3000/
GET http://localhost:3000/stock/SKU-001/SUC-001
GET http://localhost:3000/alertas/stock-bajo
GET http://localhost:3000/movimientos/SKU-001
POST http://localhost:3000/transferencias

{
  "sku": "SKU-001",
  "origen": "SUC-001",
  "destino": "SUC-002",
  "cantidad": 5
}

docker compose exec app npm run seed

## Cargar datos semilla

Después de levantar el proyecto, abrir otra terminal y ejecutar:

```bash
docker compose exec app npm run seed


---

## 2. Falta explicar los endpoints en una tabla

Ahora los tienes en bloque, pero sería mejor ponerlos así:

```md
## Endpoints disponibles

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/` | Verifica que la API esté funcionando |
| GET | `/stock/SKU-001/SUC-001` | Consulta el stock de un producto en una ubicación |
| GET | `/alertas/stock-bajo` | Muestra productos con stock bajo |
| GET | `/movimientos/SKU-001` | Muestra el histórico de movimientos de un SKU |
| POST | `/transferencias` | Realiza una transferencia entre ubicaciones |

## Arquitectura

```text
Cliente / Postman
        ↓
API REST con Node.js + Express
        ↓
MongoDB
        ↓
Colecciones:
- productos
- ubicaciones
- inventarios
- movimientos


---

## 4. Falta explicar las colecciones

Agrega una sección así:

```md
## Colecciones principales

- `productos`: almacena los productos con su SKU, descripción, categoría y unidad de medida.
- `ubicaciones`: almacena las sucursales y el almacén central.
- `inventarios`: almacena el stock actual por SKU y ubicación.
- `movimientos`: almacena el histórico de entradas, salidas, ajustes y transferencias.

## Transferencias atómicas

El endpoint `/transferencias` utiliza transacciones multi-documento de MongoDB. Esto garantiza que al transferir productos entre ubicaciones se realicen tres operaciones como una sola unidad:

1. Descontar stock de la ubicación origen.
2. Sumar stock en la ubicación destino.
3. Registrar el movimiento histórico.

Si alguna operación falla, la transferencia completa se cancela.

