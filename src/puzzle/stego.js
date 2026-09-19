/* ════════════════════════════════════════════════════════════════
   stego.js — 隐写术工具集
   EDENFALL 项目谜题引擎
   用法：
     <script src="src/puzzle/stego.js"></script>
     // 零宽字符（文本中藏信息，肉眼不可见）
     Edenfall.use('zw').encode('hello', 'secret');    // → "hello" + 零宽编码的 "secret"
     Edenfall.use('zw').decode(text);                 // → "secret"
     // 图像 LSB（提取 PNG/JPG 中隐藏的最低位）
     Edenfall.use('lsb').extract(imageData);          // → 字节数组
     // 频谱提示（玩家在自己的频谱分析工具里查看）
     Edenfall.use('spectrum').hint('5.7Hz');          // → 文字提示
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── 零宽字符隐写 ──
   使用四个不可见字符作为二进制两位：
   U+200B ZERO WIDTH SPACE        → 00
   U+200C ZERO WIDTH NON-JOINER   → 01
   U+200D ZERO WIDTH JOINER        → 10
   U+200E LEFT-TO-RIGHT MARK      → 11
   信息用这四个字符编码到任意文本的字符之间。
*/
var ZW_CHARS = ['\u200b','\u200c','\u200d','\u200e'];

var ZeroWidth = {
  encode: function(coverText, secret){
    // 将 secret 转为 UTF-8 字节 → 每字节拆成 4 个零宽字符（每字符编码 2 位）
    var bytes = new TextEncoder().encode(secret);
    var bits = '';
    for(var i=0;i<bytes.length;i++) bits += bytes[i].toString(2).padStart(8,'0');
    var zw = '';
    for(var j=0;j<bits.length;j+=2){
      var idx = parseInt(bits.substr(j,2),2);
      zw += ZW_CHARS[idx];
    }
    return coverText + zw;
  },
  decode: function(text){
    // 提取所有零宽字符 → 二进制 → 字节
    var bits = '';
    for(var i=0;i<text.length;i++){
      var ch = text[i];
      var idx = ZW_CHARS.indexOf(ch);
      if(idx>=0) bits += idx.toString(2).padStart(2,'0');
    }
    var bytes = [];
    for(var j=0;j<bits.length;j+=8){
      var b = bits.substr(j,8);
      if(b.length<8) break;
      bytes.push(parseInt(b,2));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  },
  isZWChar: function(c){
    return ZW_CHARS.indexOf(c) >= 0;
  }
};

/* ── 图像 LSB（最低位）提取 ──
   在浏览器中：先把图像绘制到 canvas，再用 getImageData 取像素，
   每个像素 RGB 各取最低位 → 重组为字节流。
*/
var LSB = {
  /**
   * 从 ImageData 中提取 LSB 编码的字节数组
   * 默认读取每个像素 R 通道的 LSB（最简单变体）
   * 终止符：连续 8 个 0 字节
   */
  extract: function(imageData, opts){
    opts = opts || {};
    var channels = opts.channels || ['r','g','b']; // 读哪几个通道
    var bitOrder = opts.bitOrder || 'msb';         // 'msb' 或 'lsb'
    var terminator = opts.terminator !== false;    // 默认有终止符
    var maxBytes = opts.maxBytes || 100000;        // 安全上限
    
    var bits = '';
    var bytes = [];
    var ended = false;
    var pixels = imageData.data;
    
    for(var i=0; i<pixels.length && !ended; i+=4){
      var pixel = [pixels[i], pixels[i+1], pixels[i+2]];
      for(var c=0; c<channels.length && !ended; c++){
        var ch = channels[c];
        var bit = pixel[['r','g','b'].indexOf(ch)] & 1;
        bits += bit.toString();
        if(bits.length===8){
          var b = parseInt(bits, 2);
          bits = '';
          if(terminator && b===0){
            ended = true;
          } else {
            bytes.push(b);
            if(bytes.length>=maxBytes) ended = true;
          }
        }
      }
    }
    return {
      bytes: new Uint8Array(bytes),
      text:  new TextDecoder().decode(new Uint8Array(bytes))
    };
  },
  /**
   * 把字节数组编码进 LSB（用于生成谜题图片，需要后端图像处理库）
   * 浏览器内不实现，留给 Node 端 PIL/Pillow 脚本（见 docs/STEGO_NOTES.md）
   */
  encode: null
};

/* ── 频谱提示 ──
   玩家在 Audacity / SoX / 浏览器频谱分析器中打开 WAV 时，
   提供引导文字：哪个频段、寻找什么特征。
*/
var Spectrum = {
  hints: {
    '5.7Hz': {
      band: '5.5–6.0 Hz',
      lookFor: '微弱的 91 个尖峰，间距约 0.17 Hz',
      tool: 'Audacity → Tracks → Spectrogram → Linear frequency scale, range 0-30 Hz',
      expect: '隐藏莫尔斯码（见 cipher.js morse）'
    },
    '17kHz': {
      band: '16.5–17.5 kHz',
      lookFor: '白噪声中含一段反向语音',
      tool: 'Audacity → Effect → Reverse → Reverse',
      expect: '一段 4 秒电子语音（章节 99 真相）'
    },
    '32Hz': {
      band: '31.0–33.0 Hz',
      lookFor: '一段重复的方波 + 间断的 5.7 Hz 基频',
      tool: 'Audacity → Spectrogram → log scale',
      expect: '一组素数规律（来自 91 符号分析）'
    }
  },
  hint: function(bandKey){
    return Spectrum.hints[bandKey] || null;
  }
};

/* ── 注册 ── */
window.Edenfall = window.Edenfall || {};
var existing = window.Edenfall.use;
window.Edenfall.use = function(name){
  if(name==='zw' || name==='zerowidth' || name==='zero-width') return ZeroWidth;
  if(name==='lsb')  return LSB;
  if(name==='spectrum') return Spectrum;
  if(typeof existing === 'function') return existing(name);
  throw new Error('unknown module: '+name);
};
window.Edenfall.modules = (window.Edenfall.modules||[]).concat(['zw','lsb','spectrum']);

console.log('[Edenfall] stego.js loaded. Modules: zw, lsb, spectrum');

})();