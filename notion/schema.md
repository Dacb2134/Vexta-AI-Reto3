# Notion — Estructura exacta de las 3 bases de datos

## DB 1: Pólizas del Paciente

| Campo                  | Tipo Notion   | Valores                                               |
|------------------------|---------------|-------------------------------------------------------|
| ID Póliza              | Title         | POL-2024-001                                          |
| Nombre paciente        | Rich Text     | Ana Torres                                            |
| Cédula                 | Rich Text     | 1712345678                                            |
| Plan                   | Select        | Básico / Estándar / Premium Gold                      |
| Coberturas activas     | Multi-select  | Medicina General, Cardiología, Traumatología...       |
| Copago consulta ($)    | Number        | 25                                                    |
| Copago especialista ($)| Number        | 45                                                    |
| Copago emergencia ($)  | Number        | 100                                                   |
| Deducible anual ($)    | Number        | 0                                                     |
| Límite anual ($)       | Number        | 80000                                                 |
| Estado                 | Select        | Activa / Suspendida / Vencida                         |
| Aseguradora            | Select        | Aseguradora del Sur / Seguros Sucre / AIG Ecuador     |

## DB 2: Hospitales

| Campo                  | Tipo Notion   | Valores                                               |
|------------------------|---------------|-------------------------------------------------------|
| Nombre                 | Title         | Hospital Metropolitano                                |
| Ciudad                 | Select        | Quito / Guayaquil / Cuenca                            |
| Especialidades         | Multi-select  | Cardiología, Traumatología, Ginecología...            |
| Planes aceptados       | Multi-select  | Básico / Estándar / Premium Gold                      |
| Costo consulta ($)     | Number        | 60                                                    |
| Costo especialista ($) | Number        | 90                                                    |
| Dirección              | Rich Text     | Av. Mariana de Jesús y Nuño de Valderrama             |
| Teléfono               | Rich Text     | (02) 399-8000                                         |
| Calificación           | Number        | 4.8                                                   |

## DB 3: Historial de Consultas (se llena automáticamente)

| Campo                  | Tipo Notion   | Descripción                                           |
|------------------------|---------------|-------------------------------------------------------|
| ID Consulta            | Title         | CONS-20240521143200 (autogenerado)                    |
| ID Póliza              | Rich Text     | POL-2024-001                                          |
| Síntoma ingresado      | Rich Text     | Texto que escribió el paciente                        |
| Especialidad sugerida  | Select        | Cardiología / Traumatología / etc.                    |
| Hospital recomendado   | Rich Text     | Hospital Metropolitano                                |
| Copago calculado ($)   | Number        | 45                                                    |
| Respuesta completa     | Rich Text     | Respuesta del agente (primeros 2000 caracteres)       |
| Fecha consulta         | Date          | 2024-05-21T14:32:00                                   |

## Cómo obtener los IDs de Notion

1. Abrir la base de datos en Notion (vista tabla)
2. Clic en ··· → "Copy link to view"
3. La URL: https://notion.so/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?v=...
4. El ID son los 32 caracteres antes del ?
5. Pegar en .env como NOTION_POLICIES_DB_ID, etc.
