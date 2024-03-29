/**
 * Clase para crear la DataTable
 * @param {object} options - Objecto de Opciones para añadir funcionalidades.
 * @param {array} dataToRender - Array con los datos a mostrar en la Tabla.
 * @param {array} dataKeys - Array con las Clave del Objeto JSON que se mostraran en la Tabla.
 * @param {number[]} [limitShowData=[10, 25, 50]] - Cantidad de datos a mostrar por Pagina.
 * @param {string} idHtmlDiv - Id del Div donde se va a mostrar la Tabla
 * @param {{ prefix: string; keys: string[]; }} [renderJsonInRow={ prefix: "", keys: [] }] - Objeto con el Prefijo que tendra el data-attribute y Array con las Claves del Objeto JSON que se mostraran en el JSON del data-attribute.
 * @param {{ key: string; value: string; }} [cellCustomAttribute=[{key:"",value:""}]] - String con el valor que tendra cada celda del data-attribute.
 * @param {String} theme Color del tema de la tabla
 * @param {Boolean} serverside True o False para cargar data de forma diferida.
 * @param {{url:String,method:String,aditionalData:[{key:String,value:String}]}} [fetch={url:"",method:"",aditionalData:[{key:"",value:""}]}] True o False para cargar data de forma diferida.
 */
export class CreateTable {
  /**
   * @type {Number} Variable que una referencia de cuantos datos mostrar por pagina. 
   */
  #dataCount = 0;
  /**
   * @type {Array} Variable multidimencional para seccionar los datos de acuerdo al valor que tenga #dataCount.
   */
  #tmpDataPaginate = [];
  /**
   * @type {Number} Variale que identifica el numero de la pagina en la que nos encontramos.
   */
  #actualPosition = 0;
  /**
   * @type {Number} Variable que identifica el numero de la position anterior de la pagina.
   */
  #prevPosition = 0;
  /**
   * @type {Number} Variale que identifica el numero de la pagina anterior.
   */
  #pagAnterior = 0;
  /**
   * @type {Number} Variale que identifica el numero de la pagina siguiente.
   */
  #pagSiguiente = 0;
  /**
   * @type {Array} Variable para los tados a renderizar.
   */
  #data = [];
  /**
   * @type {HTMLElement} Variable para almacenar el cuerpo de la tabla donde se renderizan los datos.
   */
  #idToBody;
  /**
   * @type {String} Variable para identificar el footer de la tabla.
   */
  #idToFooter = `foot${Math.ceil(Math.random() * 9999)}`;
  /**
   * @type {Boolean} Varible para identificar la forma en que se ordenan los datos.
   */
  #sortOrderAsc = false;
  /**
   * @type {Array} Variable para almecenar la llaves que se deben renderizar en la tabla.
   */
  #dataKeys = [];
  /**
   * @type {Array} Variable para identificar cuantos datos se deben mostrar.
   */
  #limitShowData = [];
  /**
   * @type {String} Variable para el id del div donde se encuentra la tabla
   */
  #idHtmlDiv = "";
  /**
   * @type {Object} Variable para identificar propiedades.
   */
  #renderJsonInRow;
  /**
   * @type {Array} Variable de JSON de atributos personalizados.
   */
  #cellCustomAttribute;
  /**
   * @type {String} Variable del tema de la tabla.
   */
  #theme;

  constructor({
    dataToRender = [],
    dataKeys = [],
    limitShowData = [10, 25, 50],
    idHtmlDiv = "",
    renderJsonInRow = { prefix: "", keys: [] },
    cellCustomAttribute = [{ key: "", value: "" }],
    theme = "",
    serverside = false,
    fetch = { url: "", method: "", aditionalData: [{ key: "", value: "" }] }
  }) {
    this.#data = dataToRender;
    this.#dataKeys = dataKeys;
    this.#limitShowData = limitShowData;
    this.#idHtmlDiv = idHtmlDiv;
    this.#cellCustomAttribute = cellCustomAttribute;
    this.#dataCount = limitShowData[0];
    this.#renderJsonInRow = renderJsonInRow;
    this.#theme = theme
    this.#initTable();
  }

