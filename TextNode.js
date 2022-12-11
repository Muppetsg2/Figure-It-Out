class TextNode extends SVGNode {
    get textContent() {
        return this.node.textContent;
    }

    set textContent(value) {
        this.node.textContent = value;
    }
}