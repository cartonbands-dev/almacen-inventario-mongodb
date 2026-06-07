# Gestión de Almacén con Control de Inventario

Mini-aplicación NoSQL desarrollada para el Proyecto Final de Bases de Datos NoSQL.

## Descripción del problema

Un almacén central distribuye productos a 30 sucursales. La solución permite controlar stock por SKU y ubicación, registrar movimientos, generar alertas de stock bajo y realizar transferencias entre ubicaciones de forma atómica.

## Stack utilizado

- Node.js
- Express
- MongoDB
- Docker Compose

## Instalación

```bash
git clone https://github.com/cartonbands-dev/almacen-inventario-mongodb.git
cd almacen-inventario-mongodb
```

## Requisitos

- Docker Desktop
- Git
- Postman o navegador para probar los endpoints
- MongoDB Compass opcional para visualizar la base de datos



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
```

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

## Ejemplo de transferencia

```json
{
  "sku": "SKU-001",
  "origen": "SUC-001",
  "destino": "SUC-002",
  "cantidad": 5
}
