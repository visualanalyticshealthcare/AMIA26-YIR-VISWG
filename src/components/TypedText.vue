<script setup lang="ts">
/** A line of text that types itself out (typed.js) the first time its slide is entered. */
import { ref } from 'vue'
import { escapeHtml, useTypeOnEnter } from '../composables/useTypeOnEnter'

const props = withDefaults(defineProps<{ text: string; as?: string; speed?: number }>(), { as: 'span', speed: 28 })
const el = ref<HTMLElement>()
useTypeOnEnter(el, () => escapeHtml(props.text), props.speed)
</script>

<template>
  <component :is="as" ref="el" class="typed-text" />
</template>
