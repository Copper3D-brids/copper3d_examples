addEventListener("message", (event) => {
  const data = event.data;
  // 在 Worker 中执行计算量大的代码
  const result = compute(data);
  // 发送计算结果到主线程
  postMessage(result);
});

function compute(data: any) {
  // 计算量大、耗时长的代码
  // ...
  return "result";
}

export {};
