import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Autocomplete,
    Box,
    Typography,
    Stack,
    Checkbox,
    FormGroup,
    FormControlLabel,
} from '@mui/material';
import {
    CodecBestQuality,
    CodecDefault,
    codecName,
    loadSettings,
    PreferredCodec,
    Settings,
    VideoDisplayMode,
} from './settings';

interface NumericTextFieldProps {
    label: string;
    value?: number;
    setValue: (value: number) => void;
}

const NumericTextField = ({label, value, setValue}: NumericTextFieldProps) => {
    const [input, setInput] = React.useState(value?.toString() ?? '0');

    return (
        <TextField
            margin="dense"
            label={label}
            value={input}
            onChange={(e) => {
                setInput(e.target.value);
                setValue(Math.max(parseInt(e.target.value) || 0, 0));
            }}
        />
    );
};

export interface SettingDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    updateName: (s: string) => void;
    saveSettings: (s: Settings) => void;
}

const getAvailableCodecs = (): PreferredCodec[] => {
    if ('getCapabilities' in RTCRtpSender) {
        return RTCRtpSender.getCapabilities('video')?.codecs ?? [];
    }
    return [];
};

const NativeCodecs = getAvailableCodecs();

export const SettingDialog = ({open, setOpen, updateName, saveSettings}: SettingDialogProps) => {
    const [settingsInput, setSettingsInput] = React.useState(loadSettings);

    const doSubmit = () => {
        saveSettings(settingsInput);
        updateName(settingsInput.name ?? '');
        setOpen(false);
    };

    const {name, preferCodec, displayMode, maxBitrate, videoConstraints, audioConstraints} =
        settingsInput;

    return (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth={'xs'} fullWidth>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                <form onSubmit={doSubmit}>
                    <Stack gap={2}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Username"
                            value={name}
                            onChange={(e) =>
                                setSettingsInput((c) => ({...c, name: e.target.value}))
                            }
                            fullWidth
                        />
                        {NativeCodecs.length > 0 ? (
                            <Autocomplete<PreferredCodec>
                                options={[CodecBestQuality, CodecDefault, ...NativeCodecs]}
                                getOptionLabel={({mimeType, sdpFmtpLine}) =>
                                    codecName(mimeType) + (sdpFmtpLine ? ` (${sdpFmtpLine})` : '')
                                }
                                value={preferCodec}
                                isOptionEqualToValue={(a, b) =>
                                    a.mimeType === b.mimeType && a.sdpFmtpLine === b.sdpFmtpLine
                                }
                                fullWidth
                                onChange={(_, value) =>
                                    setSettingsInput((c) => ({
                                        ...c,
                                        preferCodec: value ?? undefined,
                                    }))
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Preferred Codec" />
                                )}
                            />
                        ) : undefined}
                        <NumericTextField
                            label="Max Bitrate"
                            value={maxBitrate}
                            setValue={(v) =>
                                setSettingsInput((c) => ({
                                    ...c,
                                    maxBitrate: v,
                                }))
                            }
                        />
                        <Autocomplete<VideoDisplayMode>
                            options={Object.values(VideoDisplayMode)}
                            onChange={(_, value) =>
                                setSettingsInput((c) => ({
                                    ...c,
                                    displayMode: value ?? VideoDisplayMode.FitToWindow,
                                }))
                            }
                            value={displayMode}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="Display Mode" />}
                        />
                    </Stack>
                    <Stack sx={{mt: 4}} gap={2}>
                        <Typography variant="subtitle2">Video Constraints</Typography>
                        <Stack direction="row" gap={2}>
                            <NumericTextField
                                label="Width"
                                value={videoConstraints?.width}
                                setValue={(v) =>
                                    setSettingsInput((c) => ({
                                        ...c,
                                        videoConstraints: {
                                            ...c.videoConstraints,
                                            width: v,
                                        },
                                    }))
                                }
                            />
                            <NumericTextField
                                label="Height"
                                value={videoConstraints?.height}
                                setValue={(v) =>
                                    setSettingsInput((c) => ({
                                        ...c,
                                        videoConstraints: {
                                            ...c.videoConstraints,
                                            height: v,
                                        },
                                    }))
                                }
                            />
                        </Stack>
                        <NumericTextField
                            label="Frame Rate"
                            value={videoConstraints?.frameRate}
                            setValue={(v) =>
                                setSettingsInput((c) => ({
                                    ...c,
                                    videoConstraints: {
                                        ...c.videoConstraints,
                                        frameRate: v,
                                    },
                                }))
                            }
                        />
                    </Stack>
                    <Box sx={{mt: 4}}>
                        <Typography variant="subtitle2">Audio Constraints</Typography>
                        <FormGroup>
                            <FormControlLabel
                                label="Auto Gain Control"
                                control={
                                    <Checkbox
                                        value={audioConstraints?.autoGainControl}
                                        onChange={(e) =>
                                            setSettingsInput((c) => ({
                                                ...c,
                                                audioConstraints: {
                                                    ...c.audioConstraints,
                                                    autoGainControl: e.target.checked,
                                                },
                                            }))
                                        }
                                    />
                                }
                            />
                            <FormControlLabel
                                label="Echo Cancellation"
                                control={
                                    <Checkbox
                                        value={audioConstraints?.echoCancellation}
                                        onChange={(e) =>
                                            setSettingsInput((c) => ({
                                                ...c,
                                                audioConstraints: {
                                                    ...c.audioConstraints,
                                                    echoCancellation: e.target.checked,
                                                },
                                            }))
                                        }
                                    />
                                }
                            />
                            <FormControlLabel
                                label="Noise Suppression"
                                control={
                                    <Checkbox
                                        value={audioConstraints?.noiseSuppression}
                                        onChange={(e) =>
                                            setSettingsInput((c) => ({
                                                ...c,
                                                audioConstraints: {
                                                    ...c.audioConstraints,
                                                    noiseSuppression: e.target.checked,
                                                },
                                            }))
                                        }
                                    />
                                }
                            />
                        </FormGroup>
                    </Box>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} color="primary">
                    Cancel
                </Button>
                <Button onClick={doSubmit} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
