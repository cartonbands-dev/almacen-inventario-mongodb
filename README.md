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

docker compose up --build

## Cargar datos semilla

docker compose exec app npm run seed

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

## Colecciones principales

- `productos`: almacena los productos con su SKU, descripción, categoría y unidad de medida.
- `ubicaciones`: almacena las sucursales y el almacén central.
- `inventarios`: almacena el stock actual por SKU y ubicación.
- `movimientos`: almacena el histórico de entradas, salidas, ajustes y transferencias.

## Transferencias atómicas

El endpoint `/transferencias`:

1. Descontar stock de la ubicación origen.
2. Sumar stock en la ubicación destino.
3. Registrar el movimiento histórico.


