<script setup lang="ts">
import landingImage from "~/assets/images/full-bg.jpg"

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const countdown = ref(5)
const isRedirecting = ref(false)
let countdownTimer: ReturnType<typeof setInterval> | undefined

const targetUrl = computed(() => {
  const queryTo = Array.isArray(route.query.to) ? route.query.to[0] : route.query.to
  const raw = String(queryTo || runtimeConfig.public.landingRedirectUrl || "").trim()

  try {
    const parsed = new URL(raw)
    return ["http:", "https:"].includes(parsed.protocol)
      ? parsed.toString()
      : runtimeConfig.public.landingRedirectUrl
  }
  catch {
    return runtimeConfig.public.landingRedirectUrl
  }
})

async function goToTarget() {
  if (isRedirecting.value || !targetUrl.value) {
    return
  }

  isRedirecting.value = true
  await navigateTo(targetUrl.value, {
    external: true
  })
}

onMounted(() => {
  countdownTimer = setInterval(async () => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      await goToTarget()
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-black text-white">
    <div
      class="absolute inset-0 scale-110 bg-cover bg-center opacity-35 blur-md"
      :style="{ backgroundImage: `url(${landingImage})` }"
    />

    <div class="relative mx-auto flex min-h-screen max-w-[430px] items-center justify-center p-4">
      <button
        type="button"
        class="group relative w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl transition active:scale-[0.99]"
        @click="goToTarget"
      >
        <img
          :src="landingImage"
          alt="小说落地页海报"
          class="h-auto w-full object-cover"
        >
        <div class="pointer-events-none absolute inset-0 ring-0 ring-white/40 transition group-hover:ring-2" />
      </button>

      <div class="absolute bottom-6 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 space-y-2">
        <Button class="h-12 w-full text-base font-semibold" @click="goToTarget">
          {{ isRedirecting ? "正在跳转..." : `点击继续阅读（${countdown}s）` }}
        </Button>
        <p class="text-center text-xs text-white/75">
          支持参数：<code>?to=https://your-target-url</code>
        </p>
      </div>
    </div>
  </main>
</template>
