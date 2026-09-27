/**
 * 轻量 Markdown 渲染器
 *
 * 为什么不用 marked：本站一贯避免多余依赖（上传接口也是自己写的，没上 multer）。
 * 个人学习笔记用不到完整 CommonMark，覆盖常用语法就够；而且自己写能做到
 * 「先整体转义、再插入标签」，天然免疫 XSS —— 引库反而要额外再配一层净化。
 *
 * 支持：标题 / 粗体 / 斜体 / 删除线 / 行内代码 / 代码块 / 有序无序列表（含嵌套）
 *      / 引用 / 表格 / 分割线 / 链接 / 图片
 *
 * 安全约定：
 *   1. 所有文本先过 escapeHtml，再由行内规则插入我们自己的标签。
 *      所以 `<script>` 进来会变成 &lt;script&gt;，只会显示成文字。
 *   2. 链接与图片的 url 走 safeUrl 白名单，挡掉 javascript: 这类伪协议。
 *   3. 本模块的返回值只能交给 dangerouslySetInnerHTML —— 别在别处拼字符串。
 */

const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESCAPE[c])
}

/** 只放行 http/https/mailto/tel，以及不带协议的相对路径 */
function safeUrl(url) {
  if (!url) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return /^(?:https?|mailto|tel):/i.test(url)
  return true
}

/* 行内语法用到的占位符：把行内代码抽出来，避免里面的 * _ [ ] 被当成语法 */
const CODE_SLOT = '\u0000'

