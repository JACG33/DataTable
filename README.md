# DataTable

__DataTable__ es un proyecto en el que una forma de como crear un DataTable sin la necesidad de usar __JQuery__.

---

Ejemplo de como implementar. En la carpeta __src__ se encuentran todos los recursos.

#### Html ejemplo
```html
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="./src/css/dataTable.css">
  <title>Document</title>
  <style>
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #333;
      }
    }

    @media (prefers-color-scheme: light) {
      body {
        background-color: #e8e8e8;
      }
    }
  </style>
</head>

<body>

  <h1>DataTable Demo</h1>

  <div >
    <table id="dataTable" class="datatable__wrapper">
      <thead>
        <tr data-id="buttonsarea">
          <th><button type="button">Nombre</button></th>
          <th><button type="button">Apellido</button></th>
          <th><button type="button">Edad</button></th>
          <th><button type="button">Id</button></th>
        </tr>
      </thead>
      <tbody id="data" class="datatable__body"></tbody>
    </table>
  </div>

  <script type="module" src="./src/js/app.js"></script>
</body>

</html>
```

#### Js ejemplo
```js
import { CreateTable } from "./CreateTable.js";

let users

document.addEventListener("DOMContentLoaded", (e) => {
  // Fake API/JSON dummyJSON (https://dummyjson.com)
  fetch("https://dummyjson.com/users?limit=100&skip=0")
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      users=res.users
      const table = new CreateTable({
        idHtmlDiv: "dataTable", dataToRender: users, dataKeys: ["firstName", "lastName", "age", "id"], theme: "dark", cellCustomAttribute:[
        {key:"l1",value:"n1"},
        {key:"l2",value:"n2"},
        {key:"l3",value:"n3"},
      ]});
    });
});

```

## Documentacion

### Parametros permitidos al crear una __DataTable__ nueva.

```js
const table = new CreateTable({
      dataToRender: users, 
      dataKeys: ["firstName", "lastName", "age", "id"], 
      idHtmlDiv: "dataTable", 
      limitShowData:[10, 25, 50],
      theme: "dark", 
      renderJsonInRow:{ 
        prefix: "json", 
        keys: ["firstName", "lastName"] 
      },
      cellCustomAttribute:[
        {key:"l1",value:"n1"},
        {key:"l2",value:"n2"},
        {key:"l3",value:"n3"},
    ]
});
```

+ __dataToRender__: __Array__ con los datos en formato __JSON__ a mostrar en la DataTable.
+ __dataKeys__: Llaves a mostrar en las tabla.
+ __idHtmlDiv__: Id de de la __\<table>__ __HTML__ donde se van arenderizar los datos.
+ __limitShowData__: __Array__ con numeros que delimitan la cantidad de datos a mostrar por "pagina".
+ __theme__: Define el tema de la tabla por defecto el vacio.
+ __renderJsonInRow__: __JSON__ con dos claves. (Este parametro esta pensado para cuando se haga click en una fila obtener un __JSON__ con diferentes datos).
  + __prefix__: Define el nombre del data-attribute ejemplo data-json.
  + __keys__: __Array__ con las claves a mostrar en el __JSON__.
+ __cellCustomAttribute__: __Array__ de __JSON__ con dos claves.
  + __key__: Define el nombre del data-attribute ejemplo data-l1.
  + __value__: Define el valor del data-attribute ejemplo data-l1="n1".