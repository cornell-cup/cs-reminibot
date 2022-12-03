import axios from 'axios';
import { readFileAsText, removeByPropertyValue, removeByPropertyValues } from './helperFunctions';

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

		this.synchronizeRemoteVirtualEnviromentWithLocal = this.synchronizeRemoteVirtualEnviromentWithLocal.bind(this);
	}

	static async createEnviromentFromFile(file) {
		const text = await readFileAsText(file);
		const { virtualObjects, objectMappings } = JSON.parse(text);
		return new VirtualEnviroment(virtualObjects, objectMappings);
	}

	removeVirtualObjectById(virtualObjectId) {
		this.virtualObjects = removeByPropertyValue(this.virtualObjects, 'id', virtualObjectId);
	}

	removeVirtualObjectsByIds(virtualObjectIds) {
		this.virtualObjects = removeByPropertyValues(this.virtualObjects, 'id', virtualObjectIds);
	}

	removeVirtualObject(virtualObject) {
		this.removeVirtualObjectById(virtualObject['id']);
	}

	removeVirtualObjects(virtualObjects) {
		const virtualObjectIds = virtualObjects.map((virtualObject) => virtualObject['id']);
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
		this.objectMappings = removeByPropertyValue(this.objectMappings, 'id', objectMappingId);
	}

	removeObjectMappingsByIds(objectMappingIds) {
		this.objectMappings = removeByPropertyValues(this.objectMappings, 'id', objectMappingIds);
	}

	removeObjectMapping(objectMapping) {
		this.removeObjectMappingById(objectMapping['id']);
	}

	removeObjectMappings(objectMappings) {
		const objectMappingsIds = objectMappings.map((objectMapping) => objectMapping['id']);
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
		return {
			virtualObjects: this.virtualObjects.map((virtualObject) => {
				virtualObject['virtual_room_id'] = undefined;
				return virtualObject;
			}),
			objectMappings: this.objectMappings.map((objectMapping) => {
				objectMapping['virtual_room_id'] = undefined;
				return objectMapping;
			})
		};
	}

	getJSONString() {
		return JSON.stringify(this.getJSON());
	}

	getDownloadableFileHref() {
		let blob = new Blob([this.getJSONString()], { type: 'application/json' });
		let url = window.URL.createObjectURL(blob);
		return url;
	}

	async synchronizeRemoteVirtualEnviromentWithLocal(virtualRoomId) {
		await axios.post('/delete_virtual_room', { virtual_room_id: virtualRoomId });

		try {
			await axios.post('/object-mapping', { add: true, mappings: this.objectMappings });
			await axios.post('/virtual-objects', { add: true, virtual_objects: this.virtualObjects });
			alert(`Your virtual enviroment has been imported successfully!`);
		} catch (e) {
			alert(`Sorry, there was an issue importing the virtual enviroment from the given file. ${e}`);
		}
	}
}
