class SVGNode {
    constructor(obj) {
		this.node = obj.selector ? document.querySelector(obj.selector) : obj.domNode;
    }

    getStringAttr(attrName) {
        return this.node.getAttribute(attrName);
    }

    get(attrName) {
        return parseFloat(this.getStringAttr(attrName));
    }

    set(attrName, value) {
        this.node.setAttribute(attrName, value);
    }

    collidesWith(svg) {
		const halfWidth = this.width / 2;
		const halfHeight = this.height / 2;
		const svgHalfWidth = svg.width / 2;
		const svgHalfHeight = svg.height / 2;
		
        return (
            this.x + halfWidth >= svg.x && // left-edge
            this.x <= svg.x + svgHalfWidth && // right-edge
            this.y + halfHeight >= svg.y && // top-edge
            this.y <= svg.y + svgHalfHeight // bottom-edge
        );
    }

    duplicateNode() {
        return this.node.cloneNode(true);
    }

    getNode() {
        return this.node;
    }

    get x() {
        return this.get("x");
    }

    set x(value) {
        this.set("x", value);
    }

    get y() {
        return this.get("y");
    }

    set y(value) {
        this.set("y", value);
    }

    get width() {
        return this.get("width");
    }

    set width(value) {
        this.set("width", value);
    }

    get height() {
        return this.get("height");
    }

    set height(value) {
        this.set("height", value);
    }
}