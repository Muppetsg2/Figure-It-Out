// AUTHOR: Marceli Antosik (Muppetsg2)

class GroupNode extends SVGNode{
    notImplemented = true;

    get transform() {
		const transformAttr = this.getStringAttr("transform");
		const values = transformAttr.match(/translate\(([^)]+)\)/)[1].split(',').map(Number);
        return values;
    }

    set transform(value) {
        this.set("transform", `translate(${value[0]}, ${value[1]})`)
    }

    get x() {
        return this.transform[0];
    }

    set x(value) {
        this.transform = [value, this.y];
    }

    get y() {
        return this.transform[1];
    }

    set y(value) {
        this.transform = [this.x, value];
    }

    get width() {
		const child = this.node.querySelector(':not(text)');
        const obj = new SVGNode({ domNode: child });		
        return obj.get("width");
    }

    set width(value) {
        if (this.notImplemented){
            return;
        }
    }

    get height() {
		const child = this.node.querySelector(':not(text)');
        const obj = new SVGNode({ domNode: child });
        return obj.get("height");
    }

    set height(value) {
        if (this.notImplemented){
            return;
        }
    }

    setPos(x, y) {
        this.transform = [x, y];
    }
}