class Player extends GroupNode {
    constructor(obj) {
        super(obj);
        this.shapes = [];
		
		for (let child = this.node.firstChild; child; child = child.nextSibling) {
            if (child.nodeType != 3) {
                this.shapes.push(new SVGNode({ domNode: child }));
            }
        }
		
        this.shapes.forEach(shape => this.node.removeChild(shape.getNode()));
        this.actualShape = this.node.appendChild(this.shapes[0].duplicateNode());
        this.positions = [178, 498, 818];
    }

    changeShape(index) {
        if (index >= this.shapes.length || index < 0){
            return;
        }
		
        this.node.removeChild(this.actualShape);
        this.actualShape = this.node.appendChild(this.shapes[index].duplicateNode());
    }

    move(direction) {
        const index = this.positions.indexOf(this.x);
        let posIndex = index;

        if (direction.toLowerCase() == "right" && index < this.positions.length - 1){
            posIndex++;
        }
        else if (direction.toLowerCase() == "left" && index > 0) {
            posIndex--;
        }
        
        this.setPos(this.positions[posIndex], this.y);
    }

    get shape() {
        return this.actualShape.nodeName;
    }
	
	get width() {
		const child = this.node.querySelector(':not(text)');
        const obj = new SVGNode({ domNode: child });
		switch(this.actualShape.nodeName) {
			case "rect":
				return obj.get("width");
			case "circle":
				return obj.get("r") * 2;
			case "polygon":
				return PolygonUtils.calculateDimensions(obj.getStringAttr("points")).width;
		}
	}
	
	get height() {
		const child = this.node.querySelector(':not(text)');
        const obj = new SVGNode({ domNode: child });
		switch(this.actualShape.nodeName) {
			case "rect":
				return obj.get("height");
			case "circle":
				return obj.get("r") * 2;
			case "polygon":
				return PolygonUtils.calculateDimensions(obj.getStringAttr("points")).height;
		}
	}
}