class ObjectContainer {
    constructor(tab){
        this.list = [];
        tab.forEach(element => {
            this.list.push(element); 
        });
    }

    move(value) {
        this.list.forEach(obj => {
            obj.setPos(obj.x, obj.y+value);
        });
    }

    get y() {
        return this.list[0].y;
    }

    remove(node) {
        if (node) {
            this.list.forEach(obj => {
                node.removeChild(obj.getNode());
            });
        }
    }
}