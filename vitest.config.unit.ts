import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
    test: {
        include: ['tests/unit/**/*.test.ts'],
        coverage: {
            enabled: true,
            reporter: ['cobertura'],
            provider: 'istanbul',
            reportsDirectory: './reports/coverage',
            include: ['src/lib/**/*.ts']
        },
    }
}));