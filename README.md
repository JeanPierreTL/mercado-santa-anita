# Mercado Mayorista de Santa Anita - Prototipo funcional

Prototipo de evidencia de las 4 epicas del Product Backlog (MER-1 a MER-4, 13 historias de usuario).
Funciona sin servidor: abre `index.html` con doble clic en cualquier navegador moderno.
Los datos son simulados y se guardan solo en el navegador (localStorage).
En la pantalla de ingreso hay un boton para restablecer los datos de ejemplo.

## Estructura (modelo - vista - controlador)

```
mercado-santa-anita/
├── index.html                       Pagina unica; carga los scripts en orden
├── css/
│   └── styles.css                   Estilos
└── js/
    ├── utils.js                     Utilidades y espacio de nombres (MER)
    ├── model/                       MODELO
    │   ├── seed.js                  Datos de ejemplo (simula la base de datos)
    │   └── store.js                 Almacen (localStorage), consultas, auditoria y bitacora
    ├── controllers/                 CONTROLADORES (una carpeta de logica por epica)
    │   ├── authController.js        Ingreso por rol y control de acceso (error 403)
    │   ├── formalizacionController.js   MER-1: HU-01, HU-02, HU-03
    │   ├── comercioController.js        MER-2: HU-04, HU-05, HU-06
    │   ├── logisticaController.js       MER-3: HU-08, HU-09
    │   └── estibajeController.js        MER-4: HU-11, HU-12, HU-13
    ├── views/                       VISTAS (pantallas por rol)
    │   ├── ui.js                    Componentes: tablas, tarjetas, barras, avisos, QR
    │   ├── shared.js                Bloques compartidos entre roles
    │   ├── loginView.js             Pantalla de ingreso
    │   ├── adminViews.js            Administrador
    │   ├── comercianteViews.js      Comerciante
    │   ├── compradorViews.js        Comprador
    │   ├── transportistaViews.js    Transportista
    │   └── seguridadViews.js        Seguridad (puerta)
    ├── router.js                    Que ve cada rol (menu) y dibujo de la pantalla
    └── app.js                       Arranque y eventos
```

## Que ve cada rol

| Rol | Pantallas |
|---|---|
| Administrador | Inicio (indicadores), Comerciantes, Puestos, Tarifas, Vehiculos y andenes, Estibaje, Denuncias, Ventas y precios, Auditoria |
| Comerciante | Inicio, Mis tarifas, Mis productos, Pedidos recibidos, Mis ventas, Estibaje, Denunciar |
| Comprador | Inicio, Catalogo, Mis pedidos, Mis comprobantes |
| Transportista | Inicio, Mis citas, Estibaje |
| Seguridad | Inicio, Control de ingreso, Andenes y bitacora |

Cada rol solo ve el menu de su funcion. Ademas, cada accion de los controladores
verifica el rol (`Auth.require`) y devuelve error 403 si no corresponde.

## Historias de usuario cubiertas

| Epica | Historia | Donde |
|---|---|---|
| MER-1 | HU-01 Registro de comerciante | Pantalla de ingreso > "Registrar mi negocio"; el administrador valida en Comerciantes |
| MER-1 | HU-02 Asignacion de puestos | Administrador > Puestos |
| MER-1 | HU-03 Pago de tarifas | Comerciante > Mis tarifas |
| MER-2 | HU-04 Publicar oferta | Comerciante > Mis productos |
| MER-2 | HU-05 Pedido anticipado | Comprador > Catalogo |
| MER-2 | HU-06 Comprobante de venta | Comerciante > Pedidos recibidos (confirmar); Comprador > Mis comprobantes |
| MER-2 | HU-07 Precios del dia | Catalogo, Mis ventas, Ventas y precios |
| MER-3 | HU-08 Cita de descarga con QR | Transportista > Mis citas |
| MER-3 | HU-09 Control de ingreso y salida | Seguridad > Control de ingreso |
| MER-3 | HU-10 Panel de andenes | Seguridad > Andenes y bitacora; Administrador > Vehiculos y andenes |
| MER-4 | HU-11 Registro de estibadores | Administrador > Estibaje |
| MER-4 | HU-12 Estibaje con tarifa oficial | Comerciante o Transportista > Estibaje |
| MER-4 | HU-13 Denuncia de cobros indebidos | Comerciante > Denunciar; Administrador > Denuncias |

## Datos para probar

- Codigos de cita: `CITA-0001` (vigente), `CITA-0000` (QR vencido).
- Tarifa vencida de ejemplo: comerciante "Tuberculos Andinos".
- Un estibador esta inhabilitado (EST-003) y no se le asigna trabajo.

## Limitaciones

- No hay backend ni base de datos reales: es el prototipo de la capa de presentacion.
- El QR es un dibujo simulado, no un QR real.
- No hay inicio de sesion con contrasena: se elige el rol para la demostracion.
