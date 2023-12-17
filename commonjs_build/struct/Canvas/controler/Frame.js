"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frame = void 0;
const Matrix3_js_1 = require("../math/Matrix3.js");
const Vector2_js_1 = require("../math/Vector2.js");
const Img2D_js_1 = require("../objects/Img2D.js");
const ObjectUtils_js_1 = require("../objects/ObjectUtils.js");
const pi2 = Math.PI * 2;
/* 布尔变量 */
let _bool = false;
/* 虚拟canvas上下文对象 */
const ctx = document
    .createElement('canvas')
    .getContext('2d');
class Frame {
    _img = new Img2D_js_1.Img2D();
    // 图案边框的顶点集合
    vertives = [];
    // 图案中点
    center = new Vector2_js_1.Vector2();
    // 路径变换矩阵
    matrix = new Matrix3_js_1.Matrix3();
    // 要把路径变换到哪个坐标系中，默认裁剪坐标系
    level = 'pvmoMatrix';
    // 对面节点
    opposite = new Vector2_js_1.Vector2();
    // 描边色
    strokeStyle = '#558ef0';
    // 填充色
    fillStyle = '#fff';
    constructor(attr = {}) {
        for (let [key, val] of Object.entries(attr)) {
            this[key] = val;
        }
    }
    get img() {
        return this._img;
    }
    set img(val) {
        this._img = val;
        this.updateShape();
    }
    /* 更新矩阵、路径初始顶点、中点 */
    updateShape() {
        const { vertives: fv, center, img, level, img: { size: { x: imgW, y: imgH }, }, } = this;
        const vertices = [
            0,
            0,
            imgW / 2,
            0,
            imgW,
            0,
            imgW,
            imgH / 2,
            imgW,
            imgH,
            imgW / 2,
            imgH,
            0,
            imgH,
            0,
            imgH / 2,
        ];
        /* 更新路径变换矩阵 */
        this.matrix = img[level];
        for (let i = 0, len = vertices.length; i < len; i += 2) {
            const { x, y } = new Vector2_js_1.Vector2(vertices[i], vertices[i + 1]).applyMatrix3(this.matrix);
            /* 更新路径顶点 */
            fv[i] = x;
            fv[i + 1] = y;
        }
        /* 更新中点 */
        center.copy(new Vector2_js_1.Vector2(fv[0], fv[1]).lerp(new Vector2_js_1.Vector2(fv[8], fv[9]), 0.5));
    }
    /* 获取变换状态 */
    getMouseState(mp) {
        const { vertives: fv, opposite } = this;
        /* 对角线距离 */
        const diagonal = new Vector2_js_1.Vector2(fv[0] - fv[8], fv[1] - fv[9]).length();
        /* 判断缩放的距离 */
        const scaleDist = Math.min(24, diagonal / 3);
        /* x,y缩放 */
        for (let i = 0, len = fv.length; i < len; i += 4) {
            if (new Vector2_js_1.Vector2(fv[i], fv[i + 1]).sub(mp).length() < scaleDist) {
                const ind = (i + 8) % 16;
                opposite.set(fv[ind], fv[ind + 1]);
                return 'scale';
            }
        }
        /* y向缩放 */
        ctx.save();
        ctx.lineWidth = scaleDist;
        ctx.beginPath();
        (0, ObjectUtils_js_1.crtPath)(ctx, [fv[0], fv[1], fv[4], fv[5]]);
        _bool = ctx.isPointInStroke(mp.x, mp.y);
        ctx.restore();
        if (_bool) {
            opposite.set(fv[10], fv[11]);
            return 'scaleY';
        }
        ctx.save();
        ctx.lineWidth = scaleDist;
        ctx.beginPath();
        (0, ObjectUtils_js_1.crtPath)(ctx, [fv[8], fv[9], fv[12], fv[13]]);
        _bool = ctx.isPointInStroke(mp.x, mp.y);
        ctx.restore();
        if (_bool) {
            opposite.set(fv[2], fv[3]);
            return 'scaleY';
        }
        /* x向缩放 */
        ctx.save();
        ctx.lineWidth = scaleDist;
        ctx.beginPath();
        (0, ObjectUtils_js_1.crtPath)(ctx, [fv[12], fv[13], fv[0], fv[1]]);
        _bool = ctx.isPointInStroke(mp.x, mp.y);
        ctx.restore();
        if (_bool) {
            opposite.set(fv[6], fv[7]);
            return 'scaleX';
        }
        ctx.save();
        ctx.lineWidth = scaleDist;
        ctx.beginPath();
        (0, ObjectUtils_js_1.crtPath)(ctx, [fv[4], fv[5], fv[8], fv[9]]);
        _bool = ctx.isPointInStroke(mp.x, mp.y);
        ctx.restore();
        if (_bool) {
            opposite.set(fv[14], fv[15]);
            return 'scaleX';
        }
        /* 移动 */
        ctx.beginPath();
        (0, ObjectUtils_js_1.crtPath)(ctx, fv);
        if (ctx.isPointInPath(mp.x, mp.y)) {
            return 'move';
        }
        /* 旋转 */
        ctx.save();
        ctx.lineWidth = 80;
        ctx.beginPath();
        (0, ObjectUtils_js_1.crtPath)(ctx, fv, true);
        _bool = ctx.isPointInStroke(mp.x, mp.y);
        ctx.restore();
        if (_bool) {
            return 'rotate';
        }
        /* 无状态 */
        return null;
    }
    draw(ctx) {
        this.updateShape();
        const { img: { size }, vertives: fv, center, matrix, strokeStyle, fillStyle, } = this;
        /* 图案尺寸的一半 */
        const [halfWidth, halfheight] = [size.width / 2, size.height / 2];
        /* 绘图 */
        ctx.save();
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        /* 矩形框 */
        ctx.beginPath();
        (0, ObjectUtils_js_1.crtPath)(ctx, [fv[0], fv[1], fv[4], fv[5], fv[8], fv[9], fv[12], fv[13]], true);
        ctx.stroke();
        /* 矩形节点 */
        const { elements: e } = matrix;
        // 矩阵内的缩放量
        const sx = new Vector2_js_1.Vector2(e[0], e[1]).length();
        const sy = new Vector2_js_1.Vector2(e[3], e[4]).length();
        // 节点尺寸，消去缩放量
        const pointSize = new Vector2_js_1.Vector2(8 / sx, 8 / sy);
        //节点尺寸的一半
        const [w, h] = [pointSize.x / 2, pointSize.y / 2];
        // 绘制节点
        ctx.beginPath();
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (y === 1 && x === 1) {
                    continue;
                }
                //节点位置
                const [bx, by] = [halfWidth * x, halfheight * y];
                (0, ObjectUtils_js_1.crtPathByMatrix)(ctx, [bx - w, by - h, bx + w, by - h, bx + w, by + h, bx - w, by + h], matrix, true);
            }
        }
        ctx.fill();
        ctx.stroke();
        /* 中点 */
        ctx.beginPath();
        ctx.arc(center.x, center.y, 5, 0, pi2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}
exports.Frame = Frame;
