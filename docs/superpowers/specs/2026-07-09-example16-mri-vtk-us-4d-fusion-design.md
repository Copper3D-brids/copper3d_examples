# Example 16 — MRI + VTK + 4D 超声波体渲染融合

**日期：** 2026-07-09
**基础：** `src/pages/example15_mri_lv_4d.vue`（已实现 MRI 切片 + VTK 心脏模型 4D 动画）
**目标：** 在 example15 基础上叠加 4D 超声波（21 帧 NRRD）的**体渲染**，三个模态一起按心动周期相位同步播放。参考效果：`public/heart_4d_animation/fusion-demo-1.gif`。

---

## 1. 数据事实（已逐字节核对）

- **超声波 NRRD：** `public/heart_4d_animation/nnrd/DZET01_17871377_000..020.nrrd`，共 **21 帧**。
  - header 仅 232 字节，字段只有：`type: uint8`、`dimension: 3`、`sizes: 134 189 189`、`encoding: gzip`。
  - **无任何空间字段**（`space` / `space directions` / `space origin` / `spacings` / `measurement frame` 全部缺失）。即体数据没有体素尺寸、原点、朝向信息 —— 纯 134×189×189 uint8 数字立方体。
- **MRI DICOM：** 32 帧，`copperDicomLoader.ts` 读取真实病人坐标 `ImagePositionPatient` / `ImageOrientationPatient` / `PixelSpacing`。MRI 平面与 VTK 表面都在**真实病人（LPS）世界坐标**里。
- **帧数差异：** MRI/VTK 32 帧 vs 超声波 21 帧 —— 同一心动周期的不同采样率。

**结论：** 超声波必须人为给 pose（数据里没有可算的配准信息）；但可以用 MRI/VTK 的真实几何当锚点，让它自动落到心脏位置。

---

## 2. 渲染技术

**不使用** `NRRDLoader` 的切片平面方式。每帧超声波构建为 `THREE.Data3DTexture`，用光线投射着色器 `VolumeRenderShader1`（仓库已有，见 `copperNrrdTexture3dLoader`）渲染，复现 gif 的扇形体渲染云雾效果。

关键实现细节：
- 纹理保持 **`UnsignedByteType` / `RedFormat`**（1 字节/体素），**不**转 Float32。
  - 21 帧 × 134×189×189 ≈ **~100 MB** GPU 显存（转 Float32 会到 ~400 MB）。
  - 着色器采样归一化到 0..1，`u_clim` 落在 0..1 区间。
- **蓝→橙 colormap**（程序化生成 `DataTexture`）逼近 gif 观感；默认 **MIP** 渲染风格。
- 动画 = 每帧切换 `u_data` uniform 指向当前帧纹理。
- 体渲染 mesh：`side: THREE.BackSide`、`depthWrite: false`，`renderOrder` 排在 MRI 平面与 VTK 表面之后，避免与现有透明排序冲突（example15 已有此坑注释）。

---

## 3. 架构与相位同步

### 3.1 新增库方法（纯新增，不改动现有代码）

`copperScene.ts` 新增：

```ts
scene.loadNrrd4DVolume(
  urls: string[],
  opts: {
    transform?: { position?, rotation?, scale? }, // 预设 pose（由页面用 VTK 包围盒算出）
    renderStyle?: "mip" | "iso",
    clim?: [number, number],
    opacity?: number,
  },
  callback?: (ctrl: Nrrd4DVolumeController) => void
): void
```

行为：
1. 并行加载 21 个 NRRD（带进度条），构建 21 个 uint8 `Data3DTexture`。
2. 建体渲染 mesh，应用 `opts.transform`。
3. **自身不跑时钟**，返回 controller，仅暴露驱动/控制接口。

