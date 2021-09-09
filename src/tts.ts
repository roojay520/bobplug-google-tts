import querystring from 'querystring';
import * as Bob from '@bob-plug/core';
import { userAgent } from './util';
import { noStandardToStandard } from './lang';

interface QueryOption {
  timeout?: number;
  from?: Bob.Language;
  tld?: string;
}

/**
 * @description google 语种检测
 * @param {string} text 需要查询的文字
 * @param {object} [options={}]
 * @return {string} 识别的语言类型
 */
async function _detect(text: string, options: QueryOption = {}) {
  const { tld = 'cn', timeout = 10000 } = options;
  const query = {
    client: 'gtx',
    sl: 'auto',
    dj: '1',
    ie: 'UTF-8',
    oe: 'UTF-8',
  };
  const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
    Bob.api.$http.post({
      url: `https://translate.google.${tld}/translate_a/single?${querystring.stringify(query)}`,
      timeout,
      header: { 'User-Agent': userAgent },
      body: { q: text },
    }),
  );
  if (err) Bob.api.$log.error(err);
  let lang = res?.data?.src;
  lang = noStandardToStandard(lang);
  return lang;
}

/**
 * @description google tts 发音
 * @param {string} text 需要查询的文字
 * @param {object} [options={}]
 * @return {string} tts 音频 url
 */
function _audio(text: string, options: QueryOption = {}) {
  const { from, tld = 'cn' } = options;
  const query = {
    client: 'gtx',
    tl: from,
    ie: 'UTF-8',
    q: text,
    ttsspeed: 1,
    total: 1,
    idx: 0,
    textlen: text.length,
    prev: 'input',
  };
  return `https://translate.google.${tld}/translate_tts?${querystring.stringify(query)}`;
}

async function _tts(text: string, options: QueryOption = {}): Promise<Bob.TTSResult> {
  const { from = 'auto', tld = 'cn' } = options;
  const lang = await _detect(text, options);
  const ttsUrl = _audio(text, { tld, from: lang || from });
  return { type: 'url', value: ttsUrl };
}

export { _tts };
