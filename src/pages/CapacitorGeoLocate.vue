<script setup>
	import { ref } from 'vue';
	import { Geolocation } from '@capacitor/geolocation';
	import { Capacitor } from '@capacitor/core';

	// Reactive state
	const coordinates = ref(null);
	const watchId = ref(null);
	const error = ref(null);
	const isWatching = ref(false);
	const permissionStatus = ref(null);
	const loading = ref(false);

	// Check permissions on component mount
	const checkPermissions = async () => {
		try {
			const permissions = await Geolocation.checkPermissions();
			permissionStatus.value = permissions.location;
		} catch (err) {
			error.value = 'Failed to check permissions: ' + err.message;
		}
	};

	// Request permissions
	const requestPermissions = async () => {
		try {
			const permissions = await Geolocation.requestPermissions();
			permissionStatus.value = permissions.location;
		} catch (err) {
			error.value = 'Failed to request permissions: ' + err.message;
		}
	};

	// Get current position
	const getCurrentPosition = async () => {
		error.value = null;
		loading.value = true;

		try {
			const position = await Geolocation.getCurrentPosition({
				enableHighAccuracy: true,
				timeout: 10000,
			});

			coordinates.value = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
				accuracy: position.coords.accuracy,
				timestamp: new Date(position.timestamp).toLocaleString(),
			};
		} catch (err) {
			error.value = 'Failed to get location: ' + err.message;
		} finally {
			loading.value = false;
		}
	};

	// Start watching position
	const startWatching = async () => {
		if (isWatching.value) return;

		error.value = null;
		isWatching.value = true;

		try {
			watchId.value = await Geolocation.watchPosition(
				{
					enableHighAccuracy: true,
					timeout: 10000,
				},
				(position, err) => {
					if (err) {
						error.value = 'Watch error: ' + err.message;
						return;
					}

					coordinates.value = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						accuracy: position.coords.accuracy,
						timestamp: new Date(position.timestamp).toLocaleString(),
					};
				}
			);
		} catch (err) {
			error.value = 'Failed to start watching: ' + err.message;
			isWatching.value = false;
		}
	};

	// Stop watching position
	const stopWatching = async () => {
		if (!isWatching.value || !watchId.value) return;

		try {
			await Geolocation.clearWatch({ id: watchId.value });
			watchId.value = null;
			isWatching.value = false;
		} catch (err) {
			error.value = 'Failed to stop watching: ' + err.message;
		}
	};

	// Initialize permissions check
	checkPermissions();
</script>

<template>
	<q-page class="q-pa-md">
		<div class="q-gutter-md">
			<h4>Capacitor Geolocation Demo</h4>

			<!-- Platform Info -->
			<q-card class="q-mb-md">
				<q-card-section>
					<div class="text-h6">Platform Information</div>
					<p>Platform: {{ Capacitor.getPlatform() }}</p>
					<p>
						Native Platform: {{ Capacitor.isNativePlatform() ? 'Yes' : 'No' }}
					</p>
				</q-card-section>
			</q-card>

			<!-- Permission Status -->
			<q-card class="q-mb-md">
				<q-card-section>
					<div class="text-h6">Permission Status</div>
					<p>
						Location Permission:
						<q-chip
							:color="
								permissionStatus === 'granted'
									? 'positive'
									: permissionStatus === 'denied'
									? 'negative'
									: 'warning'
							"
							text-color="white"
						>
							{{ permissionStatus || 'Unknown' }}
						</q-chip>
					</p>
					<q-btn
						v-if="permissionStatus !== 'granted'"
						color="primary"
						label="Request Permissions"
						@click="requestPermissions"
					/>
				</q-card-section>
			</q-card>

			<!-- Controls -->
			<q-card class="q-mb-md">
				<q-card-section>
					<div class="text-h6">Location Controls</div>
					<div class="q-gutter-sm">
						<q-btn
							color="primary"
							label="Get Current Position"
							@click="getCurrentPosition"
							:loading="loading"
							:disable="permissionStatus !== 'granted'"
						/>

						<q-btn
							v-if="!isWatching"
							color="secondary"
							label="Start Watching"
							@click="startWatching"
							:disable="permissionStatus !== 'granted'"
						/>

						<q-btn
							v-if="isWatching"
							color="negative"
							label="Stop Watching"
							@click="stopWatching"
						/>
					</div>
				</q-card-section>
			</q-card>

			<!-- Results -->
			<q-card v-if="coordinates" class="q-mb-md">
				<q-card-section>
					<div class="text-h6">Location Data</div>
					<q-list>
						<q-item>
							<q-item-section>
								<q-item-label>Latitude</q-item-label>
								<q-item-label caption>{{ coordinates.latitude }}</q-item-label>
							</q-item-section>
						</q-item>

						<q-item>
							<q-item-section>
								<q-item-label>Longitude</q-item-label>
								<q-item-label caption>{{ coordinates.longitude }}</q-item-label>
							</q-item-section>
						</q-item>

						<q-item>
							<q-item-section>
								<q-item-label>Accuracy</q-item-label>
								<q-item-label caption
									>{{ coordinates.accuracy }} meters</q-item-label
								>
							</q-item-section>
						</q-item>

						<q-item>
							<q-item-section>
								<q-item-label>Timestamp</q-item-label>
								<q-item-label caption>{{ coordinates.timestamp }}</q-item-label>
							</q-item-section>
						</q-item>
					</q-list>
				</q-card-section>
			</q-card>

			<!-- Error Display -->
			<q-banner v-if="error" class="text-white bg-negative">
				<template v-slot:avatar>
					<q-icon name="error" color="white" />
				</template>
				{{ error }}
				<template v-slot:action>
					<q-btn flat color="white" label="Dismiss" @click="error = null" />
				</template>
			</q-banner>

			<!-- Navigation -->
			<q-btn
				color="primary"
				label="Back to Home"
				@click="$router.push('/')"
				flat
			/>
		</div>
	</q-page>
</template>

<style scoped>
	/* Add styles here if needed */
</style>
