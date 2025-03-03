// AUTHOR: Marceli Antosik (Muppetsg2)

class PolygonUtils {
    static calculateDimensions(pointsStr) {
        const points = pointsStr.split(' ').map(point => {
            const [x, y] = point.split(',').map(Number);
            return { x, y };
        });

        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));

        const width = maxX - minX;
        const height = maxY - minY;

        return {
            width,
            height
        };
    }
}