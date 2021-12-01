class World {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.lights = [];

        this.meshToObject = new Map();
    }

    getObjectOfMesh(mesh) {
        return this.meshToObject.get(mesh.id);
    }

    instantiateObject(object) {
        this.scene.add(object.mesh);
        this.objects.push(object);

        this.meshToObject.set(object.mesh.id, object);
    }

    deleteObject(object) {
        const indexOf = this.objects.indexOf(object);
        if (indexOf != -1) {
            this.objects.splice(indexOf, 1);
        }

        this.scene.remove(object.mesh);

        this.meshToObject.delete(object.mesh.id);
    }

    instantiateLight(light) {
        this.scene.add(light);
        this.lights.push(light);
    }

    deleteLight(object) {
        const indexOf = this.lights.indexOf(object);
        if (indexOf != -1) {
            this.lights.splice(indexOf, 1);
        }
        this.scene.remove(object);
    }

    update() {
        this.objects.forEach((x) => { x.update(); });
    }
}