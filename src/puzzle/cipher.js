/* ════════════════════════════════════════════════════════════════
   cipher.js — 古典密码工具集
   EDENFALL 项目谜题引擎（玩家和分析师都可使用）
   用法：
     <script src="src/puzzle/cipher.js"></script>
     Edenfall.use('vigenere').decode('KHJP...', 'SARA');     // → CHAPTER01...
     Edenfall.use('base64').decode('aGVsbG8=');              // → "hello"
     Edenfall.use('sha256').digest('hello');                  // → hex
     Edenfall.use('morse').decode('.... . .-.. .-.. ---');    // → "HELLO"
     Edenfall.use('hex').toText('68656c6c6f');                // → "hello"
     Edenfall.use('binary').toText('01101000...');            // → "hello"
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var Utils = {
  b64enc: function(s){ return btoa(unescape(encodeURIComponent(s))); },
  b64dec: function(s){ try { return decodeURIComponent(escape(atob(s))); } catch(_e){ return null; } },
  hexToBytes: function(h){
    var u8 = new Uint8Array(h.length/2);
    for(var i=0;i<h.length;i+=2) u8[i/2] = parseInt(h.substr(i,2),16);
    return u8;
  },
  bytesToHex: function(u8){
    var s=''; for(var i=0;i<u8.length;i++) s+=u8[i].toString(16).padStart(2,'0');
    return s;
  },
  strToBytes: function(s){ return new TextEncoder().encode(s); },
  bytesToStr: function(u8){ return new TextDecoder().decode(u8); }
};

/* ── Caesar ── */
var Caesar = {
  shift: function(text, k, decode){
    k = ((k%26)+26)%26;
    if(decode) k = -k;
    var out='';
    for(var i=0;i<text.length;i++){
      var c = text.charCodeAt(i), ch = text[i];
      if(/[A-Za-z]/.test(ch)){
        var base = c<97?65:97;
        out += String.fromCharCode((c-base+k+520)%26+base);
      } else out += ch;
    }
    return out;
  },
  decode: function(text, k){ return Caesar.shift(text, k, true); },
  encode: function(text, k){ return Caesar.shift(text, k, false); }
};

/* ── Vigenère（同时加密字母+数字） ── */
var Vigenere = {
  _shift: function(text, key, decode){
    var out='', k=0;
    for(var i=0;i<text.length;i++){
      var ch = text[i], c = text.charCodeAt(i);
      if(/[A-Za-z]/.test(ch)){
        var base = c<97?65:97;
        var kc = key.charCodeAt(k%key.length);
        var shift = (kc<97?kc-65:kc-97);
        if(decode) shift = -shift;
        out += String.fromCharCode((c-base-shift+520)%26+base);
        k++;
      } else if(/[0-9]/.test(ch)){
        var kc = key.charCodeAt(k%key.length);
        var shift = (kc<97?kc-65:kc-97);
        if(decode) shift = -shift;
        out += String.fromCharCode(((c-48-shift)%10+10)%10+48);
        k++;
      } else out += ch;
    }
    return out;
  },
  decode: function(text, key){ return Vigenere._shift(text, key, true); },
  encode: function(text, key){ return Vigenere._shift(text, key, false); }
};

/* ── Base64 ── */
var Base64 = {
  encode: Utils.b64enc,
  decode: function(s){ var r = Utils.b64dec(s); if(r===null) throw new Error('invalid base64'); return r; }
};

/* ── Base32 (RFC 4648) ── */
var Base32 = {
  ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  decode: function(s){
    s = s.replace(/=+$/,'').toUpperCase().replace(/\s+/g,'');
    var bits = '';
    for(var i=0;i<s.length;i++){
      var idx = Base32.ALPHABET.indexOf(s[i]);
      if(idx<0) throw new Error('invalid base32 char: '+s[i]);
      bits += idx.toString(2).padStart(5,'0');
    }
    var out = '';
    for(var j=0;j+8<=bits.length;j+=8){
      out += String.fromCharCode(parseInt(bits.substr(j,8),2));
    }
    return out;
  },
  encode: function(s){
    var bits = '';
    for(var i=0;i<s.length;i++) bits += s.charCodeAt(i).toString(2).padStart(8,'0');
    var out = '';
    for(var j=0;j<bits.length;j+=5){
      var chunk = bits.substr(j,5);
      if(chunk.length<5) chunk = chunk.padEnd(5,'0');
      out += Base32.ALPHABET[parseInt(chunk,2)];
    }
    return out;
  }
};

/* ── Hex ── */
var Hex = {
  toText: function(h){
    var s = h.replace(/\s+/g,'');
    var u8 = Utils.hexToBytes(s);
    return Utils.bytesToStr(u8);
  },
  fromText: function(s){
    var u8 = Utils.strToBytes(s);
    return Utils.bytesToHex(u8);
  }
};

