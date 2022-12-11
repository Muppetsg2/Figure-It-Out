class Player extends GroupNode {

    constructor(obj) {
        super(obj)

        this.shapes = []

        let child = this.node.firstChild;

        if(child.nodeType != 3){
            this.shapes.push(new SVGNode({domNode: child}));
        }

        while (child.nextSibling) {
            child = child.nextSibling;
            if (child.nodeType == 3){
                continue;
            }
            this.shapes.push(new SVGNode({domNode: child}));
        }

        this.shapes.forEach(shape => {
            this.node.removeChild(shape.getNode());
        });

        this.actualShape = this.node.appendChild(this.shapes[0].duplicateNode());

        this.positions = [178, 498, 818];
    }

    changeShape(index) {
        if (index >= this.shapes || index <= -1){
            return;
        }

        this.node.removeChild(this.actualShape);

        this.actualShape = this.node.appendChild(this.shapes[index].duplicateNode());
    }

    move(direction) {

        let index = this.positions.indexOf(this.x);
        let posIndex = 0;

        if (direction.toLowerCase() == "right"){
            posIndex = index == this.positions.length-1 ? index : index+1;
        }
        else if (direction.toLowerCase() == "left") {
            posIndex = index == 0 ? 0 : index-1;
        }
        
        this.setPos(Number(this.positions[posIndex]), this.y);
    }

    get shape(){
        return this.actualShape.nodeName;
    }
}