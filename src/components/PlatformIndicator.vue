<!-- Platform Indicator Component (always include in dev) -->
<template>
	<div class="platform-indicator" v-if="isDevelopment">
		<q-chip :color="platformColor" text-color="white" icon="info">
			{{ platformText }}
		</q-chip>
	</div>
</template>

<script setup>
	import { Capacitor } from '@capacitor/core';
	import { computed } from 'vue';

	// Use Vite syntax
	const isDevelopment = import.meta.env.MODE === 'development';

	const isNative = Capacitor.isNativePlatform();
	const platform = Capacitor.getPlatform();

	const platformColor = computed(() => {
		return isNative ? 'positive' : 'info';
	});

	const platformText = computed(() => {
		if (isNative) {
			return `Native: ${platform}`;
		}
		return 'SPA/Web Mode';
	});
</script>

<style scoped>
	.platform-indicator {
		position: fixed;
		top: 10px;
		right: 10px;
		z-index: 9999;
	}
</style>
