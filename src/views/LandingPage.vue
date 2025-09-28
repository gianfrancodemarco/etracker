<template>
    <v-main class="d-flex align-center justify-center" style="min-height: 100vh;">
        <v-container class="text-center">
            <h1 class="mb-6">eTracker</h1>
            <p class="mb-8">Simple portfolio tracker</p>
            <v-btn color="primary" size="large" :to="{ name: 'dashboard' }">Go to Dashboard</v-btn>
        </v-container>
    </v-main>
</template>

<script>
export default {
    name: 'LandingPage'
}
</script>

<style scoped>
h1 {
    font-weight: 700;
}
</style>
