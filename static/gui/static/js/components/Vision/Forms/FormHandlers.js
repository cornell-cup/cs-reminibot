import axios from 'axios';
import VirtualEnviroment from '../../utils/VirtualEnviroment';
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
        alert(`Sorry, there was an issue adding your virtual object ${object["name"]}. ${error}`);
      });
    virtualEnviroment.addVirtualObject(object);
  }

}

export const handleRemoveObjectFormSubmit = (registerPhysicalObject, object, virtualEnviroment, clearForm) => {
  if (registerPhysicalObject) {
    axios
      .post("/object-mapping", {
        add: false,
        mappings: [
          object
        ],
      })
      .then(function (response) {
        alert(`The object registration with id ${object["id"]} has been removed!`);
        clearForm();
      })
      .catch(function (error) {
        alert(`Sorry, there was an issue registering the object with id ${object["id"]}.`);
      });
    virtualEnviroment.removeObjectMapping(object);
  } else {
    axios
      .post("/virtual-objects", {
        add: false,
        virtual_objects: [
          object
        ],
      })
      .then(function (response) {
        alert(`The virtual object with id ${object["id"]} has been removed!`);
        clearForm();
      })
      .catch(function (error) {
        alert(`Sorry, there was an issue removing the virtual object with id ${object["id"]}.`);
      });
    virtualEnviroment.removeVirtualObject(object);
  }

}

export function handleVirtualEnviromentImportForm(virtualEnviroment, virtualEnviromentFile, virtualRoomId, clearForm) {
  VirtualEnviroment.createEnviromentFromFile(virtualEnviromentFile).then(async importedVirtualEnviroment => {
    virtualEnviroment.virtualObjects = importedVirtualEnviroment.virtualObjects.map(
      virtualObject => {
        virtualObject["virtual_room_id"] = virtualRoomId;
        return virtualObject;
      }
    );
    virtualEnviroment.objectMappings = importedVirtualEnviroment.objectMappings.map(
      objectMapping => {
        objectMapping["virtual_room_id"] = virtualRoomId;
        return objectMapping;
      }
    );

    await virtualEnviroment.synchronizeRemoteVirtualEnviromentWithLocal(virtualRoomId);
    clearForm();
  }).catch(e => { alert(`Sorry, there was an issue importing the virtual enviroment from the given file. ${e}`); clearForm(); });
}