const RE = {
  fence: /^\s*(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/,
  hr: /^\s*([-*_])(?:\s*\1){2,}\s*$/,
  heading: /^(#{1,6})\s+(.*)$/,
  quote: /^\s*>\s?/,
  list: /^(\s*)([-*+]|\d+[.)])\s+(.*)$/,
  tableSep: /^\s*\|?[\s:|-]*-[\s:|-]*\|[\s:|-]*$/,
}

function isBlockStart(line) {
  return (
    RE.fence.test(line) ||
    RE.hr.test(line) ||
    RE.heading.test(line) ||
    RE.quote.test(line) ||
    RE.list.test(line)
  )
}

/* ===== 行内 ===== */

function inline(raw) {
  // 所有会生成 HTML 标签的规则都先抽成占位符，最后统一还原。
  //
  // 为什么必须这样：粗斜体规则是拿正则去扫整串文本的，如果标签已经插进去了，
  // 它会连标签属性一起误伤 —— 比如 `target="_blank"` 里的 `_blank_` 会被
  // 当成斜体语法，渲染成 target="<em>blank"。抽成占位符后，粗斜体规则
  // 只能扫到纯文本和 \u0000N\u0000，就不会碰到标签了。
  const slots = []
  const hold = (html) => {
    slots.push(html)
    return `${CODE_SLOT}${slots.length - 1}${CODE_SLOT}`
  }

  let s = escapeHtml(raw)

  s = s.replace(/`([^`\n]+)`/g, (_, code) => hold(`<code class="md-code">${code}</code>`))

  // 图片要放在链接前面，否则 ![alt](url) 会被链接规则先吃掉
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) =>
    safeUrl(url) ? hold(`<img class="md-img" src="${url}" alt="${alt}" loading="lazy" />`) : m,
  )

  // 链接文本此时已经过 escape，直接嵌进去是安全的
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) =>
    safeUrl(url)
      ? hold(`<a class="md-a" href="${url}" target="_blank" rel="noreferrer">${text}</a>`)
      : m,
  )

  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  s = s.replace(/(^|[^_\w])_([^_\n]+)_/g, '$1<em>$2</em>')
  s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>')

  s = s.replace(new RegExp(`${CODE_SLOT}(\\d+)${CODE_SLOT}`, 'g'), (_, n) => slots[+n])

  // 段内换行保留成 <br>。标准 Markdown 会把它并成空格，
  // 但中文笔记里「写一行 = 想换行」更符合直觉。必须放最后，前面的规则都靠 \n 划界。
  return s.replace(/\n/g, '<br />')
}

/* ===== 块级 ===== */

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

function alignStyle(spec) {
  return spec ? ` style="text-align:${spec}"` : ''
}

/** 列表。缩进更深的行归到上一条目下面，形成嵌套 */
function parseList(lines, start) {
  const first = lines[start].match(RE.list)
  const baseIndent = first[1].length
  const ordered = /^\d/.test(first[2])
  const items = []
  let i = start

  while (i < lines.length) {
    const m = lines[i].match(RE.list)
    if (!m || m[1].length < baseIndent) break

    if (m[1].length > baseIndent) {
      const sub = parseList(lines, i)
      if (items.length) items[items.length - 1].sub += sub.html
      i = sub.next
      continue
    }

    let text = m[3]
    i++
    // 该条目的续行（不是新条目、也不是别的块）
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      text += '\n' + lines[i].trim()
      i++
    }
    items.push({ text, sub: '' })
  }

  const tag = ordered ? 'ol' : 'ul'
  const html =
    `<${tag} class="md-list">` +
    items.map((it) => `<li class="md-li">${inline(it.text)}${it.sub}</li>`).join('') +
    `</${tag}>`

  return { html, next: i }
}

function parseBlocks(lines, start = 0) {
  const out = []
  let i = start

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    // 代码块：内部原样保留，只做转义，不再跑行内规则
    const fence = line.match(RE.fence)
    if (fence) {
      const close = new RegExp('^\\s*' + fence[1] + '\\s*$')
      const buf = []
      i++
      while (i < lines.length && !close.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++
      const lang = fence[2]
      out.push(
        `<pre class="md-pre"${lang ? ` data-lang="${escapeHtml(lang)}"` : ''}>` +
          `<code>${escapeHtml(buf.join('\n'))}</code></pre>`,
      )
      continue
    }

    if (RE.hr.test(line)) {
      out.push('<hr class="md-hr" />')
      i++
      continue
    }

    const heading = line.match(RE.heading)
    if (heading) {
      const lv = heading[1].length
      out.push(`<h${lv} class="md-h md-h${lv}">${inline(heading[2])}</h${lv}>`)
      i++
      continue
    }

    if (RE.quote.test(line)) {
      const buf = []
      while (i < lines.length && RE.quote.test(lines[i])) {
        buf.push(lines[i].replace(RE.quote, ''))
        i++
      }
      out.push(`<blockquote class="md-quote">${parseBlocks(buf)}</blockquote>`)
      continue
    }

    // 表格：当前行含 | 且下一行是分隔行
    if (line.includes('|') && i + 1 < lines.length && RE.tableSep.test(lines[i + 1])) {
      const head = splitRow(line)
      const aligns = splitRow(lines[i + 1]).map((c) => {
        const left = c.startsWith(':')
        const right = c.endsWith(':')
        if (left && right) return 'center'
        if (right) return 'right'
        if (left) return 'left'
        return ''
      })
      i += 2
      const rows = []
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) {
        rows.push(splitRow(lines[i]))
        i++
      }
      const th = head
        .map((c, n) => `<th${alignStyle(aligns[n])}>${inline(c)}</th>`)
        .join('')
      const tb = rows
        .map(
          (r) =>
            '<tr>' +
            head.map((_, n) => `<td${alignStyle(aligns[n])}>${inline(r[n] ?? '')}</td>`).join('') +
            '</tr>',
        )
        .join('')
      out.push(
        '<div class="md-table-wrap"><table class="md-table">' +
          `<thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`,
      )
      continue
    }

    if (RE.list.test(line)) {
      const r = parseList(lines, i)
      out.push(r.html)
      i = r.next
      continue
    }

    // 段落
    const buf = []
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      buf.push(lines[i].trim())
      i++
    }
    out.push(`<p class="md-p">${inline(buf.join('\n'))}</p>`)
  }

  return out.join('\n')
}

/**
 * 把 Markdown 源码渲染成 HTML 字符串。
 * 返回值只应交给 dangerouslySetInnerHTML。
 */
export function renderMarkdown(src) {
  if (!src || !String(src).trim()) return ''
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n')
  return parseBlocks(lines)
}

/** 取第一个一级标题当标题用（没有就返回空串） */
export function extractTitle(src) {
  const m = String(src || '').match(/^\s*#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}
