// place files you want to import through the `$lib` alias in this folder.
export async function fetchImageAsBase64(url: string) {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      redirect: 'follow',
    })
    const arrayBuffer = await response.arrayBuffer()
    // @ts-ignore
    const base64String = Buffer.from(arrayBuffer).toString('base64')
    return base64String
  } catch (error) {
    console.error('Failed to fetch and convert image', error)
  }
}
