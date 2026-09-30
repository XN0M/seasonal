declare module 'lottie-web/build/player/lottie_light' {
  import type {AnimationItem,AnimationConfigWithData} from 'lottie-web'
  const lottie:{loadAnimation(config:AnimationConfigWithData<'svg'>):AnimationItem}
  export default lottie
}
