<script setup lang="ts">
import protobuf from "protobufjs"

const PROTO_SCHEMA = `syntax = "proto3";

package demo;

message UserProfile {
  uint32 id = 1;
  string name = 2;
  string email = 3;
  repeated string tags = 4;
}`

const root = protobuf.parse(PROTO_SCHEMA).root
const UserProfile = root.lookupType("demo.UserProfile")

const form = reactive({
  id: 1001,
  name: "Ada Lovelace",
  email: "ada@example.com",
  tags: "nuxt, shadcn, protobuf"
})

const encodedBase64 = ref("")
const encodedHex = ref("")
const decodedJson = ref("")
const errorMessage = ref("")
const statusMessage = ref("")

function parseTags(value: string) {
  return value
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean)
}

function toPayload() {
  return {
    id: Number(form.id),
    name: form.name.trim(),
    email: form.email.trim(),
    tags: parseTags(form.tags)
  }
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join(" ")
}

function uint8ArrayToBase64(bytes: Uint8Array) {
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

function base64ToUint8Array(input: string) {
  const normalized = input.replace(/\s+/g, "")
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

function encodeMessage() {
  try {
    const payload = toPayload()
    const verifyError = UserProfile.verify(payload)

    if (verifyError) {
      throw new Error(verifyError)
    }

    const message = UserProfile.create(payload)
    const bytes = UserProfile.encode(message).finish() as Uint8Array

    encodedBase64.value = uint8ArrayToBase64(bytes)
    encodedHex.value = toHex(bytes)
    decodedJson.value = JSON.stringify(payload, null, 2)
    errorMessage.value = ""
    statusMessage.value = `已编码 ${bytes.length} bytes`
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "编码失败"
    statusMessage.value = ""
  }
}

function decodeMessage() {
  try {
    if (!encodedBase64.value.trim()) {
      throw new Error("请先输入 Base64 数据")
    }

    const bytes = base64ToUint8Array(encodedBase64.value)
    const message = UserProfile.decode(bytes)
    const object = UserProfile.toObject(message, {
      defaults: true,
      arrays: true
    }) as {
      id: number
      name: string
      email: string
      tags: string[]
    }

    form.id = Number(object.id)
    form.name = object.name
    form.email = object.email
    form.tags = object.tags.join(", ")
    encodedHex.value = toHex(bytes)
    decodedJson.value = JSON.stringify(object, null, 2)
    errorMessage.value = ""
    statusMessage.value = `已解码 ${bytes.length} bytes`
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "解码失败"
    statusMessage.value = ""
  }
}

function fillSample() {
  form.id = 20260318
  form.name = "Grace Hopper"
  form.email = "grace.hopper@example.com"
  form.tags = "compiler, navy, cobol"
  encodeMessage()
}

onMounted(() => {
  encodeMessage()
})
</script>

<template>
  <main class="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
    <section class="space-y-3">
      <Badge variant="secondary">Nuxt 4 + shadcn-vue + protobufjs</Badge>
      <h1 class="text-3xl font-semibold tracking-tight">Protobuf Demo Playground</h1>
      <p class="text-sm text-muted-foreground md:text-base">
        输入用户数据，点击按钮体验 Protobuf 编码与解码，并查看 Base64 / Hex / JSON 三种结果。
      </p>
    </section>

    <section class="mt-8 grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>输入数据</CardTitle>
          <CardDescription>Message: <code>demo.UserProfile</code></CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="id">ID (uint32)</Label>
            <Input id="id" v-model="form.id" type="number" min="0" />
          </div>

          <div class="grid gap-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="form.name" placeholder="Ada Lovelace" />
          </div>

          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="form.email" type="email" placeholder="ada@example.com" />
          </div>

          <div class="grid gap-2">
            <Label for="tags">Tags (逗号分隔)</Label>
            <Input id="tags" v-model="form.tags" placeholder="nuxt, shadcn, protobuf" />
          </div>

          <div class="flex flex-wrap gap-3 pt-2">
            <Button @click="encodeMessage">编码为 Protobuf</Button>
            <Button variant="outline" @click="decodeMessage">从 Base64 解码</Button>
            <Button variant="secondary" @click="fillSample">加载样例</Button>
          </div>

          <p v-if="statusMessage" class="text-xs text-muted-foreground">{{ statusMessage }}</p>
          <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>.proto Schema</CardTitle>
          <CardDescription>当前页面直接解析该 schema</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea :model-value="PROTO_SCHEMA" readonly class="min-h-[300px] font-mono text-xs" />
        </CardContent>
      </Card>
    </section>

    <Separator class="my-8" />

    <section class="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Encoded Payload</CardTitle>
          <CardDescription>可编辑 Base64，再点击“从 Base64 解码”</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="base64">Base64</Label>
            <Textarea
              id="base64"
              v-model="encodedBase64"
              class="min-h-[160px] font-mono text-xs"
              placeholder="编码后会在这里显示"
            />
          </div>
          <div class="grid gap-2">
            <Label for="hex">Hex</Label>
            <Textarea id="hex" :model-value="encodedHex" readonly class="min-h-[120px] font-mono text-xs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decoded JSON</CardTitle>
          <CardDescription>Protobuf 解码结果（默认带字段默认值）</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea :model-value="decodedJson" readonly class="min-h-[330px] font-mono text-xs" />
        </CardContent>
      </Card>
    </section>
  </main>
</template>