  /**
   * Funcion para ordenar un objeto por letras
   * @param {string} sor clave del Objeto a utiliza
   * @returns Array oredenado
   */
  #sortBy = (sor) =>
    [...this.#tmpDataPaginate[this.#actualPosition]].sort((a, b) => {
      if (typeof a[sor] === "number" || typeof b[sor] === "number") {
        if (this.#sortOrderAsc) return b[sor] - a[sor];
        else return a[sor] - b[sor];
      } else {
        if (/[0-9\.]/.test(a[sor]) || /[0-9\.]/.test(b[sor]))
          return this.#sortByNumber(a[sor], b[sor]);
        if (this.#sortOrderAsc) return b[sor].localeCompare(a[sor]);
        else return a[sor].localeCompare(b[sor]);
      }
    });

  /**
   * Funcion para ordenar un objeto por numeros
   * @param {string} sor1 clave del Objeto a utiliza
   * @param {string} sor2 clave del Objeto a utiliza
   * @returns Array oredenado
   */
  #sortByNumber = (sor1, sor2) => {
    let a1 = sor1.replace(/\./, "");
    let b1 = sor2.replace(/\./, "");
    if (this.#sortOrderAsc) return Number(b1) - Number(a1);
    else return Number(a1) - Number(b1);
  };

  /**
   * Funcion para buscar elementos en el Array de datos
   * @param {string} find Elemento a buscar en el Array de datos
   * @returns Array con los usurios encontrados
   */
  #findItem = (find) =>
    [...this.#tmpDataPaginate[this.#actualPosition]].filter((item) => {
      for (let i = 0; i < this.#dataKeys.length; i++) {
        if (
          String(item[this.#dataKeys[i]]).toLocaleLowerCase().startsWith(find)
        )
          return item;
      }
    });

  /**
   * Funcion para dividir el Array de datos en diferentes Arrays de acuerdo a la cantidad de datos a Mostrar en la Tabla
   * @param {Object[]} dataToSplit Array de datos
   */
  #splitDataToPaginate = (dataToSplit = []) => {
    let postionPaginateArray = 0;
    let count = 0;
    this.#tmpDataPaginate = [];
    dataToSplit.forEach((user) => {
      count++;
      if (count <= this.#dataCount) {
        this.#tmpDataPaginate[postionPaginateArray]?.length
          ? this.#tmpDataPaginate[postionPaginateArray].push(user)
          : (this.#tmpDataPaginate[postionPaginateArray] = [user]);
      }
      if (count == this.#dataCount) {
        postionPaginateArray++;
        count = 0;
      }
    });
  };


  #renderTablePagination = (newposition = null) => {
    this.#pagAnterior = this.#actualPosition;
    this.#pagSiguiente = this.#actualPosition;
    this.#pagAnterior <= 0 ? (this.#pagAnterior = 0) : this.#pagAnterior--;
    this.#pagSiguiente >= this.#tmpDataPaginate.length - 1
      ? (this.#pagSiguiente = this.#tmpDataPaginate.length - 1)
      : this.#pagSiguiente++;
    let pagActual = Number(this.#actualPosition) + 1;
    pagActual > this.#pagSiguiente
      ? (pagActual = Number(this.#actualPosition) + 1)
      : "";

    let tmp = ``

    const prevBnts = (position) => {
      let btn = []
      let count = position
      if (position <= this.#tmpDataPaginate.length - 1)
        for (let i = 0; i < 3; i++) {
          count--
          if (count > 0) {
            btn.push(`<button class="datatable__footer__btn datatable__footer__btn--number ${count == this.#actualPosition ? "datatable__footer__btn--active" : ""}" type="button" data-index="${count}">${count + 1}</button>`)
          }
        }
      return btn.length > 0 ? btn.reverse().join("") : ""
    }
    const nexBnts = (position) => {
      let tmp = ``
      let count = position
      if (position >= 0)
        for (let i = 0; i < 3; i++) {
          if (count == 0)
            count++
          if (count > 0 && count < this.#tmpDataPaginate.length - 1) {
            tmp += `<button class="datatable__footer__btn datatable__footer__btn--number ${count == this.#actualPosition ? "datatable__footer__btn--active" : ""}" type="button" data-index="${count}">${count + 1}</button>`
          }
          count++
        }
      return tmp
    }

    tmp += prevBnts(this.#actualPosition)
    tmp += nexBnts(this.#actualPosition)


    return `
        <span>Pagina ${pagActual} de ${this.#tmpDataPaginate.length}</span>
        <div class="datatable__footer__btns">
          <button class="datatable__footer__btn" type="button" data-index="${0}">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 7l-5 5l5 5" /><path d="M17 7l-5 5l5 5" /></svg>
          </button>
          <button class="datatable__footer__btn" type="button" data-index="${this.#pagAnterior}">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
          </button>
          <button class="datatable__footer__btn datatable__footer__btn--number ${this.#actualPosition == 0 ? "datatable__footer__btn--active" : ""}" type="button" data-index="0">1</button>
          ${tmp}
          <button class="datatable__footer__btn datatable__footer__btn--number ${this.#actualPosition == this.#tmpDataPaginate.length - 1 ? "datatable__footer__btn--active" : ""}" type="button" data-index="${this.#tmpDataPaginate.length - 1}">${this.#tmpDataPaginate.length}</button>
          <button class="datatable__footer__btn" type="button" data-index="${this.#pagSiguiente}">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>
          </button>
          <button class="datatable__footer__btn " type="button" data-index="${this.#tmpDataPaginate.length - 1}">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7l5 5l-5 5" /><path d="M13 7l5 5l-5 5" /></svg>
          </button>
        </div>
        <span>Resultados 100</span>
      `;
  };

  #refreshTableBody = ({ data = [] }) => {
    let tmp = ``;
    let cmsAtt = "";
    if (this.#cellCustomAttribute !== "") {
      this.#cellCustomAttribute.forEach(attribute => {
        cmsAtt += `data-${attribute.key}='${attribute.value}'`;
      })
    }
    if (data.length === 0)
      tmp = `
      <tr style="padding: .2rem 0rem; display: grid;  gap:.5rem; text-align:center;">
        <td style="padding: 0rem 0.2rem;">Sin registros</td>
      </tr>
      `;
    else
      data.forEach((ele, index) => {
        if (index >= this.#dataCount) return;
        let jsonToRow = {};
        let dataAtt = "";

        if (this.#renderJsonInRow.keys.length > 0) {
          this.#renderJsonInRow.keys.forEach(
            (jsonRow) => (jsonToRow[jsonRow] = ele[jsonRow])
          );
          dataAtt = `data-${this.#renderJsonInRow.prefix}='${JSON.stringify(
            jsonToRow
          )}'`;
        }
        tmp += `
        <tr style="padding: .2rem 0rem; display: grid;
        grid-template-columns: repeat(${this.#dataKeys.length},1fr); gap:.5rem;" ${dataAtt != "" ? dataAtt : ""} ${cmsAtt != "" ? cmsAtt : ""}>
      `;
        for (const key of this.#dataKeys) {
          tmp += `<td style="padding: 0rem 0.2rem;">${ele[key]}</td>`;
        }
        tmp += `</tr>`;
      });
    return tmp
  }

  #renderTableBody = ({ data = [], newposition = null }) => {
    let tmp = this.#refreshTableBody({ data })
    if (document.getElementById(this.#idToFooter))
      document.getElementById(this.#idToFooter).innerHTML =
        this.#renderTablePagination(newposition);
    return tmp;
  };

  /**
   * Funcion para renderizar la tabla
   */
  #renderTable = () => {
    const $htmlDiv = document.getElementById(`${this.#idHtmlDiv}`);
    $htmlDiv.className = `datatable__wrapper ${this.#theme}`;

    const $buttonsArea = $htmlDiv.querySelector("[data-id=buttonsarea]");
    $buttonsArea.style = `grid-area: btnsarea;
    display: grid;
    grid-template-columns: repeat(${$buttonsArea.querySelectorAll("button").length},1fr); gap: .5rem;`;

    $buttonsArea.querySelectorAll("button").forEach((ele, index) => {
      ele.setAttribute("data-sortby", this.#dataKeys[index]);
      ele.innerHTML += ' <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrows-move-vertical" width="24" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 18l3 3l3 -3" /><path d="M12 15v6" /><path d="M15 6l-3 -3l-3 3" /><path d="M12 3v6" /></svg>';
    });

    /**
     * Creacion de Header de la tabla.
     */
    const $headerTable = document.createElement("div");
    $headerTable.className = "datatable__header";
    const $select = document.createElement("select");
    $select.className = "select__usercount";
    $select.id = "usercount";

    this.#limitShowData.forEach((ele) => {
      $select.insertAdjacentHTML(
        "beforeend",
        `<option value="${ele}">${ele}</option>`
      );
    });

    $headerTable.append($select);

    $headerTable.insertAdjacentHTML(
      "beforeend",
      `<input class="datatable__input__search" type="text" id="findItem">`
    );

    /**
     * Creacion del Footer de la tabla.
     */
    const $footerTable = document.createElement("tfoot");
    $footerTable.id = this.#idToFooter;
    $footerTable.className = "datatable__footer";
    $footerTable.innerHTML = this.#renderTablePagination();

    /**
     * Creacion del Body de la tabla.
     */
    const $bodyTable = $htmlDiv.querySelector("#data");
    this.#idToBody = $bodyTable;
    $bodyTable.insertAdjacentHTML(
      "afterbegin",
      this.#renderTableBody({ data: this.#data })
    );

    /**
     * Renderizar la Tabla
     */
    $htmlDiv.insertAdjacentElement("afterbegin", $headerTable);
    $htmlDiv.append($bodyTable);
    $htmlDiv.append($footerTable);
  };

  /**
   * Añadir Listeners al DOM
   */

  #addListeners = () => {
    document.addEventListener("click", (e) => {
      const { target } = e;

      if (target.closest("[data-sortby]")) {
        this.#idToBody.innerHTML = this.#refreshTableBody({
          data: this.#sortBy(target.closest("[data-sortby]").dataset.sortby),
        });
        this.#sortOrderAsc = !this.#sortOrderAsc;
      }

      if (target.closest("[data-index]")) {
        this.#prevPosition = this.#actualPosition
        this.#actualPosition = Number(target.closest("[data-index]").dataset.index);
        if (this.#actualPosition > this.#tmpDataPaginate.length - 1)
          this.#actualPosition = this.#tmpDataPaginate.length - 1;
        this.#idToBody.innerHTML = this.#renderTableBody({
          data: this.#tmpDataPaginate[Number(target.closest("[data-index]").dataset.index)], newposition: Number(target.closest("[data-index]").dataset.index)
        });
      }
    });

    document.addEventListener("change", (e) => {
      const { target } = e;

      if (target.matches("#usercount")) {
        this.#dataCount = target.value;
        this.#splitDataToPaginate(this.#data);
        if (this.#actualPosition > this.#tmpDataPaginate.length - 1)
          this.#actualPosition = this.#tmpDataPaginate.length - 1;
        this.#idToBody.innerHTML = this.#renderTableBody({
          data: this.#tmpDataPaginate[this.#actualPosition],
        });
      }
    });

    document.addEventListener("input", (e) => {
      const { target } = e;

      if (target.matches("#findItem")) {
        this.#idToBody.innerHTML = this.#renderTableBody({
          data: this.#findItem(target.value.toLocaleLowerCase()),
        });
      }
    });
  };

  /**
   * Quitar Listeners al DOM
   */
  #removeListeners = () => {
    document.removeEventListener("input", (e) => { });
    document.removeEventListener("change", (e) => { });
    document.removeEventListener("click", (e) => { });
  };
  /**
   * Inicio de Funciones Principales
   */
  #initTable = () => {
    this.#addListeners();
    this.#removeListeners();
    this.#splitDataToPaginate(this.#data);
    this.#renderTable();
  };

  /**
   * Funcion para reiniciar la tabla con mas datos
   * @param {Object} options Opciones para la funcion
   * @param {Array} options.data Array con los datos a cargar en la tabla.
   */
  reloadTable = ({ data = [] }) => {
    this.#data = data;
    this.#splitDataToPaginate(this.#data);
    this.#idToBody.innerHTML = null;
    this.#idToBody.insertAdjacentHTML(
      "afterbegin",
      this.#renderTableBody({ data: this.#data })
    );
  };
}
