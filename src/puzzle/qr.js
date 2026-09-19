/* ════════════════════════════════════════════════════════════════
   qr.js — 二维码生成/解码占位
   EDENFALL 项目谜题引擎
   
   真实实现依赖第三方（MIT 许可）：
     - 生成：davidshimjs/qrcodejs (https://github.com/davidshimjs/qrcodejs)
     - 解码：jsQR (https://github.com/cozmo/jsQR)
   
   本文件提供：
     1. encode() 占位（接 d2jzx 或自动 fallback 到伪 QR 网格）
     2. decode() 通过调用 jsQR 库解码图像
     3. matrix() 把任意字符串映射到一个简化的伪 QR 网格（用于占位/预览）
   
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

function djb2(s){
  var h = 5381;
  for(var i=0;i<s.length;i++) h = ((h<<5)+h+s.charCodeAt(i))|0;
  return (h>>>0);
}

/* ── 伪 QR（占位用，不能被真实扫码工具识别） ──
   把字符串 hash 后映射到 25x25 网格。设计意图：玩家看到这个"QR-like"
   方块知道下一步要扫码找什么内容，但实际二维码用真实工具生成。
*/
var QRPlaceholder = {
  matrix: function(text, size){
    size = size || 25;
    var seed = djb2(text);
    var grid = [];
    for(var y=0;y<size;y++){
      var row = '';
      for(var x=0;x<size;x++){
        var inFinder = (
          (x<3 && y<3) ||
          (x>=size-3 && y<3) ||
          (x<3 && y>=size-3)
        );
        if(inFinder) row += '#';
        else {
          var bit = (seed + (x*73856093) ^ (y*19349663)) & 1;
          row += bit ? '#' : '.';
        }
      }
      grid.push(row);
    }
    return grid;
  },
  toASCII: function(text, size){
    var m = QRPlaceholder.matrix(text, size);
    return m.map(function(r){return r.replace(/#/g,'██').replace(/\./g,'  ');}).join('\n');
  }
};

/* ── 真实 QR 适配（qrcodejs / jsQR 库需自行引入） ── */
var QR = {
  encode: function(text, targetEl){
    if(typeof window.QRCode !== 'undefined'){
      window.QRCode.toCanvas(targetEl||document.createElement('canvas'), text, function(err){
        if(err) console.error('[qr] encode error', err);
      });
      return true;
    }
    console.warn('[qr] qrcodejs 库未加载。占位 ASCII：');
    console.log(QRPlaceholder.toASCII(text));
    return false;
  },
  preview: function(text){
    return QRPlaceholder.toASCII(text, 25);
  },
  decode: function(imageData){
    if(typeof window.jsQR === 'undefined'){
      throw new Error('[qr] jsQR 库未加载，无法解码');
    }
    return window.jsQR(imageData.data, imageData.width, imageData.height);
  }
};

/* ── 注册 ── */
window.Edenfall = window.Edenfall || {};
var existing = window.Edenfall.use;
window.Edenfall.use = function(name){
  if(name==='qr') return QR;
  if(typeof existing === 'function') return existing(name);
  throw new Error('unknown module: '+name);
};
window.Edenfall.modules = (window.Edenfall.modules||[]).concat(['qr']);

console.log('[Edenfall] qr.js loaded. Module: qr (placeholder + adapter)。');

})();