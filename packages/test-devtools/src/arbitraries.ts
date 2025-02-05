import fc from 'fast-check'
import { EndpointId, Stage } from '@layerzerolabs/lz-definitions'
import { ENDPOINT_IDS } from './constants'

export const nullishArbitrary = fc.constantFrom(null, undefined)

export const nullableArbitrary = <T>(a: fc.Arbitrary<T>) => fc.oneof(a, nullishArbitrary)

export const addressArbitrary = fc.string()

export const evmAddressArbitrary = fc.hexaString({ minLength: 40, maxLength: 40 }).map((address) => `0x${address}`)

export const evmBytes32Arbitrary = fc.hexaString({ minLength: 64, maxLength: 64 }).map((address) => `0x${address}`)

export const endpointArbitrary: fc.Arbitrary<EndpointId> = fc.constantFrom(...ENDPOINT_IDS)

export const stageArbitrary: fc.Arbitrary<Stage> = fc.constantFrom(Stage.MAINNET, Stage.TESTNET, Stage.SANDBOX)

export const pointArbitrary = fc.record({
    eid: endpointArbitrary,
    address: evmAddressArbitrary,
})

export const vectorArbitrary = fc.record({
    from: pointArbitrary,
    to: pointArbitrary,
})
