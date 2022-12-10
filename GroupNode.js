class GroupNode extends SVGNode{

    notImplemented = true;

    get transform() {
        let s = new String(this.getStringAttr("transform")).substring(9).substring(1);
        let size = s.length;
        let tab = s.substring(0,size-1).replace(/\s+/g, '').split(",");
        let retTab = [Number(parseFloat(tab[0])), Number(parseFloat(tab[1]))];
        return retTab;
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
        let child = this.node.firstChild;

        while (child.nodeType == 3 && child.nextSibling){
            child = child.nextSibling;
        }

        let obj = new SVGNode({ domNode: child});
        return obj.get("width");
    }

    set width(value) {
        if (this.notImplemented){
            return;
        }
    }

    get height() {
        let child = this.node.firstChild;

        while (child.nodeType == 3 && child.nextSibling){
            child = child.nextSibling;
        }

        let obj = new SVGNode({ domNode: child});
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