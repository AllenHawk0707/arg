# REAL_WORLD_BRIDGES — 现实关联层

> 这是**整份 ARG 最敏感的文档**。它定义了玩家从虚拟走向现实的每一处衔接点。

## 设计原则

1. **现实关联必须真实可达**。玩家点链接不能是 404。
2. **现实关联必须可逆**。如果某真实资源在某天消失，玩家必须有"考古路径"完成题目。
3. **现实关联不应骚扰他人**。如果涉及与活人的通信，邮箱/电话需经过对方知情同意并备案。
4. **现实关联要标记为 `external`**——告诉玩家"这一步你走出 ARG 了"。

## 桥接层（按章节）

### 章节 00 — 信号接触
- **桥接 #00.1**：解码 Base64 后得到一段**真实经纬度**。玩家需要打开真实地图（如 Google Earth）确认地点。
  - 真实地点：Heimaey（冰岛 Vestmannaeyjar 主岛），北纬 63.442°，西经 20.273°
  - 验证途径：玩家在终端输入 `verify_coord "63.442,-20.273"` 后显示 "EF-7 信号源"
  - 玩家也可在 [Google Maps](https://www.google.com/maps/@63.442,-20.273,12z) 查看
  - 考古路径：如果 Google Maps 失效，提供离线街景截图 `real-world/coordinates/EF7_satellite.png`

### 章节 01 — 失联名单
- **桥接 #01.1**：真实网站。冰岛国家档案馆 `https://skjalasafn.is/`（虚构但格式正确）有 7 名研究员的入职档案。
  - 玩家访问网站 → 搜索 7 个名字 → 找到各自的真实档案号
  - 7 个档案号拼成下个 AES 密钥
- **桥接 #01.2**：真实 PDF。论文《Symbol Lattice Hypothesis》原版存于挪威国家图书馆。
  - URL：`https://www.nb.no/items/<id>`（虚构 URL，但格式真实）
  - 玩家访问后下载 PDF，搜索特定段落（章节 6，页 23），找到隐藏的 Vigenère 密钥

### 章节 02 — 黑匣子
- **桥接 #02.1**：真实广播频段。EF-7 在 2025.x 月某日上传了一段 17 秒的"原声信号"到 [archive.org/details/ef7-day12](https://archive.org/details/ef7-day12)。
  - 玩家下载 WAV，频谱分析得到隐藏在 5.7 Hz 的莫尔斯码
  - 莫尔斯码翻译得到"WE ARE NOT / WE ARE ECHO" 重复 91 次

### 章节 03 — 协议
- **桥接 #03.1**：真实邮箱。`ghost-tainted@protonmail.com` 收到玩家任何邮件后自动回复一个加密的 `.pgp` 文件。
  - 玩家用 PGP 解密，得到章节 3 的最后一组素数
- **桥接 #03.2**：真实电话号码。`+354 4xx-xxxx`（冰岛本地号码）。拨打后听到一段 4 分钟的"电子语音"音频，揭示章节 99 的真相。

## 桥接层的实施

每个现实关联点都登记在 `real-world/<类型>/<id>.json`：

```json
{
  "id": "bridge-00-001",
  "chapter": "00",
  "type": "coordinate",
  "title": "EF-7 信号源",
  "url": "https://www.google.com/maps/@63.442,-20.273,12z",
  "description": "在终端输入 verify_coord 后确认。",
  "requires": ["puzzle-00-001"],
  "valid_until": "永久",
  "fallback": "real-world/coordinates/EF7_satellite.png"
}
```

## 当前状态

🚧 章节 0 的桥接尚未实现。后续章节的桥接在 `journal.md` 中跟踪。

## 已知问题

- 真实 URL 可能在 2025 年后失效。每个桥接必须配 fallback 文件。
- 邮箱/电话需要每年检查。EF 协议名义下的真实通信需要所有者同意。

## 设计者注意

**永远不要**让玩家：
- 拨打警察/急救电话
- 发送骚扰邮件给真实第三方
- 进入真实禁地
- 让真人担心自己是不是被跟踪

EF 的现实关联是**叙事技巧**，不是**社会工程**。请以这个标准来约束所有新桥接点。