`Nrrd4DVolumeController` 接口：
- `setFrame(i)` / `frameCount`（供主相位时钟驱动）
- `setPhase(p)`（可选便捷方法，内部 `setFrame(Math.floor(p * frameCount) % frameCount)`）
- `setOpacity(v)`、`setClim(lo, hi)`、`setRenderStyle("mip"|"iso")`
- `setTransform({ position?, rotation?, scale? })`（供微调滑块）
- `mesh`（暴露给页面算包围盒/调试）
- `dispose()`

### 3.2 空间锚定（跟随 MRI/VTK 真实位置）

- 加载顺序：先 `loadAligned4D`（MRI+VTK），回调里从 `ctrl.surfaceMeshes`（endo/epi）算 **VTK LV 表面包围盒**（中心 + 尺寸）。
- 由包围盒得出超声波的**初始预设 pose**：
  - `position` = 包围盒中心（心脏真实位置）。
  - `scale` = 让 134×189×189 体的最长边 ≈ 包围盒最长边（自动缩放到心脏大小）。
  - `rotation` = 一个合理初值（默认单位或绕轴一个预设角）。
- 再调 `loadNrrd4DVolume`，把该 pose 作为 `opts.transform` 传入。
- **诚实边界：** 这是"自动落到心脏位置+尺寸"，不是医学配准；朝向对准靠用户微调滑块。

### 3.3 一个主相位时钟驱动全部

`loadAligned4D` 的 controller 已有 `setFrame(i)` 和 `frameCount`，其内部时钟可用 `pause()` 关闭。故：

1. `scene.loadAligned4D(...)` → 得 `mriCtrl`，调 `mriCtrl.pause()` 停其自带时钟。
2. 用包围盒 pose 调 `scene.loadNrrd4DVolume(...)` → 得 `usCtrl`。
3. 注册**一个** pre-render 回调，推进归一化 `phase ∈ [0,1)`（周期 ~1012ms ÷ speed），映射到各模态自己的帧：
   - `mriCtrl.setFrame(Math.floor(phase * 32) % 32)`
   - `usCtrl.setFrame(Math.floor(phase * 21) % 21)`

`loadAligned4D` 库代码**完全不改**，只新增 `loadNrrd4DVolume`（对 example15 零风险）。

---

## 4. 页面 UI（`src/pages/example16_*.vue`）

沿用 example15 的 `cu-panel` 铜金色面板风格。

| 控件 | 作用 |
|---|---|
| Play / Pause | 主相位时钟启停 |
| Speed (0.25–3×) | 播放速度 |
| MRI α / Endo α | 同 example15 |
| Epicardium 开关 | 同 example15 |
| **US α** | 超声波体不透明度 |
| **US clim (lo/hi)** | 传递函数窗宽，调云雾浓淡逼近 gif |
| **US 渲染风格** | MIP / ISO 切换 |
| **US 位置/旋转/缩放** | 微调超声波 pose，初值 = VTK 包围盒自动算出的预设 pose |

---

## 5. 资源释放

- `onBeforeUnmount`：`usCtrl.dispose()`（释放 21 个 Data3DTexture、几何、材质、移除 pre-render 回调）+ `mriCtrl.dispose()` + `appRenderer.dispose()`。
- 主相位时钟回调在 dispose 时移除。

---

## 6. 组件边界（单一职责）

- **`loadNrrd4DVolume`（库）：** 只负责"把 NRRD 序列变成一个可控的体渲染对象"。输入 urls+pose，输出 controller。不知道 MRI、不知道时钟、不知道 Vue。
- **`loadAligned4D`（库，已存在）：** MRI+VTK 序列，保持不变。
- **`example16.vue`（页面）：** 编排者。负责加载顺序、算包围盒 pose、跑主相位时钟同步两个 controller、UI 绑定。

每个单元可独立理解与测试。

---

## 7. 非目标（YAGNI）

- 不做真正的 MRI↔超声医学配准（无数据）。
- 不做超声波切片平面视图（只做体渲染）。
- 不改 `loadAligned4D` / example15。
- 不做 TransformControls 拖拽（用滑块即可）。
