import { Show, createSignal, onCleanup, onMount, splitProps } from 'solid-js'
import { daySinceEpoch } from '../../../../common/daysSinceEpoch'
import { config } from '../../../../common/global'
import type { ProductPriceDay } from '../../../../common/interface'
import { roundDecimal } from '../../../../common/roundDecimal'
import { ChartLine } from '../../components/ChartLine'
import { stepChart } from '../../logic/chart/stepChart'
import { transpose } from '../../logic/chart/transpose'
import { safeSha256 } from '../../logic/safeSha256'
import { imageSupport } from '../../store/imageSupport'
import { ProductCalculator } from './ProductCalculator'
import { ProductCardInfo } from './ProductCardInfo'

const bufferToUrl = (buffer: ArrayBuffer) => {
  const blob = new Blob([buffer])
  return URL.createObjectURL(blob)
}

export const ProductCard = (props: any) => {
  const [local, _] = splitProps(props, ['name', 'img', 'quantity', 'history'])
  const [isActive, setIsActive] = createSignal(false)
  const [imgUrl, setImgUrl] = createSignal('favicon-light.svg')
  const originalImage = local.img.replace('/medium/', '/large/')

  const fetchOptimisedImage = async () => {
    if (imageSupport.type === 'jpg') return false
    try {
      const imageHash = await safeSha256(originalImage)
      const url = `${config.productBaseUrl}/image/${imageHash}.${imageSupport.type}`
      const res = await fetch(url)
      if (!res.ok) return false
      setImgUrl(bufferToUrl(await res.arrayBuffer()))
      return true
    } catch {
      return false
    }
  }

  const fetchImage = async () => {
    if (imgUrl() !== 'favicon-light.svg') return
    setImgUrl('spinner.svg') // Loading image
    if (imageSupport.type === 'jpg') return setImgUrl(originalImage)
    if (await fetchOptimisedImage()) return
    setImgUrl(originalImage)
  }

  let imgRef: HTMLImageElement | undefined
  onMount(async () => {
    await fetchImage()
    if (imgRef) imgRef.onerror = () => setImgUrl('favicon-light.svg')
    addEventListener('online', fetchImage)
  })
  onCleanup(() => {
    removeEventListener('online', fetchImage)
  })

  const data = () => {
    const _data = local.history.map((p: ProductPriceDay) => [
      p.daySinceEpoch,
      roundDecimal(p.price / local.quantity, 2),
    ])
    return transpose(stepChart(_data.reverse(), daySinceEpoch))
  }

  return (
    <div class="card max-w-96 flex flex-col">
      <div
        class={`shrink-0 flex justify-between ${
          isActive() ? 'h-48 rounded-lg border-b border-neutral-light' : 'h-28'
        }`}
      >
        <button
          type="button"
          onclick={() => setIsActive(!isActive())}
          class={`h-full aspect-square shrink-0 rounded-lg bg-white border-r ${
            isActive() ? 'p-6' : 'p-3'
          }`}
        >
          <img
            ref={imgRef!}
            class="object-cover select-none h-full aspect-square"
            src={imgUrl()}
            alt={local.name}
            aria-label={local.name}
          />
        </button>
        <div class="p-3 h-full flex-grow flex flex-col gap-2">
          <Show
            when={false}
            fallback={<ProductCardInfo isActive={isActive()} {...props} />}
          >
            <ProductCalculator {...props} amount={local.quantity} />
          </Show>
        </div>
      </div>
      <Show when={isActive()}>
        <div class="p-4">
          <div class="">
            <ChartLine data={data()} />
          </div>
        </div>
      </Show>
    </div>
  )
}
