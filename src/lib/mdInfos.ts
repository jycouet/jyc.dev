import { getFilesUnder, read } from '@kitql/internals'

export const getMdsInfo = () => {
  const files = getFilesUnder('./src/lib/content').reverse()

  return files.map((file) => {
    return { link_under_blog: file.replace(/\.md$/, '') }
  })
}

export const getMdInfo = (link_under_blog: string) => {
  const source = read(`./src/lib/content/${link_under_blog}.md`) ?? ''

  const date = link_under_blog.split('-').slice(0, 3).join('-')
  const slug = link_under_blog.split('-').slice(3).join('-')

  const { metadata, content } = extractMarkdownInfo(source)
  const title = metadata.title ?? slug.replaceAll('-', ' ')

  return { link_under_blog, date, title, source: content }
}

const extractMarkdownInfo = (markdown: string) => {
  const charactersBetweenGroupedHyphens = /^---([\s\S]*?)---/
  const metadataMatched = markdown.match(charactersBetweenGroupedHyphens)
  const metadata = metadataMatched?.[1]

  if (!metadata) {
    return { metadata: {}, content: markdown }
  }

  const metadataLines = metadata.split('\n')
  const metadataObject = metadataLines.reduce((accumulator: Record<string, string>, line) => {
    const [key, ...value] = line.split(':').map((part) => part.trim())
    if (key) accumulator[key] = value[1] ? value.join(':') : value.join('')
    return accumulator
  }, {})

  return {
    metadata: metadataObject,
    content: markdown.replace(metadataMatched[0], ''),
  }
}
