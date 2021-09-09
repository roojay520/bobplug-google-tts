import * as Bob from '@bob-plug/core';
import { getSupportLanguages } from './lang';

import { _tts } from './tts';

// 使用 bob 实现的 require 方法加载本地库,
var formatString = require('./libs/human-string');

export function supportLanguages(): Bob.supportLanguages {
  return getSupportLanguages();
}

// https://ripperhe.gitee.io/bob/#/plugin/quickstart/tts
export function tts(query: Bob.TTSQuery, completion: Bob.Completion) {
  const { text = '', lang } = query;
  const str = formatString(text);
  const params = { from: lang, tld: Bob.api.getOption('tld') };
  let res = _tts(str, params);
  res
    .then((result) => completion({ result }))
    .catch((error) => {
      Bob.api.$log.error(JSON.stringify(error));
      if (error?.type) return completion({ error });
      completion({ error: Bob.util.error('api', '插件出错', error) });
    });
}
