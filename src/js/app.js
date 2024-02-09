import { CreateTable } from "./CreateTable.js";

let users

document.addEventListener("DOMContentLoaded", (e) => {
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
