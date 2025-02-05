import type { EndpointId } from '@layerzerolabs/lz-definitions'
import type { IEndpoint, Timeout, Uln302ExecutorConfig, Uln302UlnConfig } from '@layerzerolabs/protocol-devtools'
import type {
    Factory,
    IOmniSDK,
    OmniAddress,
    OmniGraph,
    OmniPoint,
    OmniTransaction,
    OmniVector,
} from '@layerzerolabs/devtools'
import { ExecutorOptionType, Options } from '@layerzerolabs/lz-v2-utilities'

export interface IOApp extends IOmniSDK {
    getEndpointSDK(): Promise<IEndpoint>
    getPeer(eid: EndpointId): Promise<OmniAddress | undefined>
    hasPeer(eid: EndpointId, address: OmniAddress | null | undefined): Promise<boolean>
    setPeer(eid: EndpointId, peer: OmniAddress | null | undefined): Promise<OmniTransaction>
    getEnforcedOptions(eid: EndpointId, msgType: number): Promise<string>
    setEnforcedOptions(enforcedOptions: EnforcedOptions[]): Promise<OmniTransaction>
    encodeEnforcedOptions(enforcedOptionConfig: OAppEnforcedOptionConfig): Options
}

export type EnforcedOptions = {
    eid: EndpointId
    msgType: number
    options: string
}

export interface OAppReceiveLibraryConfig {
    receiveLibrary: string
    gracePeriod: bigint
}

export interface OAppSendConfig {
    executorConfig: Uln302ExecutorConfig
    ulnConfig: Uln302UlnConfig
}

export interface OAppReceiveConfig {
    ulnConfig: Uln302UlnConfig
}

export interface OAppEdgeConfig {
    sendLibrary?: string
    receiveLibraryConfig?: OAppReceiveLibraryConfig
    receiveLibraryTimeoutConfig?: Timeout
    sendConfig?: OAppSendConfig
    receiveConfig?: OAppReceiveConfig
    enforcedOptions?: OAppEnforcedOptionConfig[]
}

interface BaseExecutorOption {
    msgType: ExecutorOptionType
}

interface EndcodedOption extends BaseExecutorOption {
    options: string
}

interface ExecutorLzReceiveOption extends BaseExecutorOption {
    msgType: ExecutorOptionType.LZ_RECEIVE
    gas: string | number
    value: string | number
}

interface ExecutorNativeDropOption extends BaseExecutorOption {
    msgType: ExecutorOptionType.NATIVE_DROP
    amount: string | number
    receiver: string
}

interface ExecutorComposeOption extends BaseExecutorOption {
    msgType: ExecutorOptionType.COMPOSE
    index: number
    gas: string | number
    value: string | number
}

interface ExecutorOrderedExecutionOption extends BaseExecutorOption {
    msgType: ExecutorOptionType.ORDERED
}

export type OAppEnforcedOptionConfig =
    | ExecutorLzReceiveOption
    | ExecutorNativeDropOption
    | ExecutorComposeOption
    | ExecutorOrderedExecutionOption
    | EndcodedOption

export interface OAppPeers {
    vector: OmniVector
    hasPeer: boolean
}

export type OAppOmniGraph = OmniGraph<unknown, OAppEdgeConfig | undefined>

export type OAppFactory<TOApp extends IOApp = IOApp, TOmniPoint = OmniPoint> = Factory<[TOmniPoint], TOApp>
