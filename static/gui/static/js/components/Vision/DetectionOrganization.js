import { sortBy, isEqual, has } from "lodash"
export default class DetectionOrganization {
  constructor(detections) {
    this.setDetections = this.setDetections.bind(this);
    this.setDetections(detections);
    this.setDetectionEngineObjectMapping = this.setDetectionEngineObjectMapping.bind(this);
    this.setDetectionEngineObjectMapping({});
    this.addToDetectionEngineObjectMapping = this.addToDetectionEngineObjectMapping.bind(this);
    this.objects = [];
    this.addObject = this.addObject.bind(this);
    this.isIdInDetectionEngineObjectMapping = this.isIdInDetectionEngineObjectMapping.bind(this);
    this.getEngineObjectById = this.getEngineObjectById.bind(this);
    this.getAllEngineObjects = this.getAllEngineObjects.bind(this);
    this.getAllPhysicalEngineObjects = this.getAllPhysicalEngineObjects.bind(this);
    this.getAllVirtualEngineObjects = this.getAllVirtualEngineObjects.bind(this);
    this.getAllDetectionPhysicalEngineObjectMappings = this.getAllDetectionPhysicalEngineObjectMappings.bind(this);
    this.getAllDetectionVirtualEngineObjectMappings = this.getAllDetectionVirtualEngineObjectMappings.bind(this);
    this.from = this.from.bind(this);
  }

  from(otherDetectionOrganization) {
    this.setDetections(otherDetectionOrganization.detections);
    this.setDetectionEngineObjectMapping(otherDetectionOrganization.detectionEngineObjectMapping)
  }

  setDetections(detections) {
    this.detections = sortBy(detections, ["id"]);
    this.physicalObjects = sortBy(this.detections.filter((detection) => detection && detection["is_physical"]), ["id"]);
    this.virtualObjects = sortBy(this.detections.filter((detection) => detection && !(detection["is_physical"])), ["id"]);
  }

  addToDetectionEngineObjectMapping(id, engineObjectMapping) {
    this.detectionEngineObjectMapping[id] = engineObjectMapping;
  }

  addToDetectionEngineObjectMapping(id, engineObjectMapping) {
    this.detectionEngineObjectMapping[id] = engineObjectMapping;
  }

  setDetectionEngineObjectMapping(engineObjectMapping) {
    this.detectionEngineObjectMapping = engineObjectMapping;
  }

  isIdInDetectionEngineObjectMapping(id) {
    return has(this.detectionEngineObjectMapping, id);
  }

  getEngineObjectById(id) {
    return this.detectionEngineObjectMapping[id];
  }

  getAllEngineObjects() {

  }

  getAllPhysicalEngineObjects() {

  }

  getAllVirtualEngineObjects() {

  }

  getAllDetectionPhysicalEngineObjectMappings() {
    const allDetectionPhysicalEngineObjectMappings = {};
    for (const physicalObject of this.physicalObjects) {
      if (has(this.detectionEngineObjectMapping, physicalObject["id"]) && this.detectionEngineObjectMapping[physicalObject["id"]]) {
        allDetectionPhysicalEngineObjectMappings[physicalObject["id"]] = this.detectionEngineObjectMapping[physicalObject["id"]];
      }
    }
    return allDetectionPhysicalEngineObjectMappings;
  }

  getAllDetectionVirtualEngineObjectMappings() {
    const allDetectionVirtualEngineObjectMappings = {};
    for (const virtualObject of this.virtualObjects) {
      if (has(this.detectionEngineObjectMapping, virtualObject["id"]) && this.detectionEngineObjectMapping[virtualObject["id"]]) {
        allDetectionVirtualEngineObjectMappings[virtualObject["id"]] = this.detectionEngineObjectMapping[virtualObject["id"]];
      }
    }
    return allDetectionVirtualEngineObjectMappings;
  }


  static areDetectionsEqual(organization1, organization2) {
    return isEqual(organization1.detections, organization2.detections);
  }

  static arePhysicalObjectsEqual(organization1, organization2) {
    return isEqual(organization1.physicalObjects, organization2.physicalObjects);
  }

  static areVirtualObjectsEqual(organization1, organization2) {
    return isEqual(organization1.virtualObjects, organization2.virtualObjects);
  }
}

