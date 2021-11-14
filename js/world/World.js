class World {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.lights = [];
    }

    instantiateObject(object) {
        this.scene.add(object.mesh);
        this.objects.push(object);
    }

    instantiateLight(light) {
        this.scene.add(light);
        this.lights.push(light);
    }

    deleteObject(object) {
        const indexOf = this.objects.indexOf(object);
        if (indexOf != -1) {
            this.objects.splice(indexOf, 1);
        }

        this.scene.remove(object.mesh);
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