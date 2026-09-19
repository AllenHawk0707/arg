/* ════════════════════════════════════════════════════════════════
   search.js — 现实搜索提示器
   EDENFALL 项目谜题引擎
   
   本文件**不真实访问互联网**。它生成给玩家的搜索引导：
   "去 Google 搜索 <query>"，让玩家在真实浏览器中执行。
   这是 ARG 现实关联层的标准做法——避免服务器依赖、保留玩家体验。
   
   用法：
     <script src="src/puzzle/search.js"></script>
     Edenfall.use('search').prompt('Symbol Lattice Hypothesis', { site: 'archive.org' });
     Edenfall.use('search').clue('bridge-00-001');   // 给出谜题的现实提示
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ── 搜索提示模板 ── */
var Search = {
  prompt: function(query, opts){
    opts = opts || {};
    var site = opts.site ? ' site:'+opts.site : '';
    var tld  = opts.tld || 'com';
    var lang = opts.lang || '';
    var url = 'https://www.google.'+tld+'/search?q='+encodeURIComponent(query)+site+'&hl='+lang;
    var msg = '[external search]\n  query: "'+query+'"\n  '+url+'\n\n  (在浏览器中打开此链接。EF 不替你访问现实。)';
    console.log(msg);
    return msg;
  },
  promptBing: function(query, opts){
    opts = opts || {};
    var site = opts.site ? ' site:'+opts.site : '';
    var url = 'https://www.bing.com/search?q='+encodeURIComponent(query)+site;
    var msg = '[external search]\n  query: "'+query+'"\n  '+url;
    console.log(msg);
    return msg;
  },
  promptDuck: function(query, opts){
    opts = opts || {};
    var site = opts.site ? ' site:'+opts.site : '';
    var url = 'https://duckduckgo.com/?q='+encodeURIComponent(query)+site;
    console.log('[external search]\n  query: "'+query+'"\n  '+url);
    return url;
  },
  /* 多搜索引擎一次给出 */
  all: function(query, opts){
    return [
      Search.prompt(query, opts),
      Search.promptBing(query, opts),
      Search.promptDuck(query, opts)
    ].join('\n\n');
  }
};

/* ── 谜题桥接（按 ID 给出预制搜索提示） ── */
var Clues = {
  /* ── 章节 0 ── */
  'bridge-00-001': {
    title: 'EF-7 信号源',
    description: '确认你解码出的经纬度对应冰岛哪个位置。',
    prompts: [
      'Vestmannaeyjar research station 2019 2023',
      '"EF-7" Vestmannaeyjar NATO',
      'Heimaey Iceland coordinates 63.44 -20.27'
    ],
    fallback: 'real-world/coordinates/EF7_satellite.png'
  },
  /* ── 章节 1 ── */
  'bridge-01-001': {
    title: 'Krogh 论文',
    description: '找到 1993 年 Harald Krogh 论文《Symbol Lattice Hypothesis》的可访问副本。',
    prompts: [
      '"Symbol Lattice Hypothesis" Krogh 1993',
      'Harald Krogh symbol lattice Oslo',
      'nb.no Symbol Lattice Hypothesis'
    ],
    fallback: 'real-world/websites/nb_no_fallback.pdf'
  },
  'bridge-01-002': {
    title: 'Vestmannaeyjar 失踪人员',
    description: '查找 2023 年 EF-7 失联相关的冰岛本地新闻。',
    prompts: [
      'Vestmannaeyjar missing researchers 2023',
      '"EF-7"失踪 冰岛 2023',
      'site:mbl.is EF-7',
      'site:visir.is Vestmannaeyjar 2023 june'
    ]
  },
  /* ── 章节 2 ── */
  'bridge-02-001': {
    title: 'EF-7 通讯日志',
    description: '在 archive.org 上找到泄露的 EF-7 通讯日志（频段 5.7 Hz 录音）。',
    prompts: [
      'site:archive.org EF-7 transmissions',
      '"EF-7" archive.org 5.7 Hz',
      'Edenfall project transmissions',
      'archive.org EF7 day12 signal'
    ],
    fallback: 'archive/transmissions/EF7_day12.wav'
  },
  /* ── 章节 3 ── */
  'bridge-03-001': {
    title: 'ghost-tainted@protonmail.com',
    description: '发送邮件到 EF 协议邮箱，自动回复包含章节 3 的最后一组素数。',
    prompts: [
      'protonmail.com ghost-tainted',
      'EF Edenfall contact email',
      'PGP key ghost-tainted protonmail'
    ],
    fallback: 'real-world/emails/ghost-tainted.pgp'
  }
};

Search.clue = function(id){
  var c = Clues[id];
  if(!c) return null;
  console.log('─── '+c.title+' ───');
  console.log(c.description);
  c.prompts.forEach(function(p,i){
    console.log('\n  ['+(i+1)+'] '+Search.all(p));
  });
  if(c.fallback) console.log('\nfallback: '+c.fallback);
  return c;
};

Search.clues = Clues;

/* ── 注册 ── */
window.Edenfall = window.Edenfall || {};
var existing = window.Edenfall.use;
window.Edenfall.use = function(name){
  if(name==='search') return Search;
  if(typeof existing === 'function') return existing(name);
  throw new Error('unknown module: '+name);
};
window.Edenfall.modules = (window.Edenfall.modules||[]).concat(['search']);

console.log('[Edenfall] search.js loaded. Module: search (prompt + clue).');

})();