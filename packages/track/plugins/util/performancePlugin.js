/// <reference path = "./base.d.ts" />
/**
 * @des 插件定义示例
 * @param object.trackSend string 插件发送的地址
 * @param object.trackConfig object object 插件的配置
 */
export class performancePlugin {
    staticConfig;
    trackConfigData;
    constructor({ trackSend, trackConfig } = { trackSend: () => { }, trackConfig: {} }) {
        this.trackConfigData = {
            trackSend, trackConfig
        };
        // this.autoRun();
    }
    autoRun() {
        this.lcp();
    }
    lcp() {
        let arr = [];
        let list = new PerformanceObserver((list) => {
            // console.log(list);
            // LargestContentfulPaint 格式的,只有startTime 渲染开始的时间有作用
            let lcpEntry = list.getEntries().at(-1);
            if (lcpEntry) {
                arr.push({
                    element: lcpEntry?.element,
                    tag: lcpEntry?.element?.tagName,
                    resourceUrl: lcpEntry?.url,
                    url: window.location.href,
                    startTime: lcpEntry?.startTime,
                    type: "lcp",
                    // extraInfo: {}
                });
                const lcpResourceEntry = performance
                    .getEntriesByType("resource")
                    .filter((e) => e.name === lcpEntry.url)[0];
                // fp 首次绘制时间
                // @ts-ignore
                let fp = performance.getEntriesByType("navigation")[0].responseStart;
                // lcp 加载 资源延迟 结束的时间
                let lcp_load_delay_endTime = Math.max(fp, lcpResourceEntry?.requestStart ?? 0);
                // lcp 加载 资源 结束的时候
                let lcp_load_responseEnd = lcpResourceEntry?.responseEnd ?? 0;
                let LcpEndTime = Math.max(lcp_load_responseEnd, lcpEntry ? lcpEntry.startTime ?? 0 : 0);
                // lcp 加载时间
                arr[0]["children"] = [
                    {
                        name: "fp",
                        startTime: 0,
                        endTime: fp,
                        duration: fp,
                        type: "lcp",
                        url: window.location.href,
                        // extraInfo: {},
                        radio: fp / LcpEndTime,
                    },
                    // 加载延迟
                    {
                        name: "lcp_load_delay",
                        startTime: fp ?? 0,
                        endTime: lcp_load_delay_endTime,
                        duration: lcp_load_delay_endTime - fp,
                        type: "lcp",
                        url: window.location.href,
                        // extraInfo: {},
                        radio: (lcp_load_delay_endTime - fp) / LcpEndTime,
                    },
                    // 加载时间
                    {
                        name: "lcp_load_time",
                        startTime: lcp_load_delay_endTime,
                        endTime: lcp_load_responseEnd,
                        duration: lcp_load_responseEnd -
                            lcp_load_delay_endTime,
                        type: "lcp",
                        url: window.location.href,
                        // extraInfo: {},
                        radio: (lcp_load_responseEnd - lcp_load_delay_endTime) / LcpEndTime,
                    },
                    // 渲染时间
                    {
                        name: "lcp_rendering",
                        startTime: lcp_load_responseEnd,
                        endTime: LcpEndTime,
                        duration: LcpEndTime - (lcp_load_responseEnd),
                        type: "lcp",
                        url: window.location.href,
                        // extraInfo: {},
                        radio: (LcpEndTime - (lcp_load_responseEnd)) / LcpEndTime,
                    },
                ];
                console.table(arr[0]["children"]);
            }
            // this.trackConfigData.trackSend(arr);
        });
        list.observe({ type: "largest-contentful-paint", buffered: true });
        return arr;
    }
}
// 参考文档:
// - https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceEntry/name https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceEntry/entryType
// - name 和 type 的关系挺复杂的,都有一定type的意思,但是有区别,根据文档定义指标
// paint 的 name 分成 first-paint 和 first-contentful-paint
/**
注意的点
- 跨域资源需要添加 Timing-Allow-Origin

计算指标
-
- lcp
    - lcp 的 加载延迟 lcp 是
        - end(lcp fp):performance.getEntriesByType('resource').requestStart 和 计算是 performance.getEntriesByType('navigation')[0].responseStart 的max
        - start:0
    - lcp 的 加载时间 是
        - end:performance.getEntriesByType('resource').responseEnd
        - start:lcp fp
    - lcp 的 渲染时间 是
        - end:let list = new PerformanceObserver((list) => {console.log(list.getEntries())})
              list.observe({ type: "largest-contentful-paint", buffered: true})
            - (largest-contentful-paint) 和
        - start:performance.getEntriesByType('resource').responseEnd (name等于上面的url)
 1. getEntries 属性 array<object> 计量单位都是ms
    - 1.1.VisibilityStateEntry(可见性状态变化的计时）：离开的时候可以用
        - 1.1.1 entryType：visibility-state 可见性
        - 1.1.2.startTime：开始时间
        - 1.1.3 name: "visible" | "hidden" 目前是隐藏还是展示
        - 用法:
            - 界面停留时间:离开的时候找到 VisibilityStateEntry 用visible和hidden的starttime状态相减 starttime加减
    - 1.2.PerformanceNavigationTiming
        - 1.2.1  entryType：navigation
        - 1.2.2  name: 返回文档的url window.locatction.href
        - 1.2.3  duration 他是 整个文档同步资源的加载时间
            - https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming 里面的图十分清楚
                - 重定向->sw->cache->dns->tcp->request->early hints(103)(HTTP/2 Server Push 的升级版=预加载 103会自动缓存)->response
                - reponse-> eventload
        - 1.2.4  redirectCount 浏览上下文中上次非重定向导航以来的重定向次数
        - 用法: 离开的时候找到 VisibilityStateEntry 用 starttime加减
    - 1.3.PerformanceLongAnimationFrameTiming(哪些注册主线程任务耗费了50ms或者更多时间)
        - 1.3.1 突然定位不到这个元素了
        - 1.3.2
    - 1.4.PerformanceResourceTiming(可以获取资源的加载时间)
        - 1.4.1 entryType：resource
        - 1.4.2 name :资源url
        - 1.4.3 duraction : 响应结束和startTime的差值
        - 1.4.4 initiatorType:css | embed | fetch | frame | image | script | xmlhttprequest
        - 1.4.5 transferSize :获取资源的大小
        - 1.4.6 注意的点
            - 1.4.6.1 两个 url 相同的 image 可能只会请求一次，只有url改变了才会改变
            - 1.4.6.2 iframe请求的子资源不会出现在里面，出现的只有iframe这一个文件
            - 1.4.6.3 (这条很奇怪,因为返回值如果是404或者确实的网络错误跟正确的是没有区别的)如果网络请求失败那么返回值只有 startTime, fetchStart, duration and responseEnd
            - 1.4.6.4 如果因为 混合内容、CORS 限制、CSP 策略等策略那么不会出现在这条线中
    - 1.5
 */
