import React from 'react';
export const CodecBestQuality: PreferredCodec = {mimeType: 'BEST_QUALITY'};
export const CodecDefault: PreferredCodec = {mimeType: 'DEFAULT'};

export const preferCodecEquals = (a: PreferredCodec, b: PreferredCodec): boolean => {
    return a.mimeType === b.mimeType && a.sdpFmtpLine === b.sdpFmtpLine;
};

export const codecName = (mimeType: string): string => {
    switch (mimeType) {
        case CodecBestQuality.mimeType:
            return 'Preset: Best Quality';
        case CodecDefault.mimeType:
            return 'Preset: Browser Default';
        default:
            return mimeType;
    }
};

export const resolveCodecPlaceholder = (
    codec: PreferredCodec | undefined
): PreferredCodec | undefined => {
    switch (codec?.mimeType) {
        case CodecBestQuality.mimeType:
            return {
                mimeType: 'video/VP9',
                sdpFmtpLine: 'profile-id=2',
            };
        case CodecDefault.mimeType:
            return undefined;
        default:
            return codec;
    }
};

export interface Settings {
    name?: string;
    displayMode: VideoDisplayMode;
    preferCodec?: PreferredCodec;
    maxBitrate?: number;
    videoConstraints?: VideoConstraints;
    audioConstraints?: AudioConstraints;
}
export interface PreferredCodec {
    mimeType: string;
    sdpFmtpLine?: string;
}
export interface VideoConstraints {
    width?: number;
    height?: number;
    frameRate?: number;
}
export interface AudioConstraints {
    autoGainControl?: boolean;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
}

export enum VideoDisplayMode {
    FitToWindow = 'FitToWindow',
    FitWidth = 'FitWidth',
    FitHeight = 'FitHeight',
    OriginalSize = 'OriginalSize',
}

const SettingsKey = 'screegoSettings';

export const loadSettings = (): Settings => {
    const settings: Partial<Settings> = JSON.parse(localStorage.getItem(SettingsKey) ?? '{}') ?? {};

    const defaults: Settings = {
        displayMode: VideoDisplayMode.FitToWindow,
        maxBitrate: 4194304,
        videoConstraints: {
            width: 1280,
            height: 720,
            frameRate: 30,
        },
        audioConstraints: {
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false,
        },
    };

    if (settings && typeof settings === 'object') {
        return {
            ...defaults,
            ...settings,
            displayMode:
                Object.values(VideoDisplayMode).find((mode) => mode === settings.displayMode) ??
                VideoDisplayMode.FitToWindow,
            preferCodec: settings.preferCodec ?? CodecDefault,
            videoConstraints: {
                ...defaults.videoConstraints,
                ...settings.videoConstraints,
            },
            audioConstraints: {
                ...defaults.audioConstraints,
                ...settings.audioConstraints,
            },
        };
    }
    return defaults;
};

export const saveSettings = (settings: Settings): void => {
    localStorage.setItem(SettingsKey, JSON.stringify(settings));
};

export const useSettings = (): [Settings, (s: Settings) => void] => {
    const [settings, setSettings] = React.useState(loadSettings);

    return [
        settings,
        (newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
        },
    ];
};
