import axios from 'axios';
export const handleAddObjectFormSubmit = (registerPhysicalObject, object, virtualEnviroment, clearForm, x, y, orientation) => {
  if (registerPhysicalObject) {
    axios
      .post("/object-mapping", {
        add: true,
        mappings: [
          object
        ],
      })
      .then(function (response) {
        alert(`Your object registration ${object["name"]} has been added!`);
        clearForm();
      })
      .catch(function (error) {
        alert(`Sorry, there was an issue registering your object ${object["name"]}.`);
      });
    virtualEnviroment.addObjectMapping(object);
  } else {
    object["x"] = x;
    object["y"] = y;
    object["orientation"] = orientation;
    axios
      .post("/virtual-objects", {
        add: true,
        virtual_objects: [
          object
        ],
      })
      .then(function (response) {
        alert(`Your virtual object ${object["name"]} has been added!`);
        clearForm();
      })
      .catch(function (error) {
        alert(`Sorry, there was an issue adding your virtual object ${object["name"]}.`);
      });
    virtualEnviroment.addVirtualObject(object);
  }

  console.log(virtualEnviroment)
}