class Vector {
    constructor() {
    }
    equals(otherVector) {}
    add(otherVector) {}
    subtract(otherVector) {}
    multiply(multiplyWith) {}
    normalize() {}

    get magnitude() {}
    get length() {
        return this.magnitude();
    }

    toString() {}
}

class Vector2 extends Vector {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }

    equals(otherVector) {
        return this.x == otherVector.x && this.y == otherVector.y;
    }

    add(otherVector) {
        return new Vector2(this.x + otherVector.x, this.y + otherVector.y);
    }

    subtract(otherVector) {
        return new Vector2(this.x - otherVector.x, this.y - otherVector.y);
    }

    multiply(multiplyWith) {
        return new Vector2(this.x * multiplyWith, this.y * multiplyWith);
    }

    normalize() {
        let magnitude = this.magnitude;
        return new Vector2(this.x / magnitude, this.y / magnitude);
    }

    get magnitude() {
        return Math.sqrt((this.x ** 2) + (this.y ** 2));
    }

    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }
}

class Vector3 extends Vector {
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    equals(otherVector) {
        return this.x == otherVector.x && this.y == otherVector.y && this.z == otherVector.z;
    }

    add(otherVector) {
        return new Vector3(this.x + otherVector.x, this.y + otherVector.y, this.z + otherVector.z);
    }

    subtract(otherVector) {
        return new Vector3(this.x - otherVector.x, this.y - otherVector.y, this.z - otherVector.z);
    }

    multiply(multiplyWith) {
        return new Vector3(this.x + multiplyWith, this.y * multiplyWith, this.z * multiplyWith);
    }

    normalize() {
        let magnitude = this.magnitude;
        return new Vector2(this.x / magnitude, this.y / magnitude, this.z / magnitude);
    }

    get magnitude() {
        return Math.sqrt((this.x ** 2) + (this.y ** 2) + (this.z ** 2));
    }

    toString() {
        return "(" + this.x + ", " + this.y + ", " + this.z + ")";
    }
}
