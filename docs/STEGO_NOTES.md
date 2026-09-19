# STEGO_NOTES — 隐写术制作指引

> EF 项目的隐写谜题制作规范。每制作一份隐写资产后，必须在此登记。

## 资产清单

| ID | 章节 | 类型 | 内容 | 状态 |
|---|---|---|---|---|
| EF7_day12.wav | 02 | 音频频谱 | 5.7 Hz 基频 + 91 个 0.17 Hz 间距尖峰（莫尔斯码） | 占位（README） |
| LOGAN_girl_drawing.jpg | 01 | 图像 LSB | 8 岁女孩画的黑色星星 | 占位 |
| SARAS_picture_2019.jpg | 01 | 图像 EXIF | 隐藏 GPS 坐标 | 占位 |
| POL_diary_ch03.pdf | 03 | PDF 零宽字符 | Per-Olof 私人日记 | 占位 |
| TRANSMISSION_99.wav | 99 | 音频 17 kHz | 倒放电子语音（真相独白） | 占位 |

## 音频频谱制作

工具：Audacity（开源）
```bash
# 1. 基础白噪声
sox -n assets/audio/ef7_day12.wav synth 17 whitenoise vol 0.3

# 2. 注入 5.7 Hz 基频
sox assets/audio/ef7_day12.wav assets/audio/ef7_day12_b.wav synth 17 sine 5.7 vol 0.4

# 3. 注入 91 个 0.17 Hz 间距尖峰（莫尔斯码隐藏在幅度调制里）
python3 tools/inject_morse.py assets/audio/ef7_day12_b.wav assets/audio/ef7_day12_c.wav

# 4. 加混响 (让频谱模糊)
sox assets/audio/ef7_day12_c.wav assets/audio/ef7_day12_final.wav reverb 50
```

## 图像 LSB 制作

工具：Python + PIL/Pillow
```python
from PIL import Image
import struct

# 把 secret 编码进 LSB
secret = b"WE ARE NOT / WE ARE ECHO" * 6  # 终止符 0x00 后跟任意数据
img = Image.open("assets/images/cover.jpg")
pixels = img.load()
w, h = img.size
i = 0
for y in range(h):
    for x in range(w):
        r, g, b = pixels[x, y][:3]
        if i < len(secret) * 8:
            # R 通道 LSB 写入
            r = (r & 0xfe) | ((secret[i // 8] >> (7 - (i % 8))) & 1)
            i += 1
        pixels[x, y] = (r, g, b)
img.save("assets/images/stego.png")
```

## 零宽字符制作

工具：浏览器 F12 控制台
```js
Edenfall.use('zw').encode('这是一段普通文本', 'WE-ARE-91-OF-91');
// 复制输出，粘贴到任意文档。读者看不到 'WE-ARE-91-OF-91'，但控制台：
Edenfall.use('zw').decode(document.body.innerText);
// → 'WE-ARE-91-OF-91'
```

## 通用检查

每制作一份隐写资产，必须验证：
1. **原始载体不可疑**：玩家看到图片/音频时，不会立刻怀疑有隐藏信息
2. **信息可被发现**：玩家应能通过工具发现提取方法
3. **答案唯一**：解码后的信息应**直接引导玩家进入下一步**

## 已嵌入登记

格式：`[YYYY-MM-DD] 资产ID = 内容摘要（解法）`

（暂无）