/* ── Binary ── */
var Binary = {
  toText: function(b){
    var s = b.replace(/\s+/g,'');
    var out = '';
    for(var i=0;i<s.length;i+=8){
      var c = s.substr(i,8);
      if(c.length<8) break;
      out += String.fromCharCode(parseInt(c,2));
    }
    return out;
  },
  fromText: function(s){
    var bits = '';
    for(var i=0;i<s.length;i++) bits += s.charCodeAt(i).toString(2).padStart(8,'0');
    return bits;
  }
};

/* ── Morse (国际摩斯) ── */
var Morse = {
  TABLE: {
    'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....',
    'I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.',
    'Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-',
    'Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
    '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
    '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.','(':'-.--.',
    ')':'-.--.-','&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.',
    '-':'-....-','_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.'
  },
  REVERSE: null, // 本族
  _buildReverse: function(){
    var r = {};
    for(var k in Morse.TABLE) r[Morse.TABLE[k]] = k;
    Morse.REVERSE = r;
  },
  encode: function(text){
    var out = [];
    var u = text.toUpperCase();
    for(var i=0;i<u.length;i++){
      var c = u[i];
      if(c===' ') out.push('/');
      else if(Morse.TABLE[c]) out.push(Morse.TABLE[c]);
    }
    return out.join(' ');
  },
  decode: function(morse){
    if(!Morse.REVERSE) Morse._buildReverse();
    var tokens = morse.trim().split(/\s+/);
    var out = '', word = false;
    for(var i=0;i<tokens.length;i++){
      if(tokens[i]==='/'){ out += ' '; word=false; }
      else if(Morse.REVERSE[tokens[i]]){ out += Morse.REVERSE[tokens[i]]; word=true; }
      else if(tokens[i]===''){ if(word){ out += ' '; word=false; } }
      else { out += '?'; }
    }
    return out.trim();
  }
};

/* ── SHA-256 (Web Crypto API) ── */
var Sha256 = {
  digest: async function(text){
    var buf = await crypto.subtle.digest('SHA-256', Utils.strToBytes(text));
    return Utils.bytesToHex(new Uint8Array(buf));
  },
  digestSync: function(text){
    // Node 兼容（在浏览器中提示）
    if(typeof require==='function' && !crypto.subtle){
      return require('crypto').createHash('sha256').update(text,'utf8').digest('hex');
    }
    throw new Error('use async digest() in browser');
  }
};

/* ── AES-256-CBC (Web Crypto API) ── */
var AES = {
  deriveKey: async function(password, salt, iterations){
    var mat = await crypto.subtle.importKey('raw', Utils.strToBytes(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name:'PBKDF2', salt:Utils.strToBytes(salt||'EFSEVENFALL_SALT_2019'), iterations:iterations||12000, hash:'SHA-256' },
      mat,
      { name:'AES-CBC', length:256 },
      false, ['encrypt','decrypt']
    );
  },
  decrypt: async function(password, b64cipher, salt, iterations){
    var s = b64cipher.replace(/\s+/g,'');
    var iv = Utils.hexToBytes(s.substr(0,32));
    var ct = Uint8Array.from(atob(s.substr(32)), function(c){return c.charCodeAt(0);});
    var key = await AES.deriveKey(password, salt, iterations);
    var pt = await crypto.subtle.decrypt({name:'AES-CBC', iv:iv}, key, ct);
    return Utils.bytesToStr(new Uint8Array(pt));
  },
  encrypt: async function(password, plaintext, salt, iterations){
    var key = await AES.deriveKey(password, salt, iterations);
    var iv  = crypto.getRandomValues(new Uint8Array(16));
    var ct  = await crypto.subtle.encrypt({name:'AES-CBC', iv:iv}, key, Utils.strToBytes(plaintext));
    var out = new Uint8Array(iv.length + ct.byteLength);
    out.set(iv, 0); out.set(new Uint8Array(ct), iv.length);
    return Utils.bytesToHex(out);
  }
};

/* ── 注册到 Edenfall 命名空间 ── */
window.Edenfall = window.Edenfall || {};
window.Edenfall.use = function(name){
  switch(name.toLowerCase()){
    case 'caesar':    return Caesar;
    case 'vigenere':  return Vigenere;
    case 'base64':    return Base64;
    case 'base32':    return Base32;
    case 'hex':       return Hex;
    case 'binary':    return Binary;
    case 'morse':     return Morse;
    case 'sha256':    return Sha256;
    case 'aes':       return AES;
    default: throw new Error('unknown module: '+name);
  }
};
window.Edenfall.modules = ['caesar','vigenere','base64','base32','hex','binary','morse','sha256','aes'];

console.log('[Edenfall] cipher.js loaded. Modules: '+window.Edenfall.modules.join(', '));

})();