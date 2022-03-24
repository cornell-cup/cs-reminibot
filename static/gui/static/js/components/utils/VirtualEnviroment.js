import { readFileAsText, removeByPropertyValue, removeByPropertyValues } from "./helperFunctions";

export default class VirtualEnviroment {

  constructor(virtualObjects, objectMappings) {
    this.virtualObjects = virtualObjects;
    this.objectMappings = objectMappings;

    this.removeVirtualObjectById = this.removeVirtualObjectById.bind(this);
    this.removeVirtualObjectsByIds = this.removeVirtualObjectsByIds.bind(this);
    this.removeVirtualObject = this.removeVirtualObject.bind(this);
    this.removeVirtualObjects = this.removeVirtualObjects.bind(this);
    this.addVirtualObject = this.addVirtualObject.bind(this);
    this.addVirtualObjects = this.addVirtualObjects.bind(this);

    this.removeObjectMappingById = this.removeObjectMappingById.bind(this);
    this.removeObjectMappingsByIds = this.removeObjectMappingsByIds.bind(this);
    this.removeObjectMapping = this.removeObjectMapping.bind(this);
    this.removeObjectMappings = this.removeObjectMappings.bind(this);
    this.addObjectMapping = this.addObjectMapping.bind(this);
    this.addObjectMappings = this.addObjectMappings.bind(this);

    this.getJSON = this.getJSON.bind(this);
    this.getJSONString = this.getJSONString.bind(this);
    this.getDownloadableFileHref = this.getDownloadableFileHref.bind(this);
  }

  static async createEnviromentFromFile(file) {
    const text = await readFileAsText(file);
    const { virtualObjects, objectMappings } = JSON.parse(text)
    return new VirtualEnviroment(virtualObjects, objectMappings);
  }

  removeVirtualObjectById(virtualObjectId) {
    this.virtualObjects = removeByPropertyValue(this.virtualObjects, "id", virtualObjectId);
  }

  removeVirtualObjectsByIds(virtualObjectIds) {
    this.virtualObjects = removeByPropertyValues(this.virtualObjects, "id", virtualObjectIds);
  }

  removeVirtualObject(virtualObject) {
    this.removeVirtualObjectById(virtualObject["id"]);
  }

  removeVirtualObjects(virtualObjects) {
    const virtualObjectIds = virtualObjects.map(virtualObject => virtualObject["id"]);
    this.removeVirtualObjectsByIds(virtualObjectIds);
  }

  addVirtualObject(virtualObject) {
    this.removeVirtualObject(virtualObject);
    this.virtualObjects.push(virtualObject);
  }

  addVirtualObjects(virtualObjects) {
    this.removeVirtualObjects(virtualObjects);
    this.virtualObjects = this.virtualObjects.concat(virtualObjects);
  }




  removeObjectMappingById(objectMappingId) {
    this.objectMappings = removeByPropertyValue(this.objectMappings, "id", objectMappingId);
  }

  removeObjectMappingsByIds(objectMappingIds) {
    this.objectMappings = removeByPropertyValues(this.objectMappings, "id", objectMappingIds);
  }

  removeObjectMapping(objectMapping) {
    this.removeObjectMappingById(objectMapping["id"]);
  }

  removeObjectMappings(objectMappings) {
    const objectMappingsIds = objectMappings.map(objectMapping => objectMapping["id"]);
    this.removeVirtualObjectsByIds(objectMappingsIds);
  }

  addObjectMapping(objectMapping) {
    this.removeObjectMapping(objectMapping);
    this.objectMapping.push(objectMapping);
  }

  addObjectMappings(objectMappings) {
    this.removeObjectMappings(objectMappings);
    this.objectMappings = this.objectMappings.concat(objectMappings);
  }

  getJSON() {
    return ({
      virtualObjects: this.virtualObjects,
      objectMappings: this.objectMappings
    });
  }

  getJSONString() {
    return JSON.stringify(this.getJSON());
  }

  getDownloadableFileHref() {
    return 'data:text/plain;charset=utf-8,' + this.getJSONString();
  }

}