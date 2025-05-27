<template>
	<q-page class="flex flex-center">
		<div class="column items-center q-gutter-md">
			<img
				alt="Quasar logo"
				src="~assets/quasar-logo-vertical.svg"
				style="width: 200px; height: 200px"
			/>

			<q-btn
				color="primary"
				label="Go to Geolocate Page"
				@click="$router.push('/geolocation')"
			/>

			<q-btn
				color="primary"
				label="Go to Alternative Geolocate Page"
				@click="$router.push('/geolocation2')"
			/>

			<!-- Tutorial Blog Info Box -->
			<q-card
				class="q-mt-lg q-pa-md"
				style="max-width: 400px; background: #f5faff"
			>
				<q-card-section>
					<div class="text-h6">Tutorial Blog</div>
					<div class="q-mt-sm">
						The following is a link to my tutorial blog for how this app was
						created/scaffolded.
					</div>
					<div class="q-mt-md">
						<a
							href="https://tenace2.github.io/QuasarInstallGuide3/quasarscaffold/quasarscaffold.html"
							target="_blank"
							rel="noopener"
							class="text-primary text-weight-bold"
						>
							Visit the Quasar Scaffold Tutorial
						</a>
					</div>
				</q-card-section>
			</q-card>
		</div>
	</q-page>
</template>

<script setup>
	defineOptions({
		name: 'IndexPage',
	});
</script>
