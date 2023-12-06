import { Matrix3 } from '../math/Matrix3.js';
import { Vector2 } from '../math/Vector2.js';
class Camera {
    position;
    zoom;
    /**
     *
     * @param x
     * @param y
     * @param zoom ju
     */
    constructor(x = 0, y = 0, zoom = 1) {
        this.position = new Vector2(x, y);
        this.zoom = zoom;
    }
    /* 视图投影矩阵(行列式)：先逆向缩放，再逆向位置 */
    get pvMatrix() {
        const { position: { x, y }, zoom, } = this;
        return new Matrix3().scale(1 / zoom).translate(-x, -y);
    }
    /* 使用视图投影矩阵反向变换物体*/
    transformInvert(ctx) {
        const { position: { x, y }, zoom, } = this;
        const scale = 1 / zoom;
        ctx.translate(-x, -y);
        ctx.scale(scale, scale);
    }
}
export { Camera